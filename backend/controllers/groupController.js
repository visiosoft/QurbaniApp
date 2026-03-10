const Group = require('../models/Group');
const User = require('../models/User');
const Qurbani = require('../models/Qurbani');

// Get all groups with pagination and filters
const getAllGroups = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            qurbaniType,
            search,
            companyId
        } = req.query;

        // Build query with company isolation
        const query = {};

        // Super admin can filter by company or see all
        if (req.adminRole === 'super_admin') {
            if (companyId) {
                query.companyId = companyId;
            }
            // If no companyId filter, super admin sees all companies
        } else {
            // Company admin only sees their company's groups
            query.companyId = req.adminCompanyId;
        }

        if (status) query.status = status;
        if (qurbaniType) query.qurbaniType = qurbaniType;
        if (search) {
            query.groupName = { $regex: search, $options: 'i' };
        }

        const groups = await Group.find(query)
            .populate('representative', 'name passportNumber phoneNumber')
            .populate('members', 'name passportNumber phoneNumber')
            .populate('companyId', 'companyName companyCode')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await Group.countDocuments(query);

        res.json({
            groups,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });

    } catch (error) {
        console.error('Get groups error:', error);
        res.status(500).json({
            error: 'Server error',
            message: error.message
        });
    }
};

// Get single group by ID
const getGroupById = async (req, res) => {
    try {
        const query = { _id: req.params.id };

        // Company admin can only view groups from their company
        if (req.adminRole !== 'super_admin') {
            query.companyId = req.adminCompanyId;
        }

        const group = await Group.findOne(query)
            .populate('representative', 'name passportNumber phoneNumber')
            .populate('members', 'name passportNumber phoneNumber qurbaniType')
            .populate('companyId', 'companyName companyCode');

        if (!group) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Group not found'
            });
        }

        res.json(group);

    } catch (error) {
        console.error('Get group error:', error);
        res.status(500).json({
            error: 'Server error',
            message: error.message
        });
    }
};

// Create new group
const createGroup = async (req, res) => {
    try {
        const { groupName, representativeId, qurbaniType } = req.body;

        // Validation
        if (!groupName || !representativeId || !qurbaniType) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Group name, representative, and qurbani type are required'
            });
        }

        // Check if representative exists and belongs to same company
        const representative = await User.findOne({
            _id: representativeId,
            companyId: req.adminCompanyId // Ensure user belongs to admin's company
        });
        if (!representative) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Representative user not found or does not belong to your company'
            });
        }

        // Create group with admin's company ID
        const group = new Group({
            groupName,
            representative: representativeId,
            members: [representativeId], // Representative is automatically a member
            qurbaniType,
            companyId: req.adminCompanyId, // Auto-assign admin's company
            status: 'ready'
        });

        await group.save();

        // Update representative user
        representative.accountType = 'group';
        representative.groupId = group._id;
        representative.qurbaniType = qurbaniType;
        await representative.save();

        // Create corresponding Qurbani entry
        const qurbani = new Qurbani({
            groupId: group._id,
            qurbaniType: group.qurbaniType,
            accountType: 'group',
            status: 'ready'
        });

        await qurbani.save();

        const populatedGroup = await Group.findById(group._id)
            .populate('representative', 'name passportNumber phoneNumber')
            .populate('members', 'name passportNumber phoneNumber')
            .populate('companyId', 'companyName companyCode');

        res.status(201).json({
            success: true,
            message: 'Group created successfully',
            group: populatedGroup,
            qurbani
        });

    } catch (error) {
        console.error('Create group error:', error);
        res.status(500).json({
            error: 'Server error',
            message: error.message
        });
    }
};

// Add member to group
const addMember = async (req, res) => {
    try {
        const { groupId, userId } = req.body;

        if (!groupId || !userId) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Group ID and User ID are required'
            });
        }

        const group = await Group.findById(groupId);
        const user = await User.findById(userId);

        if (!group) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Group not found'
            });
        }

        if (!user) {
            return res.status(404).json({
                error: 'Not found',
                message: 'User not found'
            });
        }

        // Check if user is already in a group
        if (user.groupId) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'User is already part of a group'
            });
        }

        // Member limit removed: allow unlimited members in group

        // Add member to group
        group.members.push(userId);
        await group.save();

        // Update user
        user.accountType = 'group';
        user.groupId = group._id;
        user.qurbaniType = group.qurbaniType;
        await user.save();

        const populatedGroup = await Group.findById(group._id)
            .populate('representative', 'name passportNumber phoneNumber')
            .populate('members', 'name passportNumber phoneNumber');

        res.json({
            success: true,
            message: 'Member added successfully',
            group: populatedGroup
        });

    } catch (error) {
        console.error('Add member error:', error);
        res.status(500).json({
            error: 'Server error',
            message: error.message
        });
    }
};

// Remove member from group
const removeMember = async (req, res) => {
    try {
        const { groupId, userId } = req.body;

        const group = await Group.findById(groupId);
        const user = await User.findById(userId);

        if (!group) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Group not found'
            });
        }

        if (!user) {
            return res.status(404).json({
                error: 'Not found',
                message: 'User not found'
            });
        }

        // Cannot remove representative
        if (group.representative.toString() === userId) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Cannot remove group representative. Assign new representative first.'
            });
        }

        // Remove member from group
        group.members = group.members.filter(
            memberId => memberId.toString() !== userId
        );
        await group.save();

        // Update user to individual
        user.accountType = 'individual';
        user.groupId = null;
        await user.save();

        const populatedGroup = await Group.findById(group._id)
            .populate('representative', 'name passportNumber phoneNumber')
            .populate('members', 'name passportNumber phoneNumber');

        res.json({
            success: true,
            message: 'Member removed successfully',
            group: populatedGroup
        });

    } catch (error) {
        console.error('Remove member error:', error);
        res.status(500).json({
            error: 'Server error',
            message: error.message
        });
    }
};

// Update group
const updateGroup = async (req, res) => {
    try {
        const { groupName, status } = req.body;

        const group = await Group.findById(req.params.id);

        if (!group) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Group not found'
            });
        }

        // Update allowed fields
        if (groupName) group.groupName = groupName;
        if (status) group.status = status;

        await group.save();

        // Update all members' status if needed
        if (status) {
            await User.updateMany(
                { groupId: group._id },
                { status }
            );

            await Qurbani.updateMany(
                { groupId: group._id },
                { status }
            );
        }

        const populatedGroup = await Group.findById(group._id)
            .populate('representative', 'name passportNumber phoneNumber')
            .populate('members', 'name passportNumber phoneNumber');

        res.json({
            success: true,
            message: 'Group updated successfully',
            group: populatedGroup
        });

    } catch (error) {
        console.error('Update group error:', error);
        res.status(500).json({
            error: 'Server error',
            message: error.message
        });
    }
};

// Delete group
const deleteGroup = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);

        if (!group) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Group not found'
            });
        }

        // Update all members to individual
        await User.updateMany(
            { groupId: group._id },
            { accountType: 'individual', groupId: null }
        );

        // Delete associated Qurbani entries
        await Qurbani.deleteMany({ groupId: group._id });

        await Group.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Group deleted successfully'
        });

    } catch (error) {
        console.error('Delete group error:', error);
        res.status(500).json({
            error: 'Server error',
            message: error.message
        });
    }
};

module.exports = {
    getAllGroups,
    getGroupById,
    createGroup,
    addMember,
    removeMember,
    updateGroup,
    deleteGroup
};

// ===== Mobile App Endpoints =====

// Get group members for mobile app (for group representatives)
const getMyGroupMembers = async (req, res) => {
    try {
        const user = req.user; // From JWT auth middleware

        // Check if user is in a group
        if (!user.groupId) {
            return res.status(404).json({
                error: 'Not found',
                message: 'You are not part of any group'
            });
        }

        // Get group with populated members
        const group = await Group.findById(user.groupId)
            .populate('representative', 'name passportNumber phoneNumber status')
            .populate('members', 'name passportNumber phoneNumber status qurbaniType accountType');

        if (!group) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Group not found'
            });
        }

        // Get qurbani records for all members
        const memberIds = group.members.map(m => m._id);
        const qurbaniRecords = await Qurbani.find({ userId: { $in: memberIds } });

        // Map qurbani status to members
        const membersWithQurbani = group.members.map(member => {
            const qurbani = qurbaniRecords.find(q => q.userId.toString() === member._id.toString());
            return {
                id: member._id,
                name: member.name,
                passportNumber: member.passportNumber,
                phoneNumber: member.phoneNumber,
                status: member.status,
                qurbaniType: member.qurbaniType,
                accountType: member.accountType,
                qurbaniStatus: qurbani ? qurbani.status : 'pending',
                isRepresentative: member._id.toString() === group.representative._id.toString()
            };
        });

        res.json({
            success: true,
            group: {
                id: group._id,
                groupName: group.groupName,
                qurbaniType: group.qurbaniType,
                status: group.status,
                representative: {
                    id: group.representative._id,
                    name: group.representative.name
                }
            },
            members: membersWithQurbani
        });

    } catch (error) {
        console.error('Get my group members error:', error);
        res.status(500).json({
            error: 'Server error',
            message: error.message
        });
    }
};

// Mark a group member as ready (for representatives)
const markGroupMemberReady = async (req, res) => {
    try {
        const user = req.user;
        const { memberId } = req.body;

        if (!memberId) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Member ID is required'
            });
        }

        // Check if user is in a group
        if (!user.groupId) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'You are not part of any group'
            });
        }

        // Get group
        const group = await Group.findById(user.groupId);
        if (!group) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Group not found'
            });
        }

        // Check if user is the representative
        if (group.representative.toString() !== user._id.toString()) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Only group representative can mark members as ready'
            });
        }

        // Get member
        const member = await User.findById(memberId);
        if (!member) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Member not found'
            });
        }

        // Check if member is in the group
        if (!group.members.includes(memberId)) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'User is not a member of your group'
            });
        }

        // Update member status
        member.status = 'ready';
        await member.save();

        // Update qurbani record
        await Qurbani.findOneAndUpdate(
            { userId: memberId },
            { status: 'ready' }
        );

        res.json({
            success: true,
            message: 'Member marked as ready',
            member: {
                id: member._id,
                name: member.name,
                status: member.status
            }
        });

    } catch (error) {
        console.error('Mark member ready error:', error);
        res.status(500).json({
            error: 'Server error',
            message: error.message
        });
    }
};

// Validate group before marking member ready
const validateGroupCapacity = async (req, res) => {
    try {
        const user = req.user;

        if (!user.groupId) {
            return res.status(404).json({
                error: 'Not found',
                message: 'You are not part of any group'
            });
        }

        const group = await Group.findById(user.groupId).populate('members');

        if (!group) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Group not found'
            });
        }

        // Define capacity limits
        const capacityLimits = {
            'Sheep': 1,
            'Cow': 7,
            'Camel': 7
        };

        const maxCapacity = capacityLimits[group.qurbaniType] || 1;
        const currentCount = group.members.length;
        const readyCount = group.members.filter(m => m.status === 'ready' || m.status === 'done').length;

        res.json({
            success: true,
            validation: {
                qurbaniType: group.qurbaniType,
                maxCapacity,
                currentCount,
                readyCount,
                canAddMore: currentCount < maxCapacity,
                spotsRemaining: maxCapacity - currentCount
            }
        });

    } catch (error) {
        console.error('Validate group error:', error);
        res.status(500).json({
            error: 'Server error',
            message: error.message
        });
    }
};

module.exports = {
    getAllGroups,
    getGroupById,
    createGroup,
    addMember,
    removeMember,
    updateGroup,
    deleteGroup,
    // Mobile endpoints
    getMyGroupMembers,
    markGroupMemberReady,
    validateGroupCapacity
};
