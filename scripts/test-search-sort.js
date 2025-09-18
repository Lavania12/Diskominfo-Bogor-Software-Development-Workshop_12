const https = require('https');
const http = require('http');

async function testSearchSort() {
  try {
    console.log('Testing search and sort API...');
    
    // Test 1: Basic search
    console.log('\n1. Testing search with query "test"...');
    const searchParams = new URLSearchParams({
      q: 'test',
      sort: 'createdAt',
      order: 'desc'
    });
    
    const searchResponse = await makeRequest(`/api/submissions?${searchParams.toString()}`);
    console.log('Search response status:', searchResponse.status);
    console.log('Search results count:', searchResponse.data ? searchResponse.data.length : 0);
    
    // Test 2: Sort by status
    console.log('\n2. Testing sort by status...');
    const sortParams = new URLSearchParams({
      sort: 'status',
      order: 'asc'
    });
    
    const sortResponse = await makeRequest(`/api/submissions?${sortParams.toString()}`);
    console.log('Sort response status:', sortResponse.status);
    console.log('Sort results count:', sortResponse.data ? sortResponse.data.length : 0);
    
    // Test 3: No parameters (default)
    console.log('\n3. Testing default parameters...');
    const defaultResponse = await makeRequest('/api/submissions');
    console.log('Default response status:', defaultResponse.status);
    console.log('Default results count:', defaultResponse.data ? defaultResponse.data.length : 0);
    
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

testSearchSort();
