const https = require('https');
const http = require('http');

async function testAdminAPI() {
  try {
    console.log('Testing admin submissions API...');
    
    // Test 1: Basic request
    console.log('\n1. Testing basic admin submissions...');
    const basicResponse = await makeRequest('/api/admin/submissions');
    console.log('Basic response status:', basicResponse.status);
    console.log('Basic results count:', basicResponse.data ? basicResponse.data.length : 0);
    
    // Test 2: With search
    console.log('\n2. Testing with search...');
    const searchParams = new URLSearchParams({
      q: 'test',
      sort: 'createdAt',
      order: 'desc'
    });
    
    const searchResponse = await makeRequest(`/api/admin/submissions?${searchParams.toString()}`);
    console.log('Search response status:', searchResponse.status);
    console.log('Search results count:', searchResponse.data ? searchResponse.data.length : 0);
    
    if (searchResponse.status !== 200) {
      console.log('Error response:', searchResponse.data);
    }
    
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: response
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

testAdminAPI();
