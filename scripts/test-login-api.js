const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3000/api/auth/login';

async function testLoginAPI() {
  console.log("🧪 Testing Login API...\n");
  
  const tests = [
    {
      name: "Valid Login Test",
      data: { email: "test@diskominfo.go.id", password: "TestAdmin123!" },
      expectedStatus: 200
    },
    {
      name: "Invalid Email Test",
      data: { email: "invalid@example.com", password: "TestAdmin123!" },
      expectedStatus: 401
    },
    {
      name: "Invalid Password Test",
      data: { email: "test@diskominfo.go.id", password: "wrongpassword" },
      expectedStatus: 401
    },
    {
      name: "Missing Email Test",
      data: { password: "TestAdmin123!" },
      expectedStatus: 400
    },
    {
      name: "Missing Password Test",
      data: { email: "test@diskominfo.go.id" },
      expectedStatus: 400
    },
    {
      name: "Invalid Email Format Test",
      data: { email: "invalid-email", password: "TestAdmin123!" },
      expectedStatus: 400
    },
    {
      name: "Empty Request Test",
      data: {},
      expectedStatus: 400
    }
  ];
  
  for (const test of tests) {
    try {
      console.log(`🔍 Running: ${test.name}`);
      
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(test.data)
      });
      
      const result = await response.json();
      
      if (response.status === test.expectedStatus) {
        console.log(`✅ PASS - Status: ${response.status}`);
        if (result.success) {
          console.log(`   Admin ID: ${result.admin?.id}`);
          console.log(`   Email: ${result.admin?.email}`);
        } else {
          console.log(`   Message: ${result.message}`);
        }
      } else {
        console.log(`❌ FAIL - Expected: ${test.expectedStatus}, Got: ${response.status}`);
        console.log(`   Response:`, result);
      }
      
    } catch (error) {
      console.log(`❌ ERROR - ${test.name}:`, error.message);
    }
    
    console.log(""); // Empty line for readability
  }
  
  // Test rate limiting
  console.log("🔒 Testing Rate Limiting...");
  try {
    const promises = [];
    for (let i = 0; i < 6; i++) {
      promises.push(
        fetch(API_BASE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: "test@diskominfo.go.id", password: "wrongpassword" })
        })
      );
    }
    
    const responses = await Promise.all(promises);
    const lastResponse = await responses[responses.length - 1].json();
    
    if (responses[responses.length - 1].status === 429) {
      console.log("✅ Rate limiting working correctly");
      console.log(`   Message: ${lastResponse.message}`);
    } else {
      console.log("❌ Rate limiting not working");
    }
    
  } catch (error) {
    console.log("❌ Rate limiting test error:", error.message);
  }
}

// Run tests
testLoginAPI();
