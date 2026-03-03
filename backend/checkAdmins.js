const mongoose = require('mongoose');
const Admin = require('./models/Admin');
require('dotenv').config();

// Script to check existing admins
async function checkAdmins() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: process.env.DB_NAME || 'QurbaniDb'
        });

        console.log('Connected to MongoDB');
        console.log('Database:', process.env.DB_NAME || 'QurbaniDb');
        console.log('');

        const admins = await Admin.find({}).populate('companyId');

        console.log(`Found ${admins.length} admin(s):\n`);

        admins.forEach((admin, index) => {
            console.log(`${index + 1}. Admin Details:`);
            console.log(`   ID: ${admin._id}`);
            console.log(`   Username: ${admin.username}`);
            console.log(`   Email: ${admin.email}`);
            console.log(`   Full Name: ${admin.fullName}`);
            console.log(`   Role: ${admin.role}`);
            console.log(`   Status: ${admin.status}`);
            if (admin.companyId) {
                console.log(`   Company: ${admin.companyId.companyName} (${admin.companyId.companyCode})`);
            }
            console.log('');
        });

        if (admins.length === 0) {
            console.log('No admins found. Run "node createAdmin.js" to create one.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error checking admins:', error);
        process.exit(1);
    }
}

checkAdmins();
