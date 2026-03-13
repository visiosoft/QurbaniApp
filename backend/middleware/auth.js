const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

// Middleware to check if admin is authenticated (JWT-based)
const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        console.log('🔐 Admin auth check:', {
            hasAuthHeader: !!authHeader,
            authType: authHeader?.substring(0, 10)
        });

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('❌ No auth token provided');
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Please log in to access this resource'
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'qurbani-jwt-secret-2026'
        );

        // Check if it's an admin token
        if (decoded.userType !== 'admin') {
            console.log('❌ Not an admin token');
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Admin access required'
            });
        }

        // Get admin from database
        const admin = await Admin.findById(decoded.adminId)
            .populate('companyId')
            .select('-password');

        if (!admin) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Admin not found'
            });
        }

        // Attach admin info to request for filtering
        req.admin = admin;
        req.adminId = admin._id;
        req.adminCompanyId = decoded.companyId;
        req.adminRole = decoded.role;

        console.log('✅ Admin authenticated:', {
            adminId: admin._id,
            role: req.adminRole,
            companyId: req.adminCompanyId
        });

        next();
    } catch (error) {
        console.error('❌ JWT Admin Auth error:', error);
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Invalid or expired token'
        });
    }
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

// Middleware to check if user is already logged in (not needed with JWT)
const checkAuth = (req, res, next) => {
    // With JWT, we don't need to check for existing sessions
    // Client manages the token
    next();
};

// Middleware to check if admin has super admin role
const requireSuperAdmin = (req, res, next) => {
    // req.adminRole is set by requireAuth middleware
    if (req.adminRole === 'super_admin') {
        return next();
    }

    return res.status(403).json({
        error: 'Forbidden',
        message: 'Super admin access required'
    });
};

module.exports = { requireAuth, requireUserAuth, checkAuth, requireSuperAdmin };

