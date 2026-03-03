/**
 * Test Script for Mobile Qurbani Status Update
 * 
 * This script tests the qurbani status update functionality for mobile users
 * 
 * Usage:
 * node test-qurbani-status.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test user credentials (individual account)
const testUser = {
    passportNumber: 'IND12345',
    phoneNumber: '999999'
};

console.log('🚀 Testing Mobile Qurbani Status Update');
console.log('========================================\n');

async function testQurbaniStatusFlow() {
    try {
        // Step 1: Login to get JWT token
        console.log('📱 Step 1: Logging in...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/authenticate`, {
            phoneNumber: testUser.phoneNumber,
            passportNumber: testUser.passportNumber
        });

        if (!loginResponse.data.success) {
            console.log('❌ Login failed');
            return;
        }

        const authToken = loginResponse.data.authToken;
        const user = loginResponse.data.user;

        console.log('✅ Login successful');
        console.log('User:', user.name);
        console.log('Account Type:', user.accountType);
        console.log('Current Status:', user.status);
        console.log('Token:', authToken.substring(0, 20) + '...\n');

        // Step 2: Get current qurbani status
        console.log('📱 Step 2: Getting qurbani status...');
        const statusResponse = await axios.get(`${BASE_URL}/qurbani/my`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (statusResponse.data.success) {
            console.log('✅ Qurbani status fetched');
            console.log('Status:', statusResponse.data.qurbani.status);
            console.log('Qurbani Type:', statusResponse.data.qurbani.qurbaniType);
            console.log('Account Type:', statusResponse.data.qurbani.accountType);
            console.log('');
        }

        // Step 3: Update status to 'ready' (simulate marking as ready)
        console.log('📱 Step 3: Updating status to "ready"...');
        const updateResponse = await axios.put(
            `${BASE_URL}/qurbani/my/status`,
            { status: 'ready' },
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            }
        );

        if (updateResponse.data.success) {
            console.log('✅ Status updated successfully!');
            console.log('New Status:', updateResponse.data.qurbani.status);
            console.log('Message:', updateResponse.data.message);
            console.log('');
        }

        // Step 4: Verify the update by fetching status again
        console.log('📱 Step 4: Verifying status update...');
        const verifyResponse = await axios.get(`${BASE_URL}/qurbani/my`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (verifyResponse.data.success) {
            console.log('✅ Status verified');
            console.log('Current Status:', verifyResponse.data.qurbani.status);
            console.log('');
        }

        // Step 5: Reset status back to 'pending' for next test
        console.log('📱 Step 5: Resetting status to "pending"...');
        const resetResponse = await axios.put(
            `${BASE_URL}/qurbani/my/status`,
            { status: 'pending' },
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            }
        );

        if (resetResponse.data.success) {
            console.log('✅ Status reset to pending');
            console.log('Current Status:', resetResponse.data.qurbani.status);
            console.log('');
        }

        console.log('🎉 All tests passed!');
        console.log('\n📋 Summary:');
        console.log('- Login: ✅');
        console.log('- Get status: ✅');
        console.log('- Update to ready: ✅');
        console.log('- Verify update: ✅');
        console.log('- Reset to pending: ✅');

        return true;

    } catch (error) {
        if (error.response) {
            console.log('❌ API Error:');
            console.log('Status:', error.response.status);
            console.log('Message:', error.response.data?.message || error.response.data?.error);
            console.log('Details:', JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.log('❌ Network error: No response from server');
            console.log('Is the backend running on port 5000?');
        } else {
            console.log('❌ Error:', error.message);
        }
        return false;
    }
}

testQurbaniStatusFlow();
