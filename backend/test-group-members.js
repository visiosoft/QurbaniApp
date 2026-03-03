/**
 * Test Script for Mobile Group API
 * 
 * This script tests the group members endpoint for mobile app
 * 
 * Usage:
 * node test-group-members.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test user credentials (user in a group)
const testUser = {
    passportNumber: '123456',
    phoneNumber: '123456'
};

console.log('🚀 Testing Mobile Group Members Endpoint');
console.log('=========================================\n');

async function testGroupMembers() {
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
        console.log('Group ID:', user.groupId ? user.groupId._id : 'N/A');
        console.log('Token:', authToken.substring(0, 20) + '...\n');

        // Step 2: Get group members
        console.log('📱 Step 2: Fetching group members...');
        const membersResponse = await axios.get(`${BASE_URL}/group/members`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (membersResponse.data.success) {
            console.log('✅ Group members fetched successfully\n');
            console.log('📋 Group Information:');
            console.log('---');
            console.log('Group Name:', membersResponse.data.group.groupName);
            console.log('Qurbani Type:', membersResponse.data.group.qurbaniType);
            console.log('Status:', membersResponse.data.group.status);
            console.log('\n👥 Members:', membersResponse.data.members.length);
            console.log('---');

            membersResponse.data.members.forEach((member, index) => {
                console.log(`\n${index + 1}. ${member.name}`);
                console.log('   Passport:', member.passportNumber);
                console.log('   Phone:', member.phoneNumber);
                console.log('   Status:', member.status);
                console.log('   Qurbani Status:', member.qurbaniStatus);
                console.log('   Representative:', member.isRepresentative ? 'Yes' : 'No');
            });

            console.log('\n\n🎉 All tests passed!');
            return true;
        } else {
            console.log('❌ Failed to fetch members');
            return false;
        }

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

testGroupMembers();
