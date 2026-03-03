const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const {
    getAllGroups,
    getGroupById,
    createGroup,
    addMember,
    removeMember,
    updateGroup,
    deleteGroup
} = require('../controllers/groupController');

// @route   GET /api/groups
// @desc    Get all groups with filters
// @access  Private
router.get('/', requireAuth, getAllGroups);

// @route   GET /api/groups/:id
// @desc    Get single group by ID
// @access  Private
router.get('/:id', requireAuth, getGroupById);

// @route   POST /api/groups
// @desc    Create new group
// @access  Private
router.post('/', requireAuth, createGroup);

// @route   POST /api/groups/add-member
// @desc    Add member to group
// @access  Private
router.post('/add-member', requireAuth, addMember);

// @route   POST /api/groups/remove-member
// @desc    Remove member from group
// @access  Private
router.post('/remove-member', requireAuth, removeMember);

// @route   PUT /api/groups/:id
// @desc    Update group
// @access  Private
router.put('/:id', requireAuth, updateGroup);

// @route   DELETE /api/groups/:id
// @desc    Delete group
// @access  Private
router.delete('/:id', requireAuth, deleteGroup);

module.exports = router;
