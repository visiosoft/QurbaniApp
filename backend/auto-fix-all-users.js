/**
 * Auto-Fix All User Passport Mismatches
 * Updates all users' passports to match their phone numbers
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function autoFixAllUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: process.env.DB_NAME || 'QurbaniDb'
        });

        console.log('Connected to MongoDB');
        console.log('='.repeat(70));
        console.log('AUTO-FIX: Update Passports to Match Phone Numbers');
        console.log('='.repeat(70));

        // Find all users with mismatched phone/passport
        const users = await User.find({});
        
        console.log(`\nFound ${users.length} total users\n`);

        let fixedCount = 0;
        let alreadyOkCount = 0;
        let skippedCount = 0;

        for (const user of users) {
            const phoneMatch = user.phoneNumber === user.passportNumber;

            if (phoneMatch) {
                console.log(`✅ ${user.name} - Already OK (Phone = Passport)`);
                alreadyOkCount++;
            } else {
                // Skip if phone is not a valid passport format (like "admin")
                if (!user.phoneNumber || user.phoneNumber.length < 4) {
                    console.log(`⏭️  ${user.name} - SKIPPED (Invalid phone: ${user.phoneNumber})`);
                    skippedCount++;
                    continue;
                }

                console.log(`\n🔧 Fixing: ${user.name}`);
                console.log(`   Old: Phone=${user.phoneNumber}, Passport=${user.passportNumber}`);
                
                // Update passport to match phone
                user.passportNumber = user.phoneNumber;
                await user.save();
                
                console.log(`   New: Phone=${user.phoneNumber}, Passport=${user.passportNumber} ✅`);
                fixedCount++;
            }
        }

        console.log('\n' + '='.repeat(70));
        console.log('SUMMARY');
        console.log('='.repeat(70));
        console.log(`Total Users: ${users.length}`);
        console.log(`✅ Already OK: ${alreadyOkCount}`);
        console.log(`🔧 Fixed: ${fixedCount}`);
        console.log(`⏭️  Skipped: ${skippedCount}`);
        console.log('='.repeat(70));

        if (fixedCount > 0) {
            console.log('\n✅ SUCCESS! All users can now login with:');
            console.log('   Phone Number = Passport Number');
        }

        mongoose.connection.close();

    } catch (error) {
        console.error('Error:', error.message);
        mongoose.connection.close();
    }
}

// Show warning before running
console.log('⚠️  WARNING: This will update ALL users\' passports to match their phone numbers!');
console.log('');
console.log('This will affect:');
console.log('  - 9 users with mismatched data');
console.log('  - All passports will be set to match phone numbers');
console.log('');
console.log('Press Ctrl+C to cancel, or wait 3 seconds to proceed...');
console.log('');

setTimeout(() => {
    autoFixAllUsers();
}, 3000);
