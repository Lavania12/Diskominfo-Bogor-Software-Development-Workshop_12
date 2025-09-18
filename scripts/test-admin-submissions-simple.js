const http = require('http');

async function testAdminSubmissions() {
  try {
    console.log('Testing admin submissions API...');
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/submissions',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      console.log(`Status: ${res.statusCode}`);
      console.log(`Headers:`, res.headers);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('Response body length:', data.length);
        try {
          const response = JSON.parse(data);
          console.log('Response type:', Array.isArray(response) ? 'Array' : typeof response);
          if (Array.isArray(response)) {
            console.log('Submissions count:', response.length);
            if (response.length > 0) {
              console.log('First submission:', {
                id: response[0].id,
                nama: response[0].nama,
                status: response[0].status,
                tracking_code: response[0].tracking_code
              });
            }
          } else {
            console.log('Response:', response);
          }
        } catch (e) {
          console.log('Could not parse JSON:', data.substring(0, 200));
        }
      });
    });

    req.on('error', (error) => {
      console.error('Request error:', error.message);
    });

    req.end();
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

testAdminSubmissions();
