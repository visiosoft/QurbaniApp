const Company = require('../models/Company');
const User = require('../models/User');
const Group = require('../models/Group');

// Get all companies with pagination and filters
const getAllCompanies = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            search
        } = req.query;

        // Build query based on admin role
        const query = {};

        // Company admins can only see their own company
        if (req.adminRole === 'company_admin') {
            query._id = req.adminCompanyId;
        }
        // Super admins can see all companies

        if (status) query.status = status;
        if (search) {
            query.$or = [
                { companyName: { $regex: search, $options: 'i' } },
                { companyCode: { $regex: search, $options: 'i' } },
                { contactPerson: { $regex: search, $options: 'i' } }
            ];
        }

        const companies = await Company.find(query)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await Company.countDocuments(query);

        res.json({
            companies,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });

    } catch (error) {
        console.error('Get companies error:', error);
        res.status(500).json({
            error: 'Server error',
            message: error.message
        });
    }
};

// Get single company by ID
const getCompanyById = async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);

        if (!company) {
            return res.status(404).json({ error: 'Company not found' });
        }

        // Get statistics for this company
        const userCount = await User.countDocuments({ companyId: req.params.id });
        const groupCount = await Group.countDocuments({ companyId: req.params.id });

        res.json({
            company,
            statistics: {
                totalUsers: userCount,
                totalGroups: groupCount
            }
        });

    } catch (error) {
        console.error('Get company error:', error);
        res.status(500).json({
            error: 'Server error',
            message: error.message
        });
    }
};

// Create new company
const createCompany = async (req, res) => {
    try {
        const {
            companyName,
            companyCode,
            address,
            contactPerson,
            contactNumber,
            email,
            status
        } = req.body;

        // Validate required fields
        if (!companyName || !companyCode) {
            return res.status(400).json({
                error: 'Company name and company code are required'
            });
        }

        // Check if company code already exists
        const existingCompany = await Company.findOne({ companyCode });
        if (existingCompany) {
            return res.status(400).json({
                error: 'Company code already exists'
            });
        }

        // Create company
        const company = new Company({
            companyName,
            companyCode,
            address,
            contactPerson,
            contactNumber,
            email,
            status: status || 'active'
        });

        await company.save();

        res.status(201).json({
            message: 'Company created successfully',
            company
        });

    } catch (error) {
        console.error('Create company error:', error);
        res.status(500).json({
            error: 'Server error',
            message: error.message
        });
    }
};

// Update company
const updateCompany = async (req, res) => {
    try {
        const {
            companyName,
            companyCode,
            address,
            contactPerson,
            contactNumber,
            email,
            status
        } = req.body;

        const company = await Company.findById(req.params.id);

        if (!company) {
            return res.status(404).json({ error: 'Company not found' });
        }

        // Check if company code is being changed and already exists
        if (companyCode && companyCode !== company.companyCode) {
            const existingCompany = await Company.findOne({ companyCode });
            if (existingCompany) {
                return res.status(400).json({
                    error: 'Company code already exists'
                });
            }
        }

        // Update fields
        if (companyName) company.companyName = companyName;
        if (companyCode) company.companyCode = companyCode;
        if (address !== undefined) company.address = address;
        if (contactPerson !== undefined) company.contactPerson = contactPerson;
        if (contactNumber !== undefined) company.contactNumber = contactNumber;
        if (email !== undefined) company.email = email;
        if (status) company.status = status;

        await company.save();

        res.json({
            message: 'Company updated successfully',
            company
        });

    } catch (error) {
        console.error('Update company error:', error);
        res.status(500).json({
            error: 'Server error',
            message: error.message
        });
    }
};

// Delete company
const deleteCompany = async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);

        if (!company) {
            return res.status(404).json({ error: 'Company not found' });
        }

        // Check if company has users or groups
        const userCount = await User.countDocuments({ companyId: req.params.id });
        const groupCount = await Group.countDocuments({ companyId: req.params.id });

        if (userCount > 0 || groupCount > 0) {
            return res.status(400).json({
                error: 'Cannot delete company with existing users or groups',
                details: {
                    users: userCount,
                    groups: groupCount
                }
            });
        }

        await Company.findByIdAndDelete(req.params.id);

        res.json({
            message: 'Company deleted successfully'
        });

    } catch (error) {
        console.error('Delete company error:', error);
        res.status(500).json({
            error: 'Server error',
            message: error.message
        });
    }
};

// Get all active companies (for dropdown)
const getActiveCompanies = async (req, res) => {
    try {
        const companies = await Company.find({ status: 'active' })
            .select('_id companyName companyCode')
            .sort({ companyName: 1 });

        res.json(companies);

    } catch (error) {
        console.error('Get active companies error:', error);
        res.status(500).json({
            error: 'Server error',
            message: error.message
        });
    }
};

module.exports = {
    getAllCompanies,
    getCompanyById,
    createCompany,
    updateCompany,
    deleteCompany,
    getActiveCompanies
};
