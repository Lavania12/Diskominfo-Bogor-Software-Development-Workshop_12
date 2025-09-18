const bcrypt = require('bcrypt');

async function testLogin() {
  try {
    console.log('🔐 Testing admin login...');
    
    // Test with one of the existing admin emails
    const testEmail = 'fanani@diskominfo.go.id';
    const testPassword = 'admin123'; // This might not be the correct password
    
    console.log(`📧 Testing login with email: ${testEmail}`);
    
    // First, let's check what's in the database
    const { initializeDatabase } = require("../lib/sequelize");
    await initializeDatabase();
    const { getAdminModel } = require("../lib/sequelize");
    const Admin = getAdminModel();
    
    const admin = await Admin.findOne({ where: { email: testEmail } });
    
    if (!admin) {
      console.log('❌ Admin not found');
      return;
    }
    
    console.log('✅ Admin found:', {
      id: admin.id,
      email: admin.email,
      passwordHash: admin.password.substring(0, 20) + '...'
    });
    
    // Try to verify password
    const isValidPassword = await bcrypt.compare(testPassword, admin.password);
    console.log(`🔑 Password verification: ${isValidPassword ? 'SUCCESS' : 'FAILED'}`);
    
    if (!isValidPassword) {
      console.log('💡 Try these common passwords:');
      console.log('  - admin123');
      console.log('  - password');
      console.log('  - 123456');
      console.log('  - admin');
    }
    
  } catch (error) {
    console.error('❌ Login test failed:', error.message);
  }
}

testLogin();