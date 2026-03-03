const express = require('express');
const router = express.Router();
const {
    getAllAdmins,
    createAdmin,
    updateAdmin,
    deleteAdmin,
    changePassword
} = require('../controllers/adminController');
const { requireAuth, requireSuperAdmin } = require('../middleware/auth');

// All routes require authentication
router.use(requireAuth);

// Get all admins (super admin only)
router.get('/', requireSuperAdmin, getAllAdmins);

// Create new admin (super admin only)
router.post('/', requireSuperAdmin, createAdmin);

// Update admin (super admin only)
router.put('/:id', requireSuperAdmin, updateAdmin);

// Delete admin (super admin only)
router.delete('/:id', requireSuperAdmin, deleteAdmin);

// Change own password (any admin)
router.post('/change-password', changePassword);

module.exports = router;
