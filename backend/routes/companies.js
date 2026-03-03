const express = require('express');
const router = express.Router();
const {
    getAllCompanies,
    getCompanyById,
    createCompany,
    updateCompany,
    deleteCompany,
    getActiveCompanies
} = require('../controllers/companyController');
const { requireAuth } = require('../middleware/auth');

// Get all companies (with pagination and filters)
router.get('/', requireAuth, getAllCompanies);

// Get active companies for dropdown
router.get('/active', requireAuth, getActiveCompanies);

// Get single company by ID
router.get('/:id', requireAuth, getCompanyById);

// Create new company
router.post('/', requireAuth, createCompany);

// Update company
router.put('/:id', requireAuth, updateCompany);

// Delete company
router.delete('/:id', requireAuth, deleteCompany);

module.exports = router;
