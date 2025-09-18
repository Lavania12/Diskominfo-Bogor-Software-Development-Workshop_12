const { initializeDatabase } = require("../lib/sequelize");
const { hashPassword, generateSecurePassword } = require("../lib/auth");

async function createTestAdmin() {
  try {
    console.log("🔧 Creating test admin account...");
    
    // Initialize database
    await initializeDatabase();
    const { getAdminModel } = require("../lib/sequelize");
    const Admin = getAdminModel();
    
    // Test admin credentials
    const testEmail = "test@diskominfo.go.id";
    const testPassword = "TestAdmin123!";
    
    // Check if test admin already exists
    const existingAdmin = await Admin.findOne({
      where: { email: testEmail }
    });
    
    if (existingAdmin) {
      console.log("✅ Test admin already exists:");
      console.log(`📧 Email: ${existingAdmin.email}`);
      console.log(`🆔 ID: ${existingAdmin.id}`);
      console.log(`📅 Created: ${existingAdmin.created_at}`);
      return;
    }
    
    // Hash password
    const hashedPassword = await hashPassword(testPassword);
    
    // Create test admin
    const testAdmin = await Admin.create({
      email: testEmail,
      password: hashedPassword
    });
    
    console.log("✅ Test admin created successfully!");
    console.log("📧 Email:", testAdmin.email);
    console.log("🔑 Password:", testPassword);
    console.log("🆔 ID:", testAdmin.id);
    console.log("📅 Created:", testAdmin.created_at);
    
    console.log("\n🚀 You can now test login with:");
    console.log(`Email: ${testEmail}`);
    console.log(`Password: ${testPassword}`);
    
  } catch (error) {
    console.error("❌ Error creating test admin:", error.message);
    process.exit(1);
  }
}

createTestAdmin();
