async function testContactApi() {
  console.log('🧪 Starting API Edge Case Tests for /api/contact...\n');
  const baseUrl = 'http://localhost:3000';
  
  const runTest = async (testName, payload, expectedStatus) => {
    console.log(`Running: ${testName}...`);
    // Generate a random IP for each test to bypass the local rate limiter
    const randomIp = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    
    try {
      const res = await fetch(`${baseUrl}/api/contact`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-forwarded-for': randomIp
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (res.status === expectedStatus) {
        console.log(`✅ Passed. (Status: ${res.status})`);
      } else {
        console.error(`❌ Failed. Expected ${expectedStatus} but got ${res.status}. Response:`, data);
      }
    } catch (err) {
      console.error(`❌ Failed with network error:`, err);
    }
    console.log('----------------------------------------');
  };

  const basePayload = {
    name: 'Edge Case Automation',
    phone: '9999999999',
    email: 'test@automation.local',
    location: 'All',
    project: 'Not Sure',
    enquiryType: 'Site Visit',
    message: 'Testing edge cases',
    sourcePage: 'Automated Test Script'
  };

  // Test 1: Valid Submission (Control)
  await runTest('Test 1: Valid Submission with referredBy', {
    ...basePayload,
    referredBy: 'John Doe'
  }, 200);

  // Test 2: referredBy is omitted (Should succeed, it's optional)
  await runTest('Test 2: referredBy omitted', {
    ...basePayload
  }, 200);

  // Test 3: referredBy is null (Should succeed, handles null gracefully)
  await runTest('Test 3: referredBy is null', {
    ...basePayload,
    referredBy: null
  }, 200);

  // Test 4: referredBy is an extremely long string
  await runTest('Test 4: referredBy is very long (10,000 chars)', {
    ...basePayload,
    referredBy: 'A'.repeat(10000)
  }, 200);

  // Test 5: HTML/XSS injection attempt in referredBy
  await runTest('Test 5: referredBy contains HTML/XSS payload', {
    ...basePayload,
    referredBy: '<script>alert("xss")</script><img src=x onerror=alert(1)>'
  }, 200);

  // Test 6: Missing required fields (Name)
  await runTest('Test 6: Missing Name', {
    ...basePayload,
    name: undefined
  }, 400);

  // Test 7: Invalid Email format
  await runTest('Test 7: Invalid Email', {
    ...basePayload,
    email: 'invalid-email-format'
  }, 400);

  console.log('🏁 All Edge Case Tests Completed.');
}

testContactApi();
