const express = require('express');
const router = express.Router();
const { requireUserAuth } = require('../middleware/auth');
const { login, logout, checkAuth, userLogin, checkUserAuth, authenticateUser, getUserQurbani, getUserProfile } = require('../controllers/authController');

// @route   POST /api/auth/login
// @desc    Admin/User login (username=phone, password=passport)
// @access  Public
router.post('/login', login);

// @route   POST /api/auth/authenticate
// @desc    User authentication with phone number and passport number
// @access  Public
router.post('/authenticate', authenticateUser);

// @route   POST /api/auth/user/login
// @desc    User login with passport number and phone number
// @access  Public
router.post('/user/login', userLogin);

// @route   POST /api/auth/logout
// @desc    Admin logout
// @access  Private
router.post('/logout', logout);

// @route   GET /api/auth/check
// @desc    Check authentication status
// @access  Public
router.get('/check', checkAuth);

// @route   GET /api/auth/user/check
// @desc    Check user authentication status
// @access  Public
router.get('/user/check', checkUserAuth);

// @route   GET /api/auth/user/qurbani
// @desc    Get current user's qurbani record
// @access  Private
router.get('/user/qurbani', getUserQurbani);

// @route   GET /api/auth/user/profile
// @desc    Get current user's profile (refresh user data)
// @access  Private (JWT)
router.get('/user/profile', requireUserAuth, getUserProfile);

module.exports = router;
