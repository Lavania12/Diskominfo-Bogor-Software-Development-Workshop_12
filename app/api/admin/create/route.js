import { NextResponse } from "next/server";
import { initializeDatabase } from "@/lib/sequelize";
import { hashPassword, validatePasswordStrength, isCommonPassword } from "@/lib/auth";

export const runtime = "nodejs";

// Input validation for admin creation
const validateAdminInput = (email, password) => {
  const errors = {};
  
  // Email validation
  if (!email || typeof email !== 'string') {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Invalid email format";
  } else if (email.length > 255) {
    errors.email = "Email is too long";
  }
  
  // Password validation
  if (!password || typeof password !== 'string') {
    errors.password = "Password is required";
  } else {
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.errors.join(', ');
    }
    
    if (isCommonPassword(password)) {
      errors.password = "Password is too common. Please choose a stronger password.";
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export async function POST(request) {
  try {
    // Initialize database connection
    await initializeDatabase();
    const { getAdminModel } = require("@/lib/sequelize");
    const Admin = getAdminModel();
    
    // Parse request body
    const body = await request.json();
    const { email, password } = body;
    
    // Input validation
    const validation = validateAdminInput(email, password);
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
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      where: { email: email.toLowerCase().trim() }
    });
    
    if (existingAdmin) {
      return NextResponse.json(
        { 
          success: false,
          message: "Admin with this email already exists",
          type: "EMAIL_EXISTS"
        },
        { status: 409 }
      );
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create new admin
    const newAdmin = await Admin.create({
      email: email.toLowerCase().trim(),
      password: hashedPassword
    });
    
    // Prepare response (exclude password)
    const adminData = {
      id: newAdmin.id,
      email: newAdmin.email,
      created_at: newAdmin.created_at
    };
    
    console.log(`✅ New admin created: ${email}`);
    
    return NextResponse.json({
      success: true,
      message: "Admin created successfully",
      admin: adminData
    }, { status: 201 });
    
  } catch (error) {
    console.error("Create Admin Error:", error);
    
    return NextResponse.json(
      { 
        success: false,
        message: "Failed to create admin",
        type: "CREATION_ERROR"
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
