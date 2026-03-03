const express = require('express');
const router = express.Router();
const { requireUserAuth } = require('../middleware/auth');
const {
    getMyGroupMembers,
    markGroupMemberReady,
    validateGroupCapacity
} = require('../controllers/groupController');

// Mobile App Routes - Protected by JWT auth

// @route   GET /api/group/members
// @desc    Get all members in user's group
// @access  Private (JWT - Mobile Users)
router.get('/members', requireUserAuth, getMyGroupMembers);

// @route   POST /api/group/member/mark-ready
// @desc    Mark a group member as ready (for representatives)
// @access  Private (JWT - Mobile Users)
router.post('/member/mark-ready', requireUserAuth, markGroupMemberReady);

// @route   POST /api/group/validate
// @desc    Validate group capacity
// @access  Private (JWT - Mobile Users)
router.post('/validate', requireUserAuth, validateGroupCapacity);

module.exports = router;
