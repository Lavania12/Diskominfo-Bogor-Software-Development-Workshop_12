const { initializeDatabase, getSequelize } = require('../lib/sequelize');

async function debugAdminQuery() {
  try {
    await initializeDatabase();
    const sequelize = getSequelize();
    
    // Test raw query first
    console.log('1. Testing raw SQL query...');
    const [rawResults] = await sequelize.query("SELECT * FROM admins WHERE email = 'fanani@diskominfo.go.id'");
    console.log('Raw query results:', rawResults.length);
    if (rawResults.length > 0) {
      console.log('Raw admin data:', {
        id: rawResults[0].id,
        email: rawResults[0].email,
        hasPassword: !!rawResults[0].password
      });
    }
    
    // Test Sequelize model
    console.log('2. Testing Sequelize model...');
    const { getAdminModel } = require('../lib/sequelize');
    const Admin = getAdminModel();
    
    const admin = await Admin.findOne({ 
      where: { email: 'fanani@diskominfo.go.id' },
      logging: console.log // Enable query logging
    });
    
    console.log('Sequelize result:', admin ? 'Found' : 'Not found');
    if (admin) {
      console.log('Admin data:', {
        id: admin.id,
        email: admin.email,
        hasPassword: !!admin.password
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

debugAdminQuery();
