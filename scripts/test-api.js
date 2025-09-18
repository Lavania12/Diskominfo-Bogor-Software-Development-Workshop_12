const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testAPI() {
  try {
    console.log("🧪 Testing API endpoint...");
    
    const testCredentials = [
      { username: "admin", password: "admin123" },
      { username: "admin@diskominfo-bogor.go.id", password: "admin123" }
    ];
    
    for (const cred of testCredentials) {
      console.log(`\n🔐 Testing API with: ${cred.username}`);
      
      try {
        const response = await fetch('http://localhost:3000/api/admin/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(cred)
        });
        
        const data = await response.json();
        
        console.log(`Status: ${response.status}`);
        console.log(`Response:`, data);
        
        if (response.ok) {
          console.log("✅ API login successful!");
        } else {
          console.log("❌ API login failed");
        }
        
      } catch (error) {
        console.log("❌ API request failed:", error.message);
      }
    }
    
  } catch (error) {
    console.error("❌ Error testing API:", error);
  }
}

// Run the script
testAPI();
