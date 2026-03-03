import React, { useState, useEffect } from 'react';
import { adminsAPI, companiesAPI } from '../services/api';
import '../styles/Admins.css';

const Admins = () => {
    const [admins, setAdmins] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        total: 0
    });
    const [filters, setFilters] = useState({
        search: '',
        companyId: '',
        role: '',
        status: '',
        page: 1,
        limit: 10
    });
    const [searchInput, setSearchInput] = useState('');
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        fullName: '',
        companyId: '',
        role: 'company_admin',
        status: 'active'
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters(prev => ({ ...prev, search: searchInput, page: 1 }));
        }, 500);
        return () => clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        fetchAdmins();
    }, [filters.companyId, filters.role, filters.status, filters.search, filters.page]);

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchAdmins = async () => {
        try {
            setLoading(true);
            const response = await adminsAPI.getAll(filters);
            setAdmins(response.data.admins);
            setPagination({
                currentPage: parseInt(response.data.currentPage),
                totalPages: response.data.totalPages,
                total: response.data.total
            });
            setLoading(false);
        } catch (err) {
            setError('Failed to load admins');
            setLoading(false);
        }
    };

    const fetchCompanies = async () => {
        try {
            const response = await companiesAPI.getAll();
            setCompanies(response.data.companies || []);
        } catch (err) {
            console.error('Failed to load companies:', err);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value,
            page: 1
        });
    };

    const handleSearchChange = (e) => {
        setSearchInput(e.target.value);
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            companyId: '',
            role: '',
            status: '',
            page: 1,
            limit: 10
        });
        setSearchInput('');
    };

    const handlePageChange = (newPage) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (filters.search) count++;
        if (filters.companyId) count++;
        if (filters.role) count++;
        if (filters.status) count++;
        return count;
    };

    const handleFormChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handlePasswordFormChange = (e) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingAdmin) {
                // Update admin
                const updateData = {
                    fullName: formData.fullName,
                    email: formData.email,
                    companyId: formData.companyId,
                    role: formData.role,
                    status: formData.status
                };
                await adminsAPI.update(editingAdmin._id, updateData);
                alert('Admin updated successfully!');
            } else {
                // Create new admin
                await adminsAPI.create(formData);
                alert('Admin created successfully!');
            }

            setShowForm(false);
            setEditingAdmin(null);
            setFormData({
                username: '',
                email: '',
                password: '',
                fullName: '',
                companyId: '',
                role: 'company_admin',
                status: 'active'
            });
            fetchAdmins();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to save admin');
        }
    };

    const handleEdit = (admin) => {
        setEditingAdmin(admin);
        setFormData({
            username: admin.username,
            email: admin.email,
            password: '',
            fullName: admin.fullName,
            companyId: admin.companyId._id,
            role: admin.role,
            status: admin.status
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this admin?')) {
            try {
                await adminsAPI.delete(id);
                fetchAdmins();
                alert('Admin deleted successfully!');
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to delete admin');
            }
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('New passwords do not match!');
            return;
        }

        try {
            await adminsAPI.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            alert('Password changed successfully!');
            setShowPasswordForm(false);
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to change password');
        }
    };

    const cancelForm = () => {
        setShowForm(false);
        setEditingAdmin(null);
        setFormData({
            username: '',
            email: '',
            password: '',
            fullName: '',
            companyId: '',
            role: 'company_admin',
            status: 'active'
        });
    };

    return (
        <div className="admins-page">
            <div className="page-header">
                <h1>Admin Management</h1>
                <div className="header-actions">
                    <button
                        className="change-password-button"
                        onClick={() => setShowPasswordForm(!showPasswordForm)}
                    >
                        {showPasswordForm ? 'Cancel' : '🔒 Change Password'}
                    </button>
                    <button
                        className="add-button"
                        onClick={() => {
                            if (showForm) {
                                cancelForm();
                            } else {
                                setShowForm(true);
                            }
                        }}
                    >
                        {showForm ? 'Cancel' : '+ Add Admin'}
                    </button>
                </div>
            </div>

            {/* Change Password Form */}
            {showPasswordForm && (
                <div className="form-container">
                    <h2>Change Password</h2>
                    <form onSubmit={handlePasswordSubmit} className="password-form">
                        <div className="form-group">
                            <label>Current Password *</label>
                            <input
                                type="password"
                                name="currentPassword"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordFormChange}
                                required
                                placeholder="Enter current password"
                            />
                        </div>

                        <div className="form-group">
                            <label>New Password *</label>
                            <input
                                type="password"
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordFormChange}
                                required
                                minLength="6"
                                placeholder="Minimum 6 characters"
                            />
                        </div>

                        <div className="form-group">
                            <label>Confirm New Password *</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordFormChange}
                                required
                                minLength="6"
                                placeholder="Re-enter new password"
                            />
                        </div>

                        <button type="submit" className="submit-button">
                            Change Password
                        </button>
                    </form>
                </div>
            )}

            {/* Add/Edit Admin Form */}
            {showForm && (
                <div className="form-container">
                    <h2>{editingAdmin ? 'Edit Admin' : 'Create New Admin'}</h2>
                    <form onSubmit={handleSubmit} className="admin-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Username *</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleFormChange}
                                    required
                                    disabled={editingAdmin}
                                    placeholder="Enter username"
                                />
                            </div>

                            <div className="form-group">
                                <label>Full Name *</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleFormChange}
                                    required
                                    placeholder="Enter full name"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleFormChange}
                                    required
                                    placeholder="Enter email address"
                                />
                            </div>

                            {!editingAdmin && (
                                <div className="form-group">
                                    <label>Password *</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleFormChange}
                                        required={!editingAdmin}
                                        minLength="6"
                                        placeholder="Minimum 6 characters"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Company *</label>
                                <select
                                    name="companyId"
                                    value={formData.companyId}
                                    onChange={handleFormChange}
                                    required
                                >
                                    <option value="">Select Company</option>
                                    {companies.map(company => (
                                        <option key={company._id} value={company._id}>
                                            {company.companyName} ({company.companyCode})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Role *</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleFormChange}
                                    required
                                >
                                    <option value="company_admin">Company Admin</option>
                                    <option value="super_admin">Super Admin</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Status *</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleFormChange}
                                required
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="submit-button">
                                {editingAdmin ? 'Update Admin' : 'Create Admin'}
                            </button>
                            <button type="button" onClick={cancelForm} className="cancel-button">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Filters Section */}
            <div className="filters-section">
                <div className="filters-header">
                    <h3>🔍 Search & Filter</h3>
                    {getActiveFiltersCount() > 0 && (
                        <button onClick={clearFilters} className="clear-filters-btn">
                            Clear All Filters ({getActiveFiltersCount()})
                        </button>
                    )}
                </div>

                <div className="filters">
                    <input
                        type="text"
                        placeholder="Search by username, name, or email..."
                        value={searchInput}
                        onChange={handleSearchChange}
                        className="search-input"
                    />

                    <select name="companyId" value={filters.companyId} onChange={handleFilterChange}>
                        <option value="">All Companies</option>
                        {companies.map(company => (
                            <option key={company._id} value={company._id}>
                                {company.companyName}
                            </option>
                        ))}
                    </select>

                    <select name="role" value={filters.role} onChange={handleFilterChange}>
                        <option value="">All Roles</option>
                        <option value="super_admin">Super Admin</option>
                        <option value="company_admin">Company Admin</option>
                    </select>

                    <select name="status" value={filters.status} onChange={handleFilterChange}>
                        <option value="">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </div>

            {/* Admins Table */}
            {loading ? (
                <div className="loading">Loading admins...</div>
            ) : error ? (
                <div className="error-message">{error}</div>
            ) : admins.length === 0 ? (
                <div className="no-data">
                    <p>No admins found.</p>
                </div>
            ) : (
                <>
                    <div className="results-info">
                        Showing {admins.length} of {pagination.total} admins
                    </div>

                    <div className="table-wrapper">
                        <table className="admins-table">
                            <thead>
                                <tr>
                                    <th>Username</th>
                                    <th>Full Name</th>
                                    <th>Email</th>
                                    <th>Company</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {admins.map((admin) => (
                                    <tr key={admin._id}>
                                        <td>{admin.username}</td>
                                        <td>{admin.fullName}</td>
                                        <td>{admin.email}</td>
                                        <td>
                                            {admin.companyId?.companyName || 'N/A'}
                                            <br />
                                            <small>({admin.companyId?.companyCode})</small>
                                        </td>
                                        <td>
                                            <span className={`role-badge ${admin.role}`}>
                                                {admin.role === 'super_admin' ? 'Super Admin' : 'Company Admin'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${admin.status}`}>
                                                {admin.status}
                                            </span>
                                        </td>
                                        <td className="actions-cell">
                                            <button
                                                onClick={() => handleEdit(admin)}
                                                className="edit-button"
                                                title="Edit Admin"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => handleDelete(admin._id)}
                                                className="delete-button"
                                                title="Delete Admin"
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="pagination">
                            <button
                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                                disabled={pagination.currentPage === 1}
                                className="pagination-button"
                            >
                                ← Previous
                            </button>

                            <span className="pagination-info">
                                Page {pagination.currentPage} of {pagination.totalPages}
                            </span>

                            <button
                                onClick={() => handlePageChange(pagination.currentPage + 1)}
                                disabled={pagination.currentPage === pagination.totalPages}
                                className="pagination-button"
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Admins;
