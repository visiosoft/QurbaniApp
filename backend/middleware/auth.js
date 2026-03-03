const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to check if admin is authenticated
const requireAuth = (req, res, next) => {
    if (req.session && req.session.adminId) {
        // Add company ID to request for filtering
        req.adminCompanyId = req.session.companyId;
        req.adminRole = req.session.role;
        return next();
    }

    return res.status(401).json({
        error: 'Unauthorized',
        message: 'Please log in to access this resource'
    });
};

// Middleware to verify JWT token for mobile users
const requireUserAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'No token provided'
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'qurbani-jwt-secret-2026'
        );

        // Get user from database
        const user = await User.findById(decoded.userId)
            .populate('groupId')
            .select('-passwordHash');

        if (!user) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'User not found'
            });
        }

        // Attach user to request
        req.user = user;
        req.userId = user._id;

        next();
    } catch (error) {
        console.error('JWT Auth error:', error);
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Invalid or expired token'
        });
    }
};

// Middleware to check if user is already logged in
const checkAuth = (req, res, next) => {
    if (req.session && req.session.adminId) {
        return res.status(400).json({
            error: 'Already logged in',
            message: 'You are already authenticated'
        });
    }

    next();
};

// Middleware to check if admin has super admin role
const requireSuperAdmin = (req, res, next) => {
    if (req.session && req.session.role === 'super_admin') {
        return next();
    }

    return res.status(403).json({
        error: 'Forbidden',
        message: 'Super admin access required'
    });
};

module.exports = { requireAuth, requireUserAuth, checkAuth, requireSuperAdmin };

