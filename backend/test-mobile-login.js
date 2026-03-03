/**
 * Test Script for Mobile App Login API
 * 
 * This script tests the mobile authentication endpoint
 * Endpoint: POST /api/auth/authenticate
 * 
 * Usage:
 * node test-mobile-login.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/auth';

// Test user credentials - Using existing user from database
const testUser = {
    passportNumber: '123456',
    phoneNumber: '123456'
};

console.log('🚀 Testing Mobile App Login Endpoint');
console.log('=====================================\n');

// Test: Mobile Authentication
async function testMobileLogin() {
    console.log('📱 Testing: POST /api/auth/authenticate');
    console.log('Credentials:', testUser);
    console.log('---');

    try {
        const response = await axios.post(`${BASE_URL}/authenticate`, {
            phoneNumber: testUser.phoneNumber,
            passportNumber: testUser.passportNumber
        }, {
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true
        });

        if (response.data.success) {
            console.log('✅ Authentication successful!');
            console.log('\n📋 Response Data:');
            console.log('---');
            console.log('Auth Token:', response.data.authToken ? response.data.authToken.substring(0, 20) + '...' : 'N/A');
            console.log('\n👤 User:');
            console.log(JSON.stringify(response.data.user, null, 2));

            if (response.data.qurbani) {
                console.log('\n🐑 Qurbani:');
                console.log(JSON.stringify(response.data.qurbani, null, 2));
            } else {
                console.log('\n⚠️ No Qurbani record found for this user');
            }

            return true;
        } else {
            console.log('❌ Authentication failed:', response.data.message);
            return false;
        }
    } catch (error) {
        if (error.response) {
            console.log('❌ Authentication error:');
            console.log('Status:', error.response.status);
            console.log('Message:', error.response.data?.message || error.response.data?.error);
            console.log('Details:', JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.log('❌ Network error: No response received from server');
            console.log('Is the backend server running on port 5000?');
        } else {
            console.log('❌ Error:', error.message);
        }
        return false;
    }
}

// Test: Invalid Credentials
async function testInvalidLogin() {
    console.log('\n\n📱 Testing: Invalid Credentials');
    console.log('---');

    try {
        const response = await axios.post(`${BASE_URL}/authenticate`, {
            phoneNumber: '+999 999 999 999',
            passportNumber: 'INVALID999'
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('❌ Should have failed but succeeded');
        return false;
    } catch (error) {
        if (error.response?.status === 401) {
            console.log('✅ Correctly rejected invalid credentials');
            console.log('Message:', error.response.data.message);
            return true;
        } else {
            console.log('⚠️ Unexpected error:', error.message);
            return false;
        }
    }
}

// Run tests
async function runTests() {
    const result1 = await testMobileLogin();
    const result2 = await testInvalidLogin();

    console.log('\n\n📊 Test Summary');
    console.log('===============');
    console.log('Valid Login:', result1 ? '✅ PASS' : '❌ FAIL');
    console.log('Invalid Login:', result2 ? '✅ PASS' : '❌ FAIL');

    if (result1 && result2) {
        console.log('\n🎉 All tests passed!');
    } else {
        console.log('\n⚠️ Some tests failed!');
        if (!result1) {
            console.log('\nNote: Make sure a user with the test credentials exists in the database.');
            console.log('You can create a test user through the admin panel or using a seed script.');
        }
    }
}

runTests();
