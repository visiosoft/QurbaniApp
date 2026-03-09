const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Group = require('./models/Group');

const checkUser = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: process.env.DB_NAME || 'QurbaniDb'
        });

        console.log('Connected to MongoDB\n');

        // Find user
        const user = await User.findOne({
            phoneNumber: '123123',
            passportNumber: '123123'
        }).populate('groupId');

        if (!user) {
            console.log('❌ User not found with phone: 123123 and passport: 123123');
            process.exit(1);
        }

        console.log('✅ User Found:');
        console.log('================');
        console.log('Name:', user.name);
        console.log('Phone:', user.phoneNumber);
        console.log('Passport:', user.passportNumber);
        console.log('Account Type:', user.accountType);
        console.log('Status:', user.status);
        console.log('Qurbani Type:', user.qurbaniType);
        console.log('Group ID:', user.groupId ? user.groupId._id : 'NULL ❌');
        console.log('Company ID:', user.companyId);
        console.log('\n');

        if (user.groupId) {
            console.log('✅ Group Information:');
            console.log('================');
            console.log('Group Name:', user.groupId.groupName);
            console.log('Qurbani Type:', user.groupId.qurbaniType);
            console.log('Status:', user.groupId.status);
            console.log('Representative:', user.groupId.representative);
            console.log('Members Count:', user.groupId.members ? user.groupId.members.length : 0);
            console.log('\n');

            // Get full group details with populated members
            const fullGroup = await Group.findById(user.groupId._id)
                .populate('representative', 'name phoneNumber passportNumber status')
                .populate('members', 'name phoneNumber passportNumber status accountType');

            console.log('✅ Full Group Details:');
            console.log('================');
            console.log('Representative:', fullGroup.representative.name);
            console.log('Is User the Representative?', fullGroup.representative._id.toString() === user._id.toString() ? 'YES ✅' : 'NO ❌');
            console.log('\nMembers:');
            fullGroup.members.forEach((member, index) => {
                console.log(`  ${index + 1}. ${member.name} - ${member.phoneNumber} - Status: ${member.status} - Type: ${member.accountType}`);
            });
        } else {
            console.log('❌ User is NOT part of any group!');
            console.log('\nSearching for groups where user might be representative or member...\n');

            const groupAsRep = await Group.findOne({ representative: user._id })
                .populate('members', 'name phoneNumber');

            const groupAsMember = await Group.findOne({ members: user._id })
                .populate('representative', 'name')
                .populate('members', 'name phoneNumber');

            if (groupAsRep) {
                console.log('⚠️  Found group where user IS representative:');
                console.log('   Group ID:', groupAsRep._id);
                console.log('   Group Name:', groupAsRep.groupName);
                console.log('   Members:', groupAsRep.members.length);
                console.log('\n   ❗ BUT user.groupId is NULL - this is the problem!');
                console.log('   Need to update user.groupId =', groupAsRep._id);
            }

            if (groupAsMember && (!groupAsRep || groupAsMember._id.toString() !== groupAsRep._id.toString())) {
                console.log('⚠️  Found group where user is a member:');
                console.log('   Group ID:', groupAsMember._id);
                console.log('   Group Name:', groupAsMember.groupName);
                console.log('   Representative:', groupAsMember.representative.name);
            }
        }

        await mongoose.connection.close();
        console.log('\n✅ Check complete');
        process.exit(0);

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkUser();
