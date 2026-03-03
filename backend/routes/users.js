const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
} = require('../controllers/userController');

// @route   GET /api/users
// @desc    Get all users with filters
// @access  Private
router.get('/', requireAuth, getAllUsers);

// @route   GET /api/users/:id
// @desc    Get single user by ID
// @access  Private
router.get('/:id', requireAuth, getUserById);

// @route   POST /api/users
// @desc    Create new individual user
// @access  Private
router.post('/', requireAuth, createUser);

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private
router.put('/:id', requireAuth, updateUser);

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private
router.delete('/:id', requireAuth, deleteUser);

module.exports = router;
