const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');
const Qurbani = require('../models/Qurbani');

// User login handler using passport number and phone number
const userLogin = async (req, res) => {
    try {
        const { passportNumber, phoneNumber } = req.body;

        // Validation
        if (!passportNumber || !phoneNumber) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Passport number and phone number are required'
            });
        }

        // Find user by passport number
        const user = await User.findOne({
            passportNumber: passportNumber.toUpperCase().trim()
        }).populate('groupId');

        if (!user) {
            return res.status(401).json({
                error: 'Invalid credentials',
                message: 'Passport number not found'
            });
        }

        // Verify phone number matches
        if (user.phoneNumber.trim() !== phoneNumber.trim()) {
            return res.status(401).json({
                error: 'Invalid credentials',
                message: 'Phone number does not match'
            });
        }

        // Set user session
        req.session.userId = user._id;
        req.session.userType = 'user';
        req.session.passportNumber = user.passportNumber;

        // Return user data (excluding sensitive information)
        return res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user._id,
                name: user.name,
                passportNumber: user.passportNumber,
                phoneNumber: user.phoneNumber,
                qurbaniType: user.qurbaniType,
                accountType: user.accountType,
                status: user.status,
                groupId: user.groupId,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.error('User login error:', error);
        res.status(500).json({
            error: 'Server error',
            message: error.message
        });
    }
};

// Login handler - supports both Admin and User login
// Field Mapping: username = phone number, password = passport number
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validation
        if (!username || !password) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Username and password are required'
            });
        }

        // First, check if it's admin login (by username format or explicit check)
        const admin = await Admin.findOne({
            username: username.toLowerCase().trim(),
            status: 'active'
        }).populate('companyId');

        if (admin) {
            // Verify password
            const isPasswordValid = await admin.comparePassword(password);

            if (!isPasswordValid) {
                return res.status(401).json({
                    error: 'Invalid credentials',
                    message: 'Invalid username or password'
                });
            }

            // Generate JWT token for admin
            const tokenPayload = {
                adminId: admin._id.toString(),
                username: admin.username,
                userType: 'admin',
                companyId: admin.companyId._id.toString(),
                role: admin.role
            };

            const authToken = jwt.sign(
                tokenPayload,
                process.env.JWT_SECRET || 'qurbani-jwt-secret-2026',
                { expiresIn: '7d' } // Token expires in 7 days
            );

            console.log('🔐 Admin login successful, JWT token generated:', {
                adminId: admin._id,
                role: admin.role
            });

            return res.json({
                success: true,
                message: 'Admin login successful',
                userType: 'admin',
                authToken: authToken,
                admin: {
                    id: admin._id,
                    username: admin.username,
                    fullName: admin.fullName,
                    email: admin.email,
                    role: admin.role,
                    company: {
                        id: admin.companyId._id,
                        name: admin.companyId.companyName,
                        code: admin.companyId.companyCode
                    }
                }
            });
        }

        // If not admin, try user login
        // username = phone number, password = passport number
        const phoneNumber = username.trim();
        const passportNumber = password.toUpperCase().trim();

        // Find user by phone number
        const user = await User.findOne({
            phoneNumber: phoneNumber
        }).populate('groupId');

        if (!user) {
            return res.status(401).json({
                error: 'Invalid credentials',
                message: 'Invalid credentials'
            });
        }

        // Verify passport number matches
        if (user.passportNumber !== passportNumber) {
            return res.status(401).json({
                error: 'Invalid credentials',
                message: 'Invalid credentials'
            });
        }

        // Set user session
        req.session.userId = user._id;
        req.session.userType = 'user';
        req.session.passportNumber = user.passportNumber;

        console.log('🔐 User login successful, session set:', {
            sessionID: req.sessionID,
            userId: req.session.userId
        });

        // Force session save before responding
        return req.session.save((err) => {
            if (err) {
                console.error('❌ Session save error:', err);
                return res.status(500).json({
                    error: 'Session error',
                    message: 'Failed to create session'
                });
            }

            console.log('✅ Session saved successfully');

            // Return user data (excluding sensitive information)
            return res.json({
                success: true,
                message: 'User login successful',
                userType: 'user',
                user: {
                    id: user._id,
                    name: user.name,
                    passportNumber: user.passportNumber,
                    phoneNumber: user.phoneNumber,
                    qurbaniType: user.qurbaniType,
                    accountType: user.accountType,
                    status: user.status,
                    groupId: user.groupId,
                    createdAt: user.createdAt
                }
            });
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: 'Server error',
            message: error.message
        });
    }
};

// Admin logout handler
const logout = async (req, res) => {
    try {
        // With JWT, logout is handled client-side by removing the token
        // Server can optionally maintain a blacklist of invalidated tokens
        // For now, just confirm logout
        res.json({
            success: true,
            message: 'Logout successful'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            error: 'Server error',
            message: error.message
        });
    }
};

// Check authentication status
const checkAuth = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        console.log('🔍 Auth check called:', {
            hasAuthHeader: !!authHeader,
            origin: req.headers.origin
        });

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('❌ No auth token provided');
            return res.json({ authenticated: false });
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
            return res.json({ authenticated: false });
        }

        const admin = await Admin.findById(decoded.adminId).populate('companyId');

        if (!admin) {
            console.log('❌ Admin not found for token adminId:', decoded.adminId);
            return res.json({ authenticated: false });
        }

        console.log('✅ Auth check passed for admin:', admin.username);
        return res.json({
            authenticated: true,
            admin: {
                id: admin._id,
                username: admin.username,
                fullName: admin.fullName,
                role: admin.role,
                company: {
                    id: admin.companyId._id,
                    name: admin.companyId.companyName,
                    code: admin.companyId.companyCode
                }
            }
        });
    } catch (error) {
        console.error('❌ Check auth error:', error);
        return res.json({ authenticated: false });
    }
};

// Check user authentication status
const checkUserAuth = async (req, res) => {
    if (req.session && req.session.userId) {
        try {
            const user = await User.findById(req.session.userId)
                .select('-passwordHash')
                .populate('groupId');

            if (!user) {
                return res.json({ authenticated: false });
            }

            return res.json({
                authenticated: true,
                user: {
                    id: user._id,
                    name: user.name,
                    passportNumber: user.passportNumber,
                    phoneNumber: user.phoneNumber,
                    qurbaniType: user.qurbaniType,
                    accountType: user.accountType,
                    status: user.status,
                    groupId: user.groupId
                }
            });
        } catch (error) {
            console.error('Check user auth error:', error);
            return res.json({ authenticated: false });
        }
    }

    res.json({ authenticated: false });
};

// Authenticate user with phone number and passport number
const authenticateUser = async (req, res) => {
    try {
        const { phoneNumber, passportNumber } = req.body;

        // Validation
        if (!phoneNumber || !passportNumber) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Phone number and passport number are required'
            });
        }

        // Find user by phone number
        const user = await User.findOne({
            phoneNumber: phoneNumber.trim()
        }).populate('groupId').populate('companyId', 'companyName companyCode');

        if (!user) {
            return res.status(401).json({
                error: 'Invalid credentials',
                message: 'Phone number not found'
            });
        }

        // Verify passport number matches
        if (user.passportNumber !== passportNumber.toUpperCase().trim()) {
            return res.status(401).json({
                error: 'Invalid credentials',
                message: 'Passport number does not match'
            });
        }

        // Set user session
        req.session.userId = user._id;
        req.session.userType = 'user';
        req.session.phoneNumber = user.phoneNumber;
        req.session.passportNumber = user.passportNumber;

        // Fetch user's qurbani record
        const qurbani = await Qurbani.findOne({
            userId: user._id
        }).populate('groupId');

        // Generate JWT token
        const tokenPayload = {
            userId: user._id,
            phoneNumber: user.phoneNumber,
            passportNumber: user.passportNumber,
            userType: 'user'
        };

        const authToken = jwt.sign(
            tokenPayload,
            process.env.JWT_SECRET || 'qurbani-jwt-secret-2026',
            { expiresIn: '7d' } // Token expires in 7 days
        );

        // Return user data with token and qurbani info
        return res.json({
            success: true,
            message: 'Authentication successful',
            authToken: authToken,
            user: {
                id: user._id,
                name: user.name,
                passportNumber: user.passportNumber,
                phoneNumber: user.phoneNumber,
                qurbaniType: user.qurbaniType,
                accountType: user.accountType,
                status: user.status,
                groupId: user.groupId,
                companyId: user.companyId,
                createdAt: user.createdAt
            },
            qurbani: qurbani ? {
                id: qurbani._id,
                qurbaniType: qurbani.qurbaniType,
                accountType: qurbani.accountType,
                status: qurbani.status,
                createdAt: qurbani.createdAt,
                completedAt: qurbani.completedAt,
                notes: qurbani.notes
            } : null
        });

    } catch (error) {
        console.error('User authentication error:', error);
        res.status(500).json({
            error: 'Server error',
            message: error.message
        });
    }
};

// Get current user's qurbani record
const getUserQurbani = async (req, res) => {
    try {
        // Get userId from session or JWT
        const userId = req.session?.userId || req.user?.userId;

        if (!userId) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'User not authenticated'
            });
        }

        // Find qurbani record for this user
        const qurbani = await Qurbani.findOne({ userId: userId })
            .populate('userId', 'name passportNumber phoneNumber')
            .populate('groupId');

        if (!qurbani) {
            return res.status(404).json({
                error: 'Not found',
                message: 'No qurbani record found for this user'
            });
        }

        res.json({
            success: true,
            qurbani: {
                id: qurbani._id,
                qurbaniType: qurbani.qurbaniType,
                accountType: qurbani.accountType,
                status: qurbani.status,
                userId: qurbani.userId,
                groupId: qurbani.groupId,
                createdAt: qurbani.createdAt,
                completedAt: qurbani.completedAt,
                notes: qurbani.notes
            }
        });

    } catch (error) {
        console.error('Get user qurbani error:', error);
        res.status(500).json({
            error: 'Server error',
            message: error.message
        });
    }
};

// Get current user's profile (for refreshing user data)
const getUserProfile = async (req, res) => {
    try {
        const user = req.user; // From JWT middleware

        if (!user) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'User not authenticated'
            });
        }

        // Fetch fresh user data with groupId and companyId populated
        const freshUser = await User.findById(user._id).populate('groupId').populate('companyId', 'companyName companyCode');

        if (!freshUser) {
            return res.status(404).json({
                error: 'Not found',
                message: 'User not found'
            });
        }

        return res.json({
            success: true,
            user: {
                id: freshUser._id,
                name: freshUser.name,
                passportNumber: freshUser.passportNumber,
                phoneNumber: freshUser.phoneNumber,
                qurbaniType: freshUser.qurbaniType,
                accountType: freshUser.accountType,
                status: freshUser.status,
                groupId: freshUser.groupId,
                companyId: freshUser.companyId,
                createdAt: freshUser.createdAt
            }
        });

    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({
            error: 'Server error',
            message: error.message
        });
    }
};

module.exports = { login, logout, checkAuth, userLogin, checkUserAuth, authenticateUser, getUserQurbani, getUserProfile };
