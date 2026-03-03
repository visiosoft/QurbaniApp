/**
 * Create Individual User for Testing Mobile Qurbani Status
 */

const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Qurbani = require('./models/Qurbani');
const Company = require('./models/Company');

const MONGODB_URI = process.env.MONGODB_URI;

async function createIndividualUser() {
    try {
        await mongoose.connect(MONGODB_URI, {
            dbName: process.env.DB_NAME || 'QurbaniDb'
        });
        console.log('✅ Connected to MongoDB Atlas\n');

        // Check if company exists or create one
        let company = await Company.findOne({});
        if (!company) {
            company = await Company.create({
                companyName: 'Test Company',
                companyCode: 'TEST001',
                contactPerson: 'Test Admin',
                contactEmail: 'test@example.com',
                contactPhone: '+966 500 000 000'
            });
            console.log('📦 Created test company');
        }

        // Check if individual user already exists
        const existingUser = await User.findOne({
            passportNumber: 'IND12345',
            accountType: 'individual'
        });

        if (existingUser) {
            console.log('👤 Individual user already exists:');
            console.log('---');
            console.log('Name:', existingUser.name);
            console.log('Passport:', existingUser.passportNumber);
            console.log('Phone:', existingUser.phoneNumber);
            console.log('Account Type:', existingUser.accountType);
            console.log('Status:', existingUser.status);

            // Update status to pending for testing
            existingUser.status = 'pending';
            await existingUser.save();

            // Update qurbani status too
            await Qurbani.findOneAndUpdate(
                { userId: existingUser._id },
                { status: 'pending' }
            );

            console.log('\n✅ Updated status to pending for testing');
        } else {
            // Create individual user
            const individualUser = await User.create({
                name: 'Individual Test User',
                passportNumber: 'IND12345',
                phoneNumber: '999999',
                qurbaniType: 'Sheep',
                accountType: 'individual',
                status: 'pending',
                companyId: company._id
            });

            console.log('✅ Individual user created successfully!');
            console.log('---');
            console.log('Name:', individualUser.name);
            console.log('Passport:', individualUser.passportNumber);
            console.log('Phone:', individualUser.phoneNumber);
            console.log('Qurbani Type:', individualUser.qurbaniType);
            console.log('Account Type:', individualUser.accountType);
            console.log('Status:', individualUser.status);

            // Create corresponding Qurbani record
            const qurbani = await Qurbani.create({
                userId: individualUser._id,
                qurbaniType: individualUser.qurbaniType,
                accountType: 'individual',
                status: 'pending'
            });

            console.log('\n✅ Qurbani record created');
        }

        console.log('\n🔐 Test Credentials:');
        console.log('=====================================');
        console.log('Phone Number: 999999');
        console.log('Passport Number: IND12345');
        console.log('\n✅ Ready to test mobile app!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
    }
}

createIndividualUser();
