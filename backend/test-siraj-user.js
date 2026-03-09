/**
 * Test specific user authentication
 * Tests authentication for user: siraj (810249)
 */

const axios = require('axios');

const API_BASE_URL = 'https://ingrained-unserved-irmgard.ngrok-free.dev';

async function testUser(phoneNumber, passportNumber, userName) {
    console.log('='.repeat(70));
    console.log(`Testing User: ${userName}`);
    console.log('='.repeat(70));
    console.log('Credentials:');
    console.log(`  Phone Number: ${phoneNumber}`);
    console.log(`  Passport Number: ${passportNumber}`);
    console.log('-'.repeat(70));

    try {
        const response = await axios.post(
            `${API_BASE_URL}/api/auth/authenticate`,
            {
                phoneNumber: phoneNumber,
                passportNumber: passportNumber
            },
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 10000
            }
        );

        console.log('✅ Authentication Successful!');
        console.log('-'.repeat(70));
        console.log('Response Data:');
        console.log(JSON.stringify(response.data, null, 2));
        console.log('='.repeat(70));

    } catch (error) {
        console.log('❌ Authentication Failed!');
        console.log('-'.repeat(70));

        if (error.response) {
            console.log('Status Code:', error.response.status);
            console.log('Error Response:');
            console.log(JSON.stringify(error.response.data, null, 2));
            
            console.log('\n🔍 Debugging Information:');
            console.log('Error Type:', error.response.data.error);
            console.log('Error Message:', error.response.data.message);
            
            if (error.response.data.message === 'Passport number does not match') {
                console.log('\n💡 Possible Issues:');
                console.log('  1. Passport number stored in database might be in different format');
                console.log('  2. Extra spaces or special characters in passport field');
                console.log('  3. Case sensitivity issue (uppercase vs lowercase)');
                console.log('  4. Passport field might be empty in database');
            }
            
        } else if (error.request) {
            console.log('Error: No response from server');
            console.log('Details:', error.message);
        } else {
            console.log('Error:', error.message);
        }
        console.log('='.repeat(70));
    }
}

// Test the siraj user
console.log('\n🧪 Testing User Authentication - siraj\n');
testUser('810249', '810249', 'siraj');
