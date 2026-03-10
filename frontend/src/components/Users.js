import React, { useState, useEffect, useCallback } from 'react';
import { usersAPI, companiesAPI } from '../services/api';
import '../styles/Users.css';

const Users = ({ adminRole, adminInfo }) => {
    const [users, setUsers] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        total: 0
    });
    const [filters, setFilters] = useState({
        accountType: '',
        status: '',
        qurbaniType: '',
        companyId: '',
        search: '',
        page: 1,
        limit: 10
    });
    const [searchInput, setSearchInput] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        passportNumber: '',
        phoneNumber: '',
        qurbaniType: 'Sheep',
        status: 'pending',
    });

    const isSuperAdmin = adminRole === 'super_admin';

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters(prev => ({ ...prev, search: searchInput, page: 1 }));
        }, 500);
        return () => clearTimeout(timer);
    }, [searchInput]);

    // Fetch companies for super admin
    useEffect(() => {
        if (isSuperAdmin) {
            fetchCompanies();
        }
    }, [isSuperAdmin]);

    useEffect(() => {
        fetchUsers();
    }, [filters.accountType, filters.status, filters.qurbaniType, filters.companyId, filters.search, filters.page]);

    const fetchCompanies = async () => {
        try {
            const response = await companiesAPI.getAll();
            setCompanies(response.data.companies || []);
        } catch (err) {
            console.error('Failed to load companies:', err);
        }
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await usersAPI.getAll(filters);
            setUsers(response.data.users);
            setPagination({
                currentPage: parseInt(response.data.currentPage),
                totalPages: response.data.totalPages,
                total: response.data.total
            });
            setLoading(false);
        } catch (err) {
            setError('Failed to load users');
            setLoading(false);
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
            accountType: '',
            status: '',
            qurbaniType: '',
            search: '',
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
        if (filters.accountType) count++;
        if (filters.status) count++;
        if (filters.qurbaniType) count++;
        if (filters.search) count++;
        return count;
    };

    const handleFormChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            passportNumber: user.passportNumber,
            phoneNumber: user.phoneNumber,
            qurbaniType: user.qurbaniType,
            status: user.status,
        });
        setShowForm(true);
    };

    const handleCancelEdit = () => {
        setEditingUser(null);
        setShowForm(false);
        setFormData({
            name: '',
            passportNumber: '',
            phoneNumber: '',
            qurbaniType: 'Sheep',
            status: 'pending',
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingUser) {
                await usersAPI.update(editingUser._id, formData);
                alert('User updated successfully!');
            } else {
                await usersAPI.create(formData);
                alert('User created successfully!');
            }

            setShowForm(false);
            setEditingUser(null);
            setFormData({
                name: '',
                passportNumber: '',
                phoneNumber: '',
                qurbaniType: 'Sheep',
                status: 'pending',
            });
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.message || `Failed to ${editingUser ? 'update' : 'create'} user`);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await usersAPI.delete(id);
                fetchUsers();
                alert('User deleted successfully!');
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to delete user');
            }
        }
    };

    return (
        <div className="users-page">
            <div className="page-header">
                <h1>Users Management</h1>
                <button
                    className="add-button"
                    onClick={() => {
                        if (showForm) {
                            handleCancelEdit();
                        } else {
                            setShowForm(true);
                        }
                    }}
                >
                    {showForm ? 'Cancel' : '+ Add Individual User'}
                </button>
            </div>

            {/* Add/Edit User Form */}
            {showForm && (
                <div className="form-container">
                    <h2>{editingUser ? 'Edit User' : 'Create Individual User'}</h2>
                    <form onSubmit={handleSubmit} className="user-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Full Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleFormChange}
                                    required
                                    placeholder="Enter full name"
                                />
                            </div>

                            <div className="form-group">
                                <label>Passport Number *</label>
                                <input
                                    type="text"
                                    name="passportNumber"
                                    value={formData.passportNumber}
                                    onChange={handleFormChange}
                                    required
                                    placeholder="Enter passport number"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Phone Number *</label>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleFormChange}
                                    required
                                    placeholder="+966 xxx xxx xxx"
                                />
                            </div>

                            <div className="form-group">
                                <label>Qurbani Type *</label>
                                <select
                                    name="qurbaniType"
                                    value={formData.qurbaniType}
                                    onChange={handleFormChange}
                                    required
                                >
                                    <option value="Sheep">Sheep</option>
                                </select>
                            </div>
                        </div>

                        {editingUser && (
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Status *</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleFormChange}
                                        required
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="ready">Ready</option>
                                        <option value="done">Done</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Password field removed for individual user */}

                        <button type="submit" className="submit-button">
                            {editingUser ? 'Update User' : 'Create User'}
                        </button>
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
                        placeholder="Search by name, passport, or phone..."
                        value={searchInput}
                        onChange={handleSearchChange}
                        className="search-input"
                    />

                    <select name="accountType" value={filters.accountType} onChange={handleFilterChange}>
                        <option value="">All Account Types</option>
                        <option value="individual">Individual</option>
                        <option value="group">Group</option>
                    </select>

                    <select name="status" value={filters.status} onChange={handleFilterChange}>
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="ready">Ready</option>
                        <option value="done">Done</option>
                    </select>

                    <select name="qurbaniType" value={filters.qurbaniType} onChange={handleFilterChange}>
                        <option value="">All Types</option>
                        <option value="Sheep">Sheep</option>
                    </select>

                    {isSuperAdmin && (
                        <select name="companyId" value={filters.companyId} onChange={handleFilterChange}>
                            <option value="">All Companies</option>
                            {companies.map(company => (
                                <option key={company._id} value={company._id}>
                                    {company.companyName}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Results Summary */}
                <div className="results-summary">
                    Showing {users.length} of {pagination.total} users
                    {filters.search && ` - Search: "${filters.search}"`}
                </div>
            </div>

            {/* Users Table */}
            {loading ? (
                <div className="loading">Loading users...</div>
            ) : error ? (
                <div className="error">{error}</div>
            ) : (
                <div className="table-container">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Passport</th>
                                <th>Phone</th>
                                {isSuperAdmin && <th>Company</th>}
                                <th>Type</th>
                                <th>Account</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={isSuperAdmin ? "8" : "7"} className="no-data">No users found</td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user._id}>
                                        <td>{user.name}</td>
                                        <td>{user.passportNumber}</td>
                                        <td>{user.phoneNumber}</td>
                                        {isSuperAdmin && (
                                            <td>
                                                <span className="company-badge">
                                                    {user.companyId?.companyName || 'N/A'}
                                                </span>
                                            </td>
                                        )}
                                        <td>{user.qurbaniType}</td>
                                        <td>
                                            <span className={`badge ${user.accountType}`}>
                                                {user.accountType}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status ${user.status}`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className="edit-btn"
                                                onClick={() => handleEdit(user)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="delete-btn"
                                                onClick={() => handleDelete(user._id)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {!loading && pagination.totalPages > 1 && (
                <div className="pagination">
                    <button
                        onClick={() => handlePageChange(1)}
                        disabled={pagination.currentPage === 1}
                        className="pagination-btn"
                    >
                        First
                    </button>
                    <button
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 1}
                        className="pagination-btn"
                    >
                        Previous
                    </button>

                    <span className="pagination-info">
                        Page {pagination.currentPage} of {pagination.totalPages}
                    </span>

                    <button
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={pagination.currentPage === pagination.totalPages}
                        className="pagination-btn"
                    >
                        Next
                    </button>
                    <button
                        onClick={() => handlePageChange(pagination.totalPages)}
                        disabled={pagination.currentPage === pagination.totalPages}
                        className="pagination-btn"
                    >
                        Last
                    </button>
                </div>
            )}
        </div>
    );
};

export default Users;
