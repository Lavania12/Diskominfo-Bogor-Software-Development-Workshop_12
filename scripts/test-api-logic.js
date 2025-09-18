const { initializeDatabase, getAdminModel } = require('../lib/sequelize');
const bcrypt = require('bcrypt');

async function testApiLogic() {
  try {
    console.log('1. Initializing database...');
    await initializeDatabase();
    
    console.log('2. Getting Admin model...');
    const Admin = getAdminModel();
    console.log('Admin model:', Admin);
    
    console.log('3. Testing admin lookup...');
    const admin = await Admin.findOne({ where: { email: 'fanani@diskominfo.go.id' } });
    console.log('Found admin:', admin ? 'Yes' : 'No');
    
    if (admin) {
      console.log('Admin data:', {
        id: admin.id,
        email: admin.email,
        username: admin.username,
        hasPassword: !!admin.password
      });
      
      console.log('4. Testing password verification...');
      const isValidPassword = await bcrypt.compare('admin123', admin.password);
      console.log('Password valid:', isValidPassword);
      
      if (isValidPassword) {
        console.log('✅ API logic should work!');
        
        // Test the response data structure
        const adminData = {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          created_at: admin.created_at
        };
        console.log('Response data:', adminData);
      }
    }
    
  } catch (error) {
    console.error('Error in API logic test:', error.message);
    console.error('Stack:', error.stack);
  }
}

testApiLogic();
