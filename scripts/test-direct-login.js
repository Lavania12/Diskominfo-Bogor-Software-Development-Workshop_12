const { initializeDatabase, getSequelize } = require('../lib/sequelize');
const bcrypt = require('bcrypt');

async function testDirectLogin() {
  try {
    await initializeDatabase();
    const sequelize = getSequelize();
    
    // Test direct database query
    const [results] = await sequelize.query("SELECT id, email, password FROM admins WHERE email = 'fanani@diskominfo.go.id' LIMIT 1");
    
    if (results.length === 0) {
      console.log('No admin found with email fanani@diskominfo.go.id');
      return;
    }
    
    const admin = results[0];
    console.log('Found admin:', {
      id: admin.id,
      email: admin.email,
      password_hash: admin.password.substring(0, 20) + '...'
    });
    
    // Test password verification
    const testPassword = 'admin123';
    const isValid = await bcrypt.compare(testPassword, admin.password);
    
    console.log('Password verification result:', isValid);
    
    if (isValid) {
      console.log('✅ Login should work!');
    } else {
      console.log('❌ Password verification failed');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testDirectLogin();
