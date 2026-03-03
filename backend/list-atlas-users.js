/**
 * List all users from the live database
 */

const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Company = require('./models/Company');

// Use the same MongoDB URI as the server
const MONGODB_URI = process.env.MONGODB_URI;

async function listAllUsers() {
    try {
        await mongoose.connect(MONGODB_URI, {
            dbName: process.env.DB_NAME || 'QurbaniDb'
        });
        console.log('✅ Connected to MongoDB Atlas\n');

        const users = await User.find().populate('companyId');

        console.log(`📊 Total users: ${users.length}\n`);

        if (users.length === 0) {
            console.log('⚠️ No users found in database');
        } else {
            users.forEach((user, index) => {
                console.log(`👤 User ${index + 1}:`);
                console.log('---');
                console.log('ID:', user._id);
                console.log('Name:', user.name);
                console.log('Passport:', user.passportNumber);
                console.log('Phone:', user.phoneNumber);
                console.log('Qurbani Type:', user.qurbaniType);
                console.log('Account Type:', user.accountType);
                console.log('Status:', user.status);
                console.log('Group ID:', user.groupId ? user.groupId : 'N/A');
                console.log('Company:', user.companyId?.companyName || 'N/A');
                console.log('');
            });
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
    }
}

listAllUsers();
