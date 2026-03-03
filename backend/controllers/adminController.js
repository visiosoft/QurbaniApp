const Admin = require('../models/Admin');
const Company = require('../models/Company');
const bcrypt = require('bcryptjs');

// Get all admins (super admin only)
const getAllAdmins = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', companyId = '', role = '', status = '' } = req.query;

        // Build filter
        const filter = {};

        if (search) {
            filter.$or = [
                { username: { $regex: search, $options: 'i' } },
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        if (companyId) {
            filter.companyId = companyId;
        }

        if (role) {
            filter.role = role;
        }

        if (status) {
            filter.status = status;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const admins = await Admin.find(filter)
            .populate('companyId', 'companyName companyCode')
            .select('-passwordHash')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip);

        const total = await Admin.countDocuments(filter);

        res.json({
            admins,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            total
        });

    } catch (error) {
        console.error('Get admins error:', error);
        res.status(500).json({
            error: 'Server error',
            message: error.message
        });
    }
};

// Create new admin (super admin only)
const createAdmin = async (req, res) => {
    try {
        const { username, email, password, fullName, companyId, role } = req.body;

        // Validation
        if (!username || !email || !password || !fullName || !companyId || !role) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'All fields are required'
            });
        }

        // Validate role
        if (!['super_admin', 'company_admin'].includes(role)) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Invalid role specified'
            });
        }

        // Check if username already exists
        const existingUsername = await Admin.findOne({ username: username.toLowerCase() });
        if (existingUsername) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Username already exists'
            });
        }

        // Check if email already exists
        const existingEmail = await Admin.findOne({ email: email.toLowerCase() });
        if (existingEmail) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Email already exists'
            });
        }

        // Verify company exists
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Company not found'
            });
        }

        // Create new admin
        const newAdmin = new Admin({
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            passwordHash: password, // Will be hashed by pre-save middleware
            fullName,
            companyId,
            role,
            status: 'active'
        });

        await newAdmin.save();

        // Return admin without password
        const adminData = await Admin.findById(newAdmin._id)
            .populate('companyId', 'companyName companyCode')
            .select('-passwordHash');

        res.status(201).json({
            success: true,
            message: 'Admin created successfully',
            admin: adminData
        });

    } catch (error) {
        console.error('Create admin error:', error);
        res.status(500).json({
            error: 'Server error',
            message: error.message
        });
    }
};

// Update admin (super admin only)
const updateAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, email, companyId, role, status } = req.body;

        // Find admin
        const admin = await Admin.findById(id);
        if (!admin) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Admin not found'
            });
        }

        // Prevent super admin from changing their own role
        if (admin._id.toString() === req.session.adminId && role !== admin.role) {
            return res.status(400).json({
                error: 'Invalid operation',
                message: 'Cannot change your own role'
            });
        }

        // Update fields
        if (fullName) admin.fullName = fullName;
        if (email) {
            // Check if email is taken by another admin
            const existingEmail = await Admin.findOne({
                email: email.toLowerCase(),
                _id: { $ne: id }
            });
            if (existingEmail) {
                return res.status(400).json({
                    error: 'Validation failed',
                    message: 'Email already exists'
                });
            }
            admin.email = email.toLowerCase();
        }
        if (companyId) {
            const company = await Company.findById(companyId);
            if (!company) {
                return res.status(404).json({
                    error: 'Not found',
                    message: 'Company not found'
                });
            }
            admin.companyId = companyId;
        }
        if (role && ['super_admin', 'company_admin'].includes(role)) {
            admin.role = role;
        }
        if (status && ['active', 'inactive'].includes(status)) {
            admin.status = status;
        }

        await admin.save();

        // Return updated admin
        const updatedAdmin = await Admin.findById(id)
            .populate('companyId', 'companyName companyCode')
            .select('-passwordHash');

        res.json({
            success: true,
            message: 'Admin updated successfully',
            admin: updatedAdmin
        });

    } catch (error) {
        console.error('Update admin error:', error);
        res.status(500).json({
            error: 'Server error',
            message: error.message
        });
    }
};

// Delete admin (super admin only)
const deleteAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        // Prevent self-deletion
        if (id === req.session.adminId) {
            return res.status(400).json({
                error: 'Invalid operation',
                message: 'Cannot delete your own account'
            });
        }

        const admin = await Admin.findById(id);
        if (!admin) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Admin not found'
            });
        }

        await Admin.findByIdAndDelete(id);

        res.json({
            success: true,
            message: 'Admin deleted successfully'
        });

    } catch (error) {
        console.error('Delete admin error:', error);
        res.status(500).json({
            error: 'Server error',
            message: error.message
        });
    }
};

// Change password (any admin for their own account)
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const adminId = req.session.adminId;

        // Validation
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Current password and new password are required'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'New password must be at least 6 characters'
            });
        }

        // Find admin
        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Admin not found'
            });
        }

        // Verify current password
        const isPasswordValid = await admin.comparePassword(currentPassword);
        if (!isPasswordValid) {
            return res.status(401).json({
                error: 'Invalid credentials',
                message: 'Current password is incorrect'
            });
        }

        // Update password
        admin.passwordHash = newPassword; // Will be hashed by pre-save middleware
        await admin.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            error: 'Server error',
            message: error.message
        });
    }
};

module.exports = {
    getAllAdmins,
    createAdmin,
    updateAdmin,
    deleteAdmin,
    changePassword
};
