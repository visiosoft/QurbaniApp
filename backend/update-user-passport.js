/**
 * Update User Passport Number
 * Updates the passport for user with phone 810249
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function updateUserPassport() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: process.env.DB_NAME || 'QurbaniDb'
        });

        console.log('Connected to MongoDB');
        console.log('='.repeat(70));

        // Find user by phone
        const user = await User.findOne({ phoneNumber: '810249' });

        if (!user) {
            console.log('❌ User not found with phone: 810249');
            mongoose.connection.close();
            return;
        }

        console.log('Current Data:');
        console.log(`  Name: ${user.name}`);
        console.log(`  Phone: ${user.phoneNumber}`);
        console.log(`  Passport: ${user.passportNumber}`);
        console.log('');

        // Update passport to match phone
        user.passportNumber = '810249';
        await user.save();

        console.log('✅ Updated Successfully!');
        console.log('New Data:');
        console.log(`  Name: ${user.name}`);
        console.log(`  Phone: ${user.phoneNumber}`);
        console.log(`  Passport: ${user.passportNumber}`);
        console.log('');
        console.log('Now you can login with:');
        console.log('  Phone: 810249');
        console.log('  Passport: 810249');
        console.log('='.repeat(70));

        mongoose.connection.close();

    } catch (error) {
        console.error('Error:', error.message);
        mongoose.connection.close();
    }
}

updateUserPassport();
