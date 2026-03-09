/**
 * Test Mobile Authentication API
 * Tests the /api/auth/authenticate endpoint used by mobile app
 */

const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:5000';
const TEST_CREDENTIALS = {
    phoneNumber: '123456',
    passportNumber: '123456'
};

/**
 * Test the mobile authentication endpoint
 */
async function testMobileAuthentication() {
    console.log('='.repeat(60));
    console.log('Testing Mobile Authentication API');
    console.log('='.repeat(60));
    console.log(`API URL: ${API_BASE_URL}/api/auth/authenticate`);
    console.log('Test Credentials:', TEST_CREDENTIALS);
    console.log('-'.repeat(60));

    try {
        const response = await axios.post(
            `${API_BASE_URL}/api/auth/authenticate`,
            {
                phoneNumber: TEST_CREDENTIALS.phoneNumber,
                passportNumber: TEST_CREDENTIALS.passportNumber
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 10000 // 10 second timeout
            }
        );

        console.log('✅ Authentication Successful!');
        console.log('-'.repeat(60));
        console.log('Response Status:', response.status);
        console.log('Response Data:');
        console.log(JSON.stringify(response.data, null, 2));
        console.log('-'.repeat(60));

        // Validate response structure
        if (response.data.authToken) {
            console.log('✅ Auth Token received');
        } else {
            console.log('⚠️  Warning: No auth token in response');
        }

        if (response.data.user) {
            console.log('✅ User data received');
            console.log('   User ID:', response.data.user.id);
            console.log('   Name:', response.data.user.name);
            console.log('   Phone:', response.data.user.phoneNumber);
            console.log('   Passport:', response.data.user.passportNumber);
        } else {
            console.log('⚠️  Warning: No user data in response');
        }

        if (response.data.qurbani) {
            console.log('✅ Qurbani data received');
            console.log('   Qurbani ID:', response.data.qurbani.id);
            console.log('   Type:', response.data.qurbani.qurbaniType);
            console.log('   Status:', response.data.qurbani.status);
        } else {
            console.log('ℹ️  No qurbani data (user may not have a qurbani record)');
        }

        console.log('='.repeat(60));
        console.log('Test PASSED ✅');
        console.log('='.repeat(60));

        return {
            success: true,
            data: response.data
        };

    } catch (error) {
        console.log('❌ Authentication Failed!');
        console.log('-'.repeat(60));

        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.log('Error Type: API Error Response');
            console.log('Status Code:', error.response.status);
            console.log('Response Data:');
            console.log(JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            // The request was made but no response was received
            console.log('Error Type: Network Error (No Response)');
            console.log('Details:', error.message);
            console.log('');
            console.log('Possible causes:');
            console.log('  - Backend server is not running');
            console.log('  - Backend is running on a different port');
            console.log('  - Firewall is blocking the connection');
            console.log('  - Wrong API URL');
        } else {
            // Something happened in setting up the request that triggered an Error
            console.log('Error Type: Request Setup Error');
            console.log('Details:', error.message);
        }

        console.log('-'.repeat(60));
        console.log('Test FAILED ❌');
        console.log('='.repeat(60));

        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Test with multiple user credentials
 */
async function testMultipleUsers() {
    const testUsers = [
        { phoneNumber: '123456', passportNumber: '123456' },
        { phoneNumber: '+1234567890', passportNumber: 'ABC123' },
        { phoneNumber: '9876543210', passportNumber: 'XYZ789' }
    ];

    console.log('\n');
    console.log('='.repeat(60));
    console.log('Testing Multiple User Credentials');
    console.log('='.repeat(60));

    for (let i = 0; i < testUsers.length; i++) {
        console.log(`\nTest ${i + 1}/${testUsers.length}:`);
        console.log('Credentials:', testUsers[i]);

        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/auth/authenticate`,
                testUsers[i],
                { timeout: 5000 }
            );

            console.log(`✅ Success - User: ${response.data.user?.name || 'Unknown'}`);
        } catch (error) {
            if (error.response) {
                console.log(`❌ Failed - ${error.response.data.message || error.response.data.error}`);
            } else {
                console.log(`❌ Failed - ${error.message}`);
            }
        }
    }

    console.log('\n' + '='.repeat(60));
}

/**
 * Test server connectivity
 */
async function testServerConnection() {
    console.log('\n');
    console.log('='.repeat(60));
    console.log('Testing Server Connectivity');
    console.log('='.repeat(60));

    try {
        const response = await axios.get(`${API_BASE_URL}/`, { timeout: 5000 });
        console.log('✅ Server is reachable');
        console.log('Status:', response.status);
        return true;
    } catch (error) {
        console.log('❌ Cannot reach server');
        if (error.code === 'ECONNREFUSED') {
            console.log('Error: Connection refused - Server is not running');
        } else if (error.code === 'ETIMEDOUT') {
            console.log('Error: Connection timeout - Server is not responding');
        } else {
            console.log('Error:', error.message);
        }
        return false;
    }
}

// Run tests
async function runTests() {
    // Test 1: Test main authentication with test credentials
    await testMobileAuthentication();

    // Test 2: Test multiple users (optional)
    // Uncomment the line below to test with multiple credentials
    // await testMultipleUsers();
}

// Execute tests
runTests();
