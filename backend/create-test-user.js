/**
 * Create Test User for Mobile App Testing
 * 
 * This script creates a test user in the database for testing mobile login
 * 
 * Usage:
 * node create-test-user.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Company = require('./models/Company');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/QurbaniDb';

async function createTestUser() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Check if company exists
        let company = await Company.findOne({ companyCode: 'TEST001' });

        if (!company) {
            console.log('📦 Creating test company...');
            company = await Company.create({
                companyName: 'Test Company',
                companyCode: 'TEST001',
                contactPerson: 'Test Admin',
                contactEmail: 'test@example.com',
                contactPhone: '+966 500 000 000'
            });
            console.log('✅ Test company created:', company.companyName);
        } else {
            console.log('📦 Using existing company:', company.companyName);
        }

        // Check if test user already exists
        const existingUser = await User.findOne({ passportNumber: 'ABC123456' });

        if (existingUser) {
            console.log('\n👤 Test user already exists:');
            console.log('---');
            console.log('Name:', existingUser.name);
            console.log('Passport:', existingUser.passportNumber);
            console.log('Phone:', existingUser.phoneNumber);
            console.log('Company:', company.companyName);
            console.log('\n✅ You can use these credentials to login!');

            // Update phone number if needed
            if (existingUser.phoneNumber !== '+966 123 456 789') {
                existingUser.phoneNumber = '+966 123 456 789';
                await existingUser.save();
                console.log('📝 Updated phone number to: +966 123 456 789');
            }
        } else {
            console.log('\n👤 Creating test user...');

            const testUser = await User.create({
                name: 'Test User',
                passportNumber: 'ABC123456',
                phoneNumber: '+966 123 456 789',
                qurbaniType: 'Sheep',
                accountType: 'individual',
                status: 'ready',
                companyId: company._id
            });

            console.log('✅ Test user created successfully!');
            console.log('---');
            console.log('Name:', testUser.name);
            console.log('Passport:', testUser.passportNumber);
            console.log('Phone:', testUser.phoneNumber);
            console.log('Qurbani Type:', testUser.qurbaniType);
            console.log('Account Type:', testUser.accountType);
            console.log('Status:', testUser.status);
            console.log('Company:', company.companyName);
        }

        console.log('\n🔐 Login Credentials for Mobile App:');
        console.log('=====================================');
        console.log('Phone Number: +966 123 456 789');
        console.log('Passport Number: ABC123456');
        console.log('\n✅ Ready to test mobile login!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('\n📊 Database connection closed');
    }
}

createTestUser();
