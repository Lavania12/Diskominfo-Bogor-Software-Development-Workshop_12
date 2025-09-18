import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { Op } from "sequelize";
import { initializeDatabase } from "@/lib/sequelize";

export const runtime = "nodejs";

// Rate limiting store (in production, use Redis)
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

// Input validation
const validateInput = (email, password) => {
  const errors = {};
  
  if (!email || typeof email !== 'string') {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Invalid email format";
  }
  
  if (!password || typeof password !== 'string') {
    errors.password = "Password is required";
  } else if (password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Rate limiting check
const checkRateLimit = (email, ip) => {
  const key = `${email}:${ip}`;
  const now = Date.now();
  const attempts = loginAttempts.get(key) || { count: 0, lastAttempt: 0 };
  
  // Reset if lockout time has passed
  if (now - attempts.lastAttempt > LOCKOUT_TIME) {
    attempts.count = 0;
  }
  
  if (attempts.count >= MAX_ATTEMPTS) {
    return {
      allowed: false,
      remainingTime: LOCKOUT_TIME - (now - attempts.lastAttempt)
    };
  }
  
  return { allowed: true };
};

// Record failed attempt
const recordFailedAttempt = (email, ip) => {
  const key = `${email}:${ip}`;
  const now = Date.now();
  const attempts = loginAttempts.get(key) || { count: 0, lastAttempt: 0 };
  
  attempts.count += 1;
  attempts.lastAttempt = now;
  loginAttempts.set(key, attempts);
};

// Clear successful login attempts
const clearAttempts = (email, ip) => {
  const key = `${email}:${ip}`;
  loginAttempts.delete(key);
};

export async function POST(request) {
  const startTime = Date.now();
  let clientIP = "unknown";
  
  try {
    // Get client IP for rate limiting
    const forwarded = request.headers.get("x-forwarded-for");
    const realIP = request.headers.get("x-real-ip");
    clientIP = forwarded?.split(",")[0] || realIP || "unknown";
    
    // Initialize database connection
    await initializeDatabase();
    const { getAdminModel } = require("@/lib/sequelize");
    const Admin = getAdminModel();
    
    // Parse request body
    const body = await request.json();
    const { email, password } = body;
    
    // Input validation
    const validation = validateInput(email, password);
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          success: false,
          message: "Validation failed",
          errors: validation.errors 
        },
        { status: 400 }
      );
    }
    
    // Rate limiting check
    const rateLimit = checkRateLimit(email, clientIP);
    if (!rateLimit.allowed) {
      const remainingMinutes = Math.ceil(rateLimit.remainingTime / (60 * 1000));
      return NextResponse.json(
        { 
          success: false,
          message: `Too many failed attempts. Try again in ${remainingMinutes} minutes.`,
          type: "RATE_LIMITED"
        },
        { status: 429 }
      );
    }
    
    // Find admin by email
    const admin = await Admin.findOne({
      where: { 
        email: email.toLowerCase().trim()
      },
      attributes: ['id', 'email', 'password', 'created_at', 'updated_at']
    });
    
    if (!admin) {
      // Record failed attempt
      recordFailedAttempt(email, clientIP);
      
      return NextResponse.json(
        { 
          success: false,
          message: "Invalid email or password",
          type: "INVALID_CREDENTIALS"
        },
        { status: 401 }
      );
    }
    
    // Verify password using bcrypt
    const isValidPassword = await bcrypt.compare(password, admin.password);
    
    if (!isValidPassword) {
      // Record failed attempt
      recordFailedAttempt(email, clientIP);
      
      return NextResponse.json(
        { 
          success: false,
          message: "Invalid email or password",
          type: "INVALID_CREDENTIALS"
        },
        { status: 401 }
      );
    }
    
    // Clear successful login attempts
    clearAttempts(email, clientIP);
    
    // Prepare admin data (exclude password)
    const adminData = {
      id: admin.id,
      email: admin.email,
      created_at: admin.created_at,
      updated_at: admin.updated_at
    };
    
    // Log successful login
    console.log(`✅ Successful login: ${email} from ${clientIP}`);
    
    // Response with success
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      admin: adminData,
      login_time: new Date().toISOString()
    });
    
    // Add security headers
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    
    return response;
    
  } catch (error) {
    console.error("Login API Error:", {
      message: error.message,
      stack: error.stack,
      clientIP,
      timestamp: new Date().toISOString()
    });
    
    // Don't expose internal errors to client
    return NextResponse.json(
      { 
        success: false,
        message: "Internal server error. Please try again later.",
        type: "SERVER_ERROR"
      },
      { status: 500 }
    );
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json(
    { message: "Method not allowed" },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { message: "Method not allowed" },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { message: "Method not allowed" },
    { status: 405 }
  );
}
