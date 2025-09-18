const { initializeDatabase, getSubmissionModel } = require('../lib/sequelize');

async function testSimpleAdmin() {
  try {
    console.log('Testing simple admin submissions...');
    
    await initializeDatabase();
    const Submission = getSubmissionModel();
    
    console.log('Submission model:', Submission);
    
    const submissions = await Submission.findAll({
      limit: 5,
      attributes: ['id', 'tracking_code', 'nama', 'status', 'created_at']
    });
    
    console.log('Found submissions:', submissions.length);
    submissions.forEach((sub, index) => {
      console.log(`${index + 1}. ${sub.nama} (${sub.status}) - ${sub.tracking_code}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testSimpleAdmin();
