const User = require('../models/User');
const Group = require('../models/Group');
const Qurbani = require('../models/Qurbani');

// Get all users with pagination and filters
const getAllUsers = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            accountType,
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
            // Company admin only sees their company's users
            query.companyId = req.adminCompanyId;
        }

        if (accountType) query.accountType = accountType;
        if (status) query.status = status;
        if (qurbaniType) query.qurbaniType = qurbaniType;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { passportNumber: { $regex: search, $options: 'i' } },
                { phoneNumber: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query)
            .populate('groupId', 'groupName qurbaniType')
            .populate('companyId', 'companyName companyCode')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await User.countDocuments(query);

        res.json({
            users,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });

    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            error: 'Server error',
            message: error.message
        });
    }
};

// Get single user by ID
const getUserById = async (req, res) => {
    try {
        const query = { _id: req.params.id };

        // Company admin can only view users from their company
        if (req.adminRole !== 'super_admin') {
            query.companyId = req.adminCompanyId;
        }

        const user = await User.findOne(query)
            .populate('groupId', 'groupName qurbaniType members')
            .populate('companyId', 'companyName companyCode');

        if (!user) {
            return res.status(404).json({
                error: 'Not found',
                message: 'User not found'
            });
        }

        res.json(user);

    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            error: 'Server error',
            message: error.message
        });
    }
};

// Create new individual user
const createUser = async (req, res) => {
    try {

        const { name, passportNumber, phoneNumber, qurbaniType } = req.body;

        // Validation
        if (!name || !passportNumber || !phoneNumber || !qurbaniType) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'All required fields must be provided'
            });
        }

        // Check if passport number already exists
        const existingUser = await User.findOne({ passportNumber: passportNumber.toUpperCase() });
        if (existingUser) {
            return res.status(400).json({
                error: 'Duplicate entry',
                message: 'Passport number already exists'
            });
        }


        // Create user with admin's company ID (no password for individual)
        const user = new User({
            name,
            passportNumber: passportNumber.toUpperCase(),
            phoneNumber,
            qurbaniType,
            status: 'pending',
            accountType: 'individual',
            companyId: req.adminCompanyId
        });

        await user.save();

        // Create corresponding Qurbani entry
        const qurbani = new Qurbani({
            userId: user._id,
            qurbaniType: user.qurbaniType,
            accountType: 'individual',
            status: 'pending'
        });

        await qurbani.save();

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            user,
            qurbani
        });

    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({
            error: 'Server error',
            message: error.message
        });
    }
};

// Update user
const updateUser = async (req, res) => {
    try {
        const { name, phoneNumber, status, qurbaniType } = req.body;

        const user = await User.findOne({
            _id: req.params.id,
            companyId: req.adminCompanyId // Ensure user belongs to admin's company
        });

        if (!user) {
            return res.status(404).json({
                error: 'Not found',
                message: 'User not found'
            });
        }

        // Update allowed fields
        if (name) user.name = name;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (status) user.status = status;
        if (qurbaniType) user.qurbaniType = qurbaniType;

        await user.save();

        // Update corresponding Qurbani status if needed
        if (status) {
            await Qurbani.updateMany(
                { userId: user._id },
                { status }
            );
        }

        res.json({
            success: true,
            message: 'User updated successfully',
            user
        });

    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            error: 'Server error',
            message: error.message
        });
    }
};

// Delete user
const deleteUser = async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.params.id,
            companyId: req.adminCompanyId // Ensure user belongs to admin's company
        });

        if (!user) {
            return res.status(404).json({
                error: 'Not found',
                message: 'User not found'
            });
        }

        // Check if user is part of a group
        if (user.groupId) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Cannot delete user who is part of a group. Remove from group first.'
            });
        }

        // Delete associated Qurbani entries
        await Qurbani.deleteMany({ userId: user._id });

        await User.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'User deleted successfully'
        });

    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            error: 'Server error',
            message: error.message
        });
    }
};

// Get current user's profile (for mobile users)
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId)
            .populate('groupId', 'groupName qurbaniType members')
            .populate('companyId', 'companyName companyCode')
            .select('-password');

        if (!user) {
            return res.status(404).json({
                error: 'Not found',
                message: 'User not found'
            });
        }

        res.json(user);

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            error: 'Server error',
            message: error.message
        });
    }
};

// Update current user's profile (for mobile users)
const updateProfile = async (req, res) => {
    try {
        const { phoneNumber } = req.body;

        if (!phoneNumber) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Phone number is required'
            });
        }

        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                error: 'Not found',
                message: 'User not found'
            });
        }

        // Check if phone number is already used by another user
        if (phoneNumber !== user.phoneNumber) {
            const existingUser = await User.findOne({
                phoneNumber,
                _id: { $ne: req.userId } // Exclude current user
            });

            if (existingUser) {
                return res.status(400).json({
                    error: 'Duplicate entry',
                    message: 'This phone number is already registered to another user'
                });
            }
        }

        // Update phone number
        user.phoneNumber = phoneNumber;
        await user.save();

        // Return updated user without password
        const updatedUser = await User.findById(req.userId)
            .populate('groupId', 'groupName qurbaniType members')
            .populate('companyId', 'companyName companyCode')
            .select('-password');

        res.json(updatedUser);

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            error: 'Server error',
            message: error.message
        });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getProfile,
    updateProfile
};
