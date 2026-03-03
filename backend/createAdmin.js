const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const Company = require('./models/Company');
require('dotenv').config();

// Script to create initial admin accounts
async function createInitialAdmins() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: process.env.DB_NAME || 'QurbaniDb'
        });

        console.log('Connected to MongoDB');

        // Check if any admins exist
        const adminCount = await Admin.countDocuments();
        if (adminCount > 0) {
            console.log(`${adminCount} admin(s) already exist. Exiting...`);
            process.exit(0);
        }

        // Create a default company if none exists
        let company = await Company.findOne({});
        if (!company) {
            company = new Company({
                companyName: 'Default Company',
                companyCode: 'DEFAULT',
                address: '',
                contactPerson: 'System Admin',
                contactNumber: '',
                email: '',
                status: 'active'
            });
            await company.save();
            console.log('Created default company');
        }

        // Create first super admin
        const superAdmin = new Admin({
            username: 'admin',
            email: 'admin@qurbani.com',
            passwordHash: 'admin123', // Will be hashed by pre-save middleware
            fullName: 'Super Administrator',
            companyId: company._id,
            role: 'super_admin',
            status: 'active'
        });

        await superAdmin.save();
        console.log('✓ Super admin created successfully!');
        console.log('  Username: admin');
        console.log('  Password: admin123');
        console.log('  Company:', company.companyName);
        console.log('');
        console.log('IMPORTANT: Please change the password after first login!');

        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
}

createInitialAdmins();
