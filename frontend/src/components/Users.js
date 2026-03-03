import React, { useState, useEffect, useCallback } from 'react';
import { usersAPI } from '../services/api';
import '../styles/Users.css';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        total: 0
    });
    const [filters, setFilters] = useState({
        accountType: '',
        status: '',
        qurbaniType: '',
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
    });

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters(prev => ({ ...prev, search: searchInput, page: 1 }));
        }, 500);
        return () => clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        fetchUsers();
    }, [filters.accountType, filters.status, filters.qurbaniType, filters.search, filters.page]);

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

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await usersAPI.create(formData);
            setShowForm(false);
            setFormData({
                name: '',
                passportNumber: '',
                phoneNumber: '',
                qurbaniType: 'Sheep',
            });
            fetchUsers();
            alert('User created successfully!');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create user');
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
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? 'Cancel' : '+ Add Individual User'}
                </button>
            </div>

            {/* Add User Form */}
            {showForm && (
                <div className="form-container">
                    <h2>Create Individual User</h2>
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

                        {/* Password field removed for individual user */}

                        <button type="submit" className="submit-button">
                            Create User
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
                                <th>Type</th>
                                <th>Account</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="no-data">No users found</td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user._id}>
                                        <td>{user.name}</td>
                                        <td>{user.passportNumber}</td>
                                        <td>{user.phoneNumber}</td>
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
