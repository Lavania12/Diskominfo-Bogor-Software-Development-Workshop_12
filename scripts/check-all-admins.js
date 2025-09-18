const { initializeDatabase, getSequelize } = require('../lib/sequelize');

async function checkAllAdmins() {
  try {
    await initializeDatabase();
    const sequelize = getSequelize();
    const [results] = await sequelize.query('SELECT id, email FROM admins LIMIT 10');
    console.log('All admin records:');
    results.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.email} (ID: ${admin.id})`);
    });
    console.log(`Total: ${results.length} admins`);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkAllAdmins();
