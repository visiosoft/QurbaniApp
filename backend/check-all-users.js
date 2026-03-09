/**
 * Check All Users for Data Inconsistencies
 * Finds users where phone and passport don't match or have issues
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function checkAllUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: process.env.DB_NAME || 'QurbaniDb'
        });

        console.log('Connected to MongoDB');
        console.log('='.repeat(70));
        console.log('Checking All Users for Data Inconsistencies');
        console.log('='.repeat(70));

        // Find all users
        const users = await User.find({}).select('name phoneNumber passportNumber qurbaniType accountType status');

        console.log(`\nTotal Users: ${users.length}\n`);

        let mismatchCount = 0;
        let mismatches = [];

        users.forEach((user, index) => {
            const phoneMatch = user.phoneNumber === user.passportNumber;
            const hasIssue = !phoneMatch || !user.passportNumber || !user.phoneNumber;

            console.log(`${index + 1}. ${user.name || 'No Name'}`);
            console.log(`   Phone: [${user.phoneNumber}]`);
            console.log(`   Passport: [${user.passportNumber}]`);
            console.log(`   Type: ${user.qurbaniType} | Account: ${user.accountType} | Status: ${user.status}`);
            
            if (hasIssue) {
                if (!user.passportNumber) {
                    console.log(`   ⚠️  ISSUE: Passport is empty/missing`);
                    mismatchCount++;
                    mismatches.push({
                        name: user.name,
                        phone: user.phoneNumber,
                        passport: user.passportNumber,
                        issue: 'Missing passport'
                    });
                } else if (!user.phoneNumber) {
                    console.log(`   ⚠️  ISSUE: Phone is empty/missing`);
                    mismatchCount++;
                    mismatches.push({
                        name: user.name,
                        phone: user.phoneNumber,
                        passport: user.passportNumber,
                        issue: 'Missing phone'
                    });
                } else if (!phoneMatch) {
                    console.log(`   ⚠️  MISMATCH: Phone and Passport are different`);
                    mismatchCount++;
                    mismatches.push({
                        name: user.name,
                        phone: user.phoneNumber,
                        passport: user.passportNumber,
                        issue: 'Phone ≠ Passport'
                    });
                }
            } else {
                console.log(`   ✅ OK: Phone matches Passport`);
            }
            console.log('');
        });

        console.log('='.repeat(70));
        console.log('SUMMARY');
        console.log('='.repeat(70));
        console.log(`Total Users: ${users.length}`);
        console.log(`Users with Issues: ${mismatchCount}`);
        console.log(`Users OK: ${users.length - mismatchCount}`);

        if (mismatches.length > 0) {
            console.log('\n📋 Users with Issues:');
            console.log('-'.repeat(70));
            mismatches.forEach((user, index) => {
                console.log(`${index + 1}. ${user.name}`);
                console.log(`   Phone: ${user.phone}`);
                console.log(`   Passport: ${user.passport}`);
                console.log(`   Issue: ${user.issue}`);
                console.log('');
            });

            console.log('💡 To fix these users, you can either:');
            console.log('   1. Update passport to match phone number');
            console.log('   2. Use the correct passport number when logging in');
            console.log('   3. Update the UI to show correct passport numbers');
        }

        console.log('='.repeat(70));

        mongoose.connection.close();

    } catch (error) {
        console.error('Error:', error.message);
        mongoose.connection.close();
    }
}

checkAllUsers();
