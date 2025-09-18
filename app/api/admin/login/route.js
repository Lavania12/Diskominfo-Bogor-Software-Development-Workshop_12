import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { Op } from "sequelize";
import { initializeDatabase } from "../../../../lib/sequelize";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    // Initialize database connection
    await initializeDatabase();
    // Load Admin model after DB init to ensure env is available
    const { getAdminModel } = require("../../../../lib/sequelize");
    const Admin = getAdminModel();

    const { email, password } = await request.json();

    // Validasi input
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email dan password wajib diisi" },
        { status: 400 }
      );
    }

    // Cari admin berdasarkan email
    const admin = await Admin.findOne({ 
      where: { email: email }
    });

    if (!admin) {
      return NextResponse.json(
        { message: "Email atau password salah" },
        { status: 401 }
      );
    }

    // Verifikasi password
    const isValidPassword = await bcrypt.compare(password, admin.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { message: "Email atau password salah" },
        { status: 401 }
      );
    }

    // Note: last_login column doesn't exist in current database
    // await admin.update({ last_login: new Date() });

    // Return success response (tanpa password)
    const adminData = {
      id: admin.id,
      email: admin.email,
      created_at: admin.created_at
    };

    return NextResponse.json({
      message: "Login berhasil",
      admin: adminData
    });

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
