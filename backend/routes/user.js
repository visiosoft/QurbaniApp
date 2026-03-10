const express = require('express');
const router = express.Router();
const { requireUserAuth } = require('../middleware/auth');
const {
    getProfile,
    updateProfile
} = require('../controllers/userController');

// @route   GET /api/user/profile
// @desc    Get current user's profile
// @access  Private (User JWT)
router.get('/profile', requireUserAuth, getProfile);

// @route   PUT /api/user/profile
// @desc    Update current user's profile (phone number)
// @access  Private (User JWT)
router.put('/profile', requireUserAuth, updateProfile);

module.exports = router;
