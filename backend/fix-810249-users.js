/**
 * Fix Duplicate Phone 810249 Users
 * Specific fix for ahmad and siraj users
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function fixDuplicate810249() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: process.env.DB_NAME || 'QurbaniDb'
        });

        console.log('='.repeat(70));
        console.log('Fix Duplicate Phone 810249');
        console.log('='.repeat(70));

        // Find both users
        const users = await User.find({ phoneNumber: '810249' }).sort({ createdAt: 1 });

        if (users.length !== 2) {
            console.log(`Expected 2 users, found ${users.length}`);
            mongoose.connection.close();
            return;
        }

        const ahmad = users[0]; // Older user
        const siraj = users[1]; // Newer user

        console.log('\nCurrent State:');
        console.log(`\n1. ${ahmad.name} (Created: ${ahmad.createdAt})`);
        console.log(`   ID: ${ahmad._id}`);
        console.log(`   Phone: ${ahmad.phoneNumber}`);
        console.log(`   Passport: ${ahmad.passportNumber}`);
        console.log(`   Status: ${ahmad.status}`);

        console.log(`\n2. ${siraj.name} (Created: ${siraj.createdAt})`);
        console.log(`   ID: ${siraj._id}`);
        console.log(`   Phone: ${siraj.phoneNumber}`);
        console.log(`   Passport: ${siraj.passportNumber}`);
        console.log(`   Status: ${siraj.status}`);

        console.log('\n' + '='.repeat(70));
        console.log('FIXING...');
        console.log('='.repeat(70));

        // Fix ahmad's passport to match phone (since siraj already matches)
        console.log(`\n🔧 Updating "${ahmad.name}" passport from "${ahmad.passportNumber}" to "${ahmad.phoneNumber}"`);
        ahmad.passportNumber = ahmad.phoneNumber; // Change QG789542 to 810249
        await ahmad.save();
        console.log('✅ Updated!');

        console.log('\n' + '='.repeat(70));
        console.log('RESULT');
        console.log('='.repeat(70));

        console.log(`\nBoth users can now login with:`);
        console.log(`  Phone: 810249`);
        console.log(`  Passport: 810249`);

        console.log(`\n⚠️  NOTE: Both users have same credentials!`);
        console.log(`When logging in with 810249/810249, you'll get user: ${ahmad.name}`);
        console.log(`(First matching user in database)`);

        console.log(`\n💡 RECOMMENDATION:`);
        console.log(`If "${siraj.name}" is a duplicate/test user, consider deleting it:`);
        console.log(`  User.findByIdAndDelete("${siraj._id}")`);

        console.log('\n' + '='.repeat(70));

        mongoose.connection.close();

    } catch (error) {
        console.error('Error:', error.message);
        mongoose.connection.close();
    }
}

fixDuplicate810249();
