const { initializeDatabase } = require("../lib/sequelize");

async function testDatabase() {
  try {
    console.log("🔌 Testing database connection...");
    
    // Initialize database
    await initializeDatabase();
    const { getAdminModel, getSequelize } = require("../lib/sequelize");
    const Admin = getAdminModel();
    const sequelize = getSequelize();

    console.log("✅ Database connected successfully!");

    // Check if admin table exists and its structure
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'admins' 
      ORDER BY ordinal_position;
    `);

    console.log("📋 Admin table structure:");
    results.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });

    // Try to find existing admins
    const adminCount = await Admin.count();
    console.log(`👥 Found ${adminCount} admin(s) in database`);

    if (adminCount > 0) {
      const admins = await Admin.findAll({
        attributes: ['id', 'username', 'email', 'created_at'],
        raw: true
      });
      console.log("👤 Existing admins:");
      admins.forEach(admin => {
        console.log(`  - ${admin.username || 'N/A'} (${admin.email || 'N/A'})`);
      });
    }

  } catch (error) {
    console.error("❌ Database test failed:", error.message);
    console.error("Full error:", error);
  }
}

testDatabase();
