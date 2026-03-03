/**
 * Test Script for User Login API
 * 
 * This script tests the user login functionality using passport number and phone number
 * 
 * Usage:
 * node test-user-login.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/auth';

// Test data - Update these with actual user data from your database
const testUser = {
    passportNumber: 'ABC123456',
    phoneNumber: '+966 123 456 789'
};

// Create axios instance with cookie support
const client = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Test 1: User Login
async function testUserLogin() {
    console.log('\n🔵 Test 1: User Login');
    console.log('====================');

    try {
        const response = await client.post('/user/login', {
            passportNumber: testUser.passportNumber,
            phoneNumber: testUser.phoneNumber
        });

        if (response.data.success) {
            console.log('✅ Login successful!');
            console.log('User:', JSON.stringify(response.data.user, null, 2));
            return true;
        } else {
            console.log('❌ Login failed:', response.data.message);
            return false;
        }
    } catch (error) {
        console.log('❌ Login error:', error.response?.data?.message || error.message);
        return false;
    }
}

// Test 2: Check User Authentication
async function testCheckAuth() {
    console.log('\n🔵 Test 2: Check User Authentication');
    console.log('====================================');

    try {
        const response = await client.get('/user/check');

        if (response.data.authenticated) {
            console.log('✅ User is authenticated!');
            console.log('User:', JSON.stringify(response.data.user, null, 2));
            return true;
        } else {
            console.log('❌ User is not authenticated');
            return false;
        }
    } catch (error) {
        console.log('❌ Auth check error:', error.message);
        return false;
    }
}

// Test 3: User Login with Invalid Passport
async function testInvalidPassport() {
    console.log('\n🔵 Test 3: Login with Invalid Passport');
    console.log('======================================');

    try {
        const response = await client.post('/user/login', {
            passportNumber: 'INVALID999',
            phoneNumber: testUser.phoneNumber
        });

        console.log('❌ Should have failed but succeeded');
        return false;
    } catch (error) {
        if (error.response?.status === 401) {
            console.log('✅ Correctly rejected invalid passport');
            console.log('Message:', error.response.data.message);
            return true;
        } else {
            console.log('❌ Unexpected error:', error.message);
            return false;
        }
    }
}

// Test 4: User Login with Invalid Phone Number
async function testInvalidPhone() {
    console.log('\n🔵 Test 4: Login with Invalid Phone Number');
    console.log('==========================================');

    try {
        const response = await client.post('/user/login', {
            passportNumber: testUser.passportNumber,
            phoneNumber: 'WRONG_PHONE'
        });

        console.log('❌ Should have failed but succeeded');
        return false;
    } catch (error) {
        if (error.response?.status === 401) {
            console.log('✅ Correctly rejected invalid phone number');
            console.log('Message:', error.response.data.message);
            return true;
        } else {
            console.log('❌ Unexpected error:', error.message);
            return false;
        }
    }
}

// Test 5: User Login with Missing Fields
async function testMissingFields() {
    console.log('\n🔵 Test 5: Login with Missing Fields');
    console.log('====================================');

    try {
        const response = await client.post('/user/login', {
            passportNumber: testUser.passportNumber
            // phoneNumber missing
        });

        console.log('❌ Should have failed but succeeded');
        return false;
    } catch (error) {
        if (error.response?.status === 400) {
            console.log('✅ Correctly rejected missing fields');
            console.log('Message:', error.response.data.message);
            return true;
        } else {
            console.log('❌ Unexpected error:', error.message);
            return false;
        }
    }
}

// Test 6: User Logout
async function testLogout() {
    console.log('\n🔵 Test 6: User Logout');
    console.log('=====================');

    try {
        const response = await client.post('/logout');

        if (response.data.success) {
            console.log('✅ Logout successful!');
            return true;
        } else {
            console.log('❌ Logout failed');
            return false;
        }
    } catch (error) {
        console.log('❌ Logout error:', error.message);
        return false;
    }
}

// Run all tests
async function runAllTests() {
    console.log('\n╔═══════════════════════════════════════╗');
    console.log('║  User Login API - Test Suite         ║');
    console.log('╚═══════════════════════════════════════╝');
    console.log(`\nBase URL: ${BASE_URL}`);
    console.log(`Test User: ${testUser.passportNumber} / ${testUser.phoneNumber}`);
    console.log('\nNote: Update testUser object with real data from your database\n');

    const results = [];

    // Run tests in sequence
    results.push(await testUserLogin());
    results.push(await testCheckAuth());
    results.push(await testInvalidPassport());
    results.push(await testInvalidPhone());
    results.push(await testMissingFields());
    results.push(await testLogout());

    // Summary
    console.log('\n╔═══════════════════════════════════════╗');
    console.log('║  Test Summary                         ║');
    console.log('╚═══════════════════════════════════════╝');

    const passed = results.filter(r => r === true).length;
    const failed = results.filter(r => r === false).length;

    console.log(`\nTotal Tests: ${results.length}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / results.length) * 100).toFixed(1)}%\n`);
}

// Run tests
runAllTests().catch(error => {
    console.error('\n❌ Fatal error running tests:', error.message);
    process.exit(1);
});
