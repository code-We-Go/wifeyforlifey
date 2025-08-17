// Test script to verify email notification functionality
// Run this with: node test-email.js

const testEmailAPI = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/test-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: "true"
      })
    });
    
    const result = await response.json();
    
    console.log('Response Status:', response.status);
    console.log('Response Data:', result);
    
    if (response.ok) {
      console.log('✅ Test email sent successfully!');
    } else {
      console.log('❌ Test failed:', result.message);
    }
    
  } catch (error) {
    console.error('❌ Error testing email API:', error.message);
  }
};

// Run the test
testEmailAPI();

// Alternative: You can also test using curl command:
// curl -X POST http://localhost:3000/api/test-email -H "Content-Type: application/json" -d '{"success": "true"}'

// Or using PowerShell:
// Invoke-RestMethod -Uri "http://localhost:3000/api/test-email" -Method POST -ContentType "application/json" -Body '{"success": "true"}'