const https = require('https');
const http = require('http');

async function testCorrectLogin() {
  try {
    const postData = JSON.stringify({
      email: 'admin@diskominfo.go.id', // Use the correct email that exists
      password: 'admin123'
    });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    console.log('Testing login with correct email: admin@diskominfo.go.id');
    console.log('Request data:', postData);

    const req = http.request(options, (res) => {
      console.log(`Status: ${res.statusCode}`);
      console.log(`Headers:`, res.headers);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('Response body:', data);
        try {
          const response = JSON.parse(data);
          console.log('Parsed response:', JSON.stringify(response, null, 2));
        } catch (e) {
          console.log('Could not parse response as JSON');
        }
      });
    });

    req.on('error', (error) => {
      console.error('Request error:', error.message);
    });

    req.write(postData);
    req.end();
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

testCorrectLogin();
