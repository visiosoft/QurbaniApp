const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const Company = require('./models/Company');
require('dotenv').config();

// Script to reset and create admin with correct credentials
async function resetAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: process.env.DB_NAME || 'QurbaniDb'
        });

        console.log('Connected to MongoDB');
        console.log('');

        // Delete all existing admins
        const deleteResult = await Admin.deleteMany({});
        console.log(`Deleted ${deleteResult.deletedCount} existing admin(s)`);

        // Get or create default company
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

        // Create admin with correct credentials
        const admin = new Admin({
            username: 'admin',
            email: 'admin@qurbani.com',
            passwordHash: 'admin123', // Will be hashed by pre-save middleware
            fullName: 'Administrator',
            companyId: company._id,
            role: 'super_admin',
            status: 'active'
        });

        await admin.save();

        console.log('');
        console.log('✓ Admin created successfully!');
        console.log('═══════════════════════════════════════');
        console.log('  Username: admin');
        console.log('  Password: admin123');
        console.log('  Company:', company.companyName);
        console.log('═══════════════════════════════════════');
        console.log('');
        console.log('You can now login at http://localhost:3000');

        process.exit(0);
    } catch (error) {
        console.error('Error resetting admin:', error);
        process.exit(1);
    }
}

resetAdmin();
