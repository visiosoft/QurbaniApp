const axios = require('axios');

const API_BASE_URL = 'https://ingrained-unserved-irmgard.ngrok-free.dev';

async function testCorrectCredentials() {
    console.log('Testing with CORRECT credentials');
    console.log('Phone: 810249');
    console.log('Passport: QG789542');
    console.log('='.repeat(70));

    try {
        const response = await axios.post(
            `${API_BASE_URL}/api/auth/authenticate`,
            {
                phoneNumber: '810249',
                passportNumber: 'QG789542'
            },
            { timeout: 10000 }
        );

        console.log('✅ SUCCESS!');
        console.log('User:', response.data.user.name);
        console.log('Auth Token:', response.data.authToken.substring(0, 50) + '...');
        
    } catch (error) {
        console.log('❌ FAILED');
        if (error.response) {
            console.log(error.response.data);
        }
    }
}

testCorrectCredentials();
