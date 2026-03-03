const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// Test admin creation
async function testAdminCreation() {
    try {
        console.log('Testing Admin Creation...\n');

        // Step 1: Login as super admin
        console.log('Step 1: Logging in as super admin...');
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
            username: 'admin',
            password: 'admin123'
        }, {
            withCredentials: true
        });

        console.log('✓ Login successful');
        console.log('Role:', loginResponse.data.admin.role);
        console.log('Company:', loginResponse.data.admin.company.name);

        // Get cookies from login
        const cookies = loginResponse.headers['set-cookie'];

        // Step 2: Create a new admin
        console.log('\nStep 2: Creating new admin...');
        const newAdminData = {
            username: 'testadmin',
            email: 'testadmin@example.com',
            password: 'test123',
            fullName: 'Test Admin User',
            companyId: loginResponse.data.admin.company.id,
            role: 'company_admin'
        };

        console.log('Admin data:', JSON.stringify(newAdminData, null, 2));

        const createResponse = await axios.post(`${API_BASE_URL}/admins`, newAdminData, {
            withCredentials: true,
            headers: {
                Cookie: cookies
            }
        });

        console.log('\n✓ Admin created successfully!');
        console.log('New admin:', JSON.stringify(createResponse.data, null, 2));

    } catch (error) {
        console.error('\n✗ Error occurred:');

        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Error:', error.response.data.error);
            console.error('Message:', error.response.data.message);
            console.error('Full response:', JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.error('No response received from server');
            console.error('Request:', error.request);
        } else {
            console.error('Error:', error.message);
        }
    }
}

// Run the test
testAdminCreation();
