// Test script for Google Authentication API
// Run this after starting your backend server

const testGoogleAuth = async () => {
  const baseURL = 'http://localhost:8000';
  
  console.log('Testing Google Authentication API...\n');
  
  // Test 1: Health check
  try {
    const response = await fetch(`${baseURL}/`);
    const data = await response.json();
    console.log('✅ Server is running:', data.message);
  } catch (error) {
    console.error('❌ Server health check failed:', error.message);
    return;
  }
  
  // Test 2: Test Google auth endpoint with invalid token (should fail)
  try {
    const response = await fetch(`${baseURL}/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken: 'invalid-token' }),
    });
    
    const data = await response.json();
    
    if (response.status === 500) {
      console.log('✅ Google auth endpoint responds correctly to invalid token');
    } else {
      console.log('⚠️  Unexpected response to invalid token:', data);
    }
  } catch (error) {
    console.error('❌ Google auth endpoint test failed:', error.message);
  }
  
  // Test 3: Test missing token
  try {
    const response = await fetch(`${baseURL}/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
    
    const data = await response.json();
    
    if (response.status === 400 && data.error === 'ID token is required') {
      console.log('✅ Google auth endpoint validates missing token correctly');
    } else {
      console.log('⚠️  Unexpected response to missing token:', data);
    }
  } catch (error) {
    console.error('❌ Missing token test failed:', error.message);
  }
  
  // Test 4: Test protected route without token
  try {
    const response = await fetch(`${baseURL}/auth/profile/test-uid`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ displayName: 'Test User' }),
    });
    
    const data = await response.json();
    
    if (response.status === 401 && data.error === 'No token provided') {
      console.log('✅ Protected route correctly requires authentication');
    } else {
      console.log('⚠️  Unexpected response to unauthorized request:', data);
    }
  } catch (error) {
    console.error('❌ Protected route test failed:', error.message);
  }
  
  // Test 5: Test leaderboard (public endpoint)
  try {
    const response = await fetch(`${baseURL}/leaderboard`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Leaderboard endpoint works:', data.leaderboard ? 'Has data' : 'Empty');
    } else {
      console.log('⚠️  Leaderboard endpoint issue:', data);
    }
  } catch (error) {
    console.error('❌ Leaderboard test failed:', error.message);
  }
  
  console.log('\n🔗 To test with real Google authentication:');
  console.log('1. Set up your Firebase project with Google Auth enabled');
  console.log('2. Update the frontend Firebase config');
  console.log('3. Use the frontend Google Auth component');
  console.log('4. The frontend will send real Google ID tokens to /auth/google');
};

// Run the test if this file is executed directly
if (typeof window === 'undefined') {
  // Node.js environment
  const fetch = require('node-fetch') || global.fetch;
  testGoogleAuth();
} else {
  // Browser environment
  window.testGoogleAuth = testGoogleAuth;
  console.log('testGoogleAuth function is available in the browser console');
}

module.exports = { testGoogleAuth };
