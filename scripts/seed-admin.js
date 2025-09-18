const bcrypt = require("bcrypt");
const { initializeDatabase } = require("../lib/sequelize");

async function seedAdmin() {
  try {
    console.log("🌱 Starting admin seeding process...");
    
    // Initialize database
    await initializeDatabase();
    const { getAdminModel } = require("../lib/sequelize");
    const Admin = getAdminModel();

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      where: {
        [require("sequelize").Op.or]: [
          { email: "admin@diskominfo.bogor.go.id" },
          { username: "admin" }
        ]
      }
    });

    if (existingAdmin) {
      console.log("✅ Admin user already exists:", existingAdmin.email);
      return;
    }

    // Create default admin
    const hashedPassword = await bcrypt.hash("admin123", 10);
    
    const admin = await Admin.create({
      username: "admin",
      email: "admin@diskominfo.bogor.go.id",
      password: hashedPassword
    });

    console.log("✅ Default admin created successfully!");
    console.log("📧 Email:", admin.email);
    console.log("👤 Username:", admin.username);
    console.log("🔑 Password: admin123");
    console.log("⚠️  Please change the password after first login!");

  } catch (error) {
    console.error("❌ Error seeding admin:", error);
    process.exit(1);
  }
}

// Run the seeding
seedAdmin();
