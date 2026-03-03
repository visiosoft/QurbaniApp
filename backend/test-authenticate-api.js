/**
 * Test Script for Authenticate API
 * Tests the new /api/auth/authenticate endpoint
 * 
 * Usage: node test-authenticate-api.js
 */

const axios = require('axios');

const BASE_URL = 'http://192.168.1.11:5000/api/auth';

// Test data - Update with actual user from your database
const testUser = {
    phoneNumber: '+966 123 456 789',
    passportNumber: 'ABC123456'
};

// Axios instance with cookie support
const client = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

console.log('╔════════════════════════════════════════════════╗');
console.log('║  Testing User Authentication API              ║');
console.log('╚════════════════════════════════════════════════╝\n');
console.log(`Base URL: ${BASE_URL}`);
console.log(`Endpoint: POST /authenticate\n`);

// Test 1: Successful Authentication
async function testSuccessfulAuth() {
    console.log('Test 1: Successful Authentication');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    try {
        const response = await client.post('/authenticate', {
            phoneNumber: testUser.phoneNumber,
            passportNumber: testUser.passportNumber
        });

        console.log('✅ Status:', response.status);
        console.log('✅ Success:', response.data.success);
        console.log('✅ Message:', response.data.message);
        console.log('\nUser Data:');
        console.log(JSON.stringify(response.data.user, null, 2));
        return true;
    } catch (error) {
        console.log('❌ Error:', error.response?.data?.message || error.message);
        console.log('Response:', JSON.stringify(error.response?.data, null, 2));
        return false;
    }
}

// Test 2: Missing Phone Number
async function testMissingPhone() {
    console.log('\n\nTest 2: Missing Phone Number');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    try {
        await client.post('/authenticate', {
            passportNumber: testUser.passportNumber
        });

        console.log('❌ Should have failed but succeeded');
        return false;
    } catch (error) {
        if (error.response?.status === 400) {
            console.log('✅ Correctly rejected (400)');
            console.log('✅ Message:', error.response.data.message);
            return true;
        }
        console.log('❌ Unexpected error:', error.message);
        return false;
    }
}

// Test 3: Missing Passport Number
async function testMissingPassport() {
    console.log('\n\nTest 3: Missing Passport Number');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    try {
        await client.post('/authenticate', {
            phoneNumber: testUser.phoneNumber
        });

        console.log('❌ Should have failed but succeeded');
        return false;
    } catch (error) {
        if (error.response?.status === 400) {
            console.log('✅ Correctly rejected (400)');
            console.log('✅ Message:', error.response.data.message);
            return true;
        }
        console.log('❌ Unexpected error:', error.message);
        return false;
    }
}

// Test 4: Invalid Phone Number
async function testInvalidPhone() {
    console.log('\n\nTest 4: Invalid Phone Number');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    try {
        await client.post('/authenticate', {
            phoneNumber: '+966 999 999 999',
            passportNumber: testUser.passportNumber
        });

        console.log('❌ Should have failed but succeeded');
        return false;
    } catch (error) {
        if (error.response?.status === 401) {
            console.log('✅ Correctly rejected (401)');
            console.log('✅ Message:', error.response.data.message);
            return true;
        }
        console.log('❌ Unexpected error:', error.message);
        return false;
    }
}

// Test 5: Invalid Passport Number
async function testInvalidPassport() {
    console.log('\n\nTest 5: Invalid Passport Number');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    try {
        await client.post('/authenticate', {
            phoneNumber: testUser.phoneNumber,
            passportNumber: 'WRONGPASS123'
        });

        console.log('❌ Should have failed but succeeded');
        return false;
    } catch (error) {
        if (error.response?.status === 401) {
            console.log('✅ Correctly rejected (401)');
            console.log('✅ Message:', error.response.data.message);
            return true;
        }
        console.log('❌ Unexpected error:', error.message);
        return false;
    }
}

// Test 6: Check User Session
async function testCheckSession() {
    console.log('\n\nTest 6: Check User Session');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    try {
        const response = await client.get('/user/check');

        if (response.data.authenticated) {
            console.log('✅ User session active');
            console.log('✅ User:', response.data.user.name);
            return true;
        } else {
            console.log('❌ No active session');
            return false;
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
        return false;
    }
}

// Test 7: Logout
async function testLogout() {
    console.log('\n\nTest 7: Logout');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    try {
        const response = await client.post('/logout');

        if (response.data.success) {
            console.log('✅ Logout successful');
            return true;
        }
        return false;
    } catch (error) {
        console.log('❌ Error:', error.message);
        return false;
    }
}

// Run all tests
async function runTests() {
    console.log('\n⚠️  IMPORTANT: Update testUser object with real data from your database\n');
    console.log('Starting tests...\n');

    const results = [];

    results.push(await testSuccessfulAuth());
    results.push(await testCheckSession());
    results.push(await testMissingPhone());
    results.push(await testMissingPassport());
    results.push(await testInvalidPhone());
    results.push(await testInvalidPassport());
    results.push(await testLogout());

    // Summary
    console.log('\n\n╔════════════════════════════════════════════════╗');
    console.log('║  Test Results Summary                          ║');
    console.log('╚════════════════════════════════════════════════╝\n');

    const passed = results.filter(r => r === true).length;
    const failed = results.filter(r => r === false).length;
    const passRate = ((passed / results.length) * 100).toFixed(1);

    console.log(`Total Tests:    ${results.length}`);
    console.log(`✅ Passed:      ${passed}`);
    console.log(`❌ Failed:      ${failed}`);
    console.log(`Success Rate:   ${passRate}%\n`);

    if (passed === results.length) {
        console.log('🎉 All tests passed!\n');
    } else {
        console.log('⚠️  Some tests failed. Please review the output above.\n');
    }
}

// Execute tests
runTests().catch(error => {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
});
