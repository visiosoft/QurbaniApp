/**
 * Check User Data in Database
 * Retrieves actual user data from database to debug authentication issue
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function checkUser() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: process.env.DB_NAME || 'QurbaniDb'
        });

        console.log('Connected to MongoDB');
        console.log('='.repeat(70));
        console.log('Searching for user with phone: 810249');
        console.log('='.repeat(70));

        // Find user by phone number
        const user = await User.findOne({ phoneNumber: '810249' });

        if (!user) {
            console.log('❌ User not found with phone number: 810249');
            mongoose.connection.close();
            return;
        }

        console.log('\n✅ User Found!');
        console.log('-'.repeat(70));
        console.log('User Data:');
        console.log(`  ID: ${user._id}`);
        console.log(`  Name: ${user.name}`);
        console.log(`  Phone Number: [${user.phoneNumber}]`);
        console.log(`  Passport Number: [${user.passportNumber}]`);
        console.log(`  Qurbani Type: ${user.qurbaniType}`);
        console.log(`  Account Type: ${user.accountType}`);
        console.log(`  Status: ${user.status}`);
        console.log(`  Created: ${user.createdAt}`);
        
        console.log('\n🔍 Detailed Field Analysis:');
        console.log('-'.repeat(70));
        
        // Check passport field
        console.log('Passport Field Details:');
        console.log(`  Type: ${typeof user.passportNumber}`);
        console.log(`  Length: ${user.passportNumber ? user.passportNumber.length : 0}`);
        console.log(`  Value (raw): ${JSON.stringify(user.passportNumber)}`);
        console.log(`  Trimmed: [${user.passportNumber ? user.passportNumber.trim() : ''}]`);
        console.log(`  Uppercase: [${user.passportNumber ? user.passportNumber.toUpperCase() : ''}]`);
        
        // Check phone field
        console.log('\nPhone Field Details:');
        console.log(`  Type: ${typeof user.phoneNumber}`);
        console.log(`  Length: ${user.phoneNumber ? user.phoneNumber.length : 0}`);
        console.log(`  Value (raw): ${JSON.stringify(user.phoneNumber)}`);
        console.log(`  Trimmed: [${user.phoneNumber ? user.phoneNumber.trim() : ''}]`);
        
        // Test comparison
        console.log('\n🧪 Comparison Tests:');
        console.log('-'.repeat(70));
        const testPassport = '810249';
        const testPhone = '810249';
        
        console.log(`Test Passport: [${testPassport}]`);
        console.log(`Test Phone: [${testPhone}]`);
        console.log('');
        console.log('Comparison Results:');
        console.log(`  Phone Match (exact): ${user.phoneNumber === testPhone}`);
        console.log(`  Phone Match (trimmed): ${user.phoneNumber.trim() === testPhone.trim()}`);
        console.log(`  Passport Match (exact): ${user.passportNumber === testPassport}`);
        console.log(`  Passport Match (trimmed): ${user.passportNumber.trim() === testPassport.trim()}`);
        console.log(`  Passport Match (uppercase): ${user.passportNumber.toUpperCase().trim() === testPassport.toUpperCase().trim()}`);
        
        // Check what the auth controller does
        console.log('\n📋 Auth Controller Logic:');
        console.log('-'.repeat(70));
        console.log('What the authenticateUser function checks:');
        console.log(`  1. Find user by phone: "${testPhone.trim()}"`);
        console.log(`  2. Compare passport: "${user.passportNumber}" !== "${testPassport.toUpperCase().trim()}"`);
        console.log(`  Result: ${user.passportNumber !== testPassport.toUpperCase().trim()}`);
        
        console.log('\n='.repeat(70));

        mongoose.connection.close();

    } catch (error) {
        console.error('Error:', error.message);
        mongoose.connection.close();
    }
}

checkUser();
