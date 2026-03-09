/**
 * Fix User Data - Duplicate Phone Numbers & Mismatches
 * Handles duplicate phone numbers and passport mismatches
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function fixUserData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: process.env.DB_NAME || 'QurbaniDb'
        });

        console.log('Connected to MongoDB');
        console.log('='.repeat(70));
        console.log('Fix User Data - Options');
        console.log('='.repeat(70));

        // Find the two users with phone 810249
        const users = await User.find({ phoneNumber: '810249' });

        console.log(`\nFound ${users.length} users with phone number 810249:\n`);

        users.forEach((user, index) => {
            console.log(`${index + 1}. ${user.name} (ID: ${user._id})`);
            console.log(`   Phone: ${user.phoneNumber}`);
            console.log(`   Passport: ${user.passportNumber}`);
            console.log(`   Type: ${user.qurbaniType} | Account: ${user.accountType}`);
            console.log(`   Status: ${user.status}`);
            console.log('');
        });

        console.log('='.repeat(70));
        console.log('RECOMMENDED SOLUTIONS:');
        console.log('='.repeat(70));
        
        console.log('\nOption 1: Keep SIRAJ user, update AHMAD user phone');
        console.log('  - Update "ahmad" phone from 810249 to something else');
        console.log('  - Keep "siraj" with phone 810249 and passport 810249');
        console.log('  - This fixes the duplicate phone number issue');
        
        console.log('\nOption 2: Update AHMAD passport to match phone');
        console.log('  - Change "ahmad" passport from QG789542 to 810249');
        console.log('  - Both users would have matching phone/passport');
        console.log('  - But still have duplicate phone numbers');
        
        console.log('\nOption 3: Delete AHMAD user (if duplicate/test data)');
        console.log('  - Remove "ahmad" user entirely');
        console.log('  - Keep only "siraj" with 810249');
        
        console.log('\n='.repeat(70));
        console.log('\n💡 MANUAL FIX REQUIRED:');
        console.log('Since there are duplicate phone numbers, please decide:');
        console.log('1. Which user is the correct one?');
        console.log('2. Should the other user be deleted or updated?');
        console.log('\nRun one of these commands:\n');
        
        console.log('// Delete ahmad user (if duplicate)');
        console.log('User.findByIdAndDelete("69a6ef5faaba98233bbeb14a");\n');
        
        console.log('// OR update ahmad phone number');
        console.log('User.findByIdAndUpdate("69a6ef5faaba98233bbeb14a", { phoneNumber: "NEW_PHONE" });\n');
        
        console.log('// OR update ahmad passport to match');
        console.log('User.findByIdAndUpdate("69a6ef5faaba98233bbeb14a", { passportNumber: "810249" });\n');
        
        console.log('='.repeat(70));

        mongoose.connection.close();

    } catch (error) {
        console.error('Error:', error.message);
        mongoose.connection.close();
    }
}

fixUserData();
