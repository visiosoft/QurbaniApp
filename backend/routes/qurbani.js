const express = require('express');
const router = express.Router();
const { requireAuth, requireUserAuth } = require('../middleware/auth');
const {
    getAllQurbani,
    getQurbaniStats,
    getQurbaniById,
    getMyQurbani,
    updateQurbaniStatus,
    updateMyQurbaniStatus,
    markAsDone,
    deleteQurbani
} = require('../controllers/qurbaniController');

// Admin routes
// @route   GET /api/qurbani
// @desc    Get all Qurbani requests with filters
// @access  Private (Admin)
router.get('/', requireAuth, getAllQurbani);

// @route   GET /api/qurbani/stats
// @desc    Get Qurbani statistics
// @access  Private (Admin)
router.get('/stats', requireAuth, getQurbaniStats);

// Mobile user routes
// @route   GET /api/qurbani/my
// @desc    Get current user's qurbani record
// @access  Private (JWT - Mobile Users)
router.get('/my', requireUserAuth, getMyQurbani);

// @route   PUT /api/qurbani/my/status
// @desc    Update my qurbani status (mobile users)
// @access  Private (JWT - Mobile Users)
router.put('/my/status', requireUserAuth, updateMyQurbaniStatus);

// Admin routes
// @route   GET /api/qurbani/:id
// @desc    Get single Qurbani by ID
// @access  Private (Admin)
router.get('/:id', requireAuth, getQurbaniById);

// @route   PUT /api/qurbani/:id
// @desc    Update Qurbani status
// @access  Private (Admin)
router.put('/:id', requireAuth, updateQurbaniStatus);

// @route   POST /api/qurbani/:id/mark-done
// @desc    Mark Qurbani as done
// @access  Private (Admin)
router.post('/:id/mark-done', requireAuth, markAsDone);

// @route   DELETE /api/qurbani/:id
// @desc    Delete Qurbani request
// @access  Private (Admin)
router.delete('/:id', requireAuth, deleteQurbani);

module.exports = router;
