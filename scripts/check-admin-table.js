const { Client } = require('pg');

async function checkAdminTable() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://workshop_diskominfo_db_user:aOUl0HSSMJ6RRmXjGLtwazpSpdw0KJuA@dpg-d2qdqnadbo4c73c0r0vg-a.oregon-postgres.render.com/workshop_diskominfo_db?sslmode=require&connect_timeout=10'
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Check if admins table exists
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'admins'
      );
    `);
    
    console.log('📋 Admins table exists:', tableExists.rows[0].exists);

    if (tableExists.rows[0].exists) {
      // Get table structure
      const structure = await client.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'admins' 
        ORDER BY ordinal_position;
      `);
      
      console.log('📋 Admin table structure:');
      structure.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });

      // Check if there are any records
      const count = await client.query('SELECT COUNT(*) FROM admins');
      console.log(`👥 Total admins: ${count.rows[0].count}`);

      if (parseInt(count.rows[0].count) > 0) {
        const admins = await client.query('SELECT * FROM admins LIMIT 5');
        console.log('👤 Sample admin records:');
        admins.rows.forEach((admin, index) => {
          console.log(`  ${index + 1}. ID: ${admin.id}, Username: ${admin.username || 'N/A'}, Email: ${admin.email || 'N/A'}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkAdminTable();