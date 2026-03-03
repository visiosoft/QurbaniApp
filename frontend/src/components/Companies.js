import React, { useState, useEffect } from 'react';
import { companiesAPI } from '../services/api';
import '../styles/Companies.css';

const Companies = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        total: 0
    });
    const [filters, setFilters] = useState({
        status: '',
        search: '',
        page: 1,
        limit: 10
    });
    const [searchInput, setSearchInput] = useState('');
    const [formData, setFormData] = useState({
        companyName: '',
        companyCode: '',
        address: '',
        contactPerson: '',
        contactNumber: '',
        email: '',
        status: 'active',
    });

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters(prev => ({ ...prev, search: searchInput, page: 1 }));
        }, 500);
        return () => clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        fetchCompanies();
    }, [filters.status, filters.search, filters.page]);

    const fetchCompanies = async () => {
        try {
            setLoading(true);
            const response = await companiesAPI.getAll(filters);
            setCompanies(response.data.companies);
            setPagination({
                currentPage: parseInt(response.data.currentPage),
                totalPages: response.data.totalPages,
                total: response.data.total
            });
            setLoading(false);
        } catch (err) {
            setError('Failed to load companies');
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
            status: '',
            search: '',
            page: 1,
            limit: 10
        });
        setSearchInput('');
    };

    const handlePageChange = (newPage) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    const handleFormChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleEdit = (company) => {
        setFormData({
            companyName: company.companyName,
            companyCode: company.companyCode,
            address: company.address || '',
            contactPerson: company.contactPerson || '',
            contactNumber: company.contactNumber || '',
            email: company.email || '',
            status: company.status,
        });
        setEditingId(company._id);
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingId) {
                await companiesAPI.update(editingId, formData);
                alert('Company updated successfully!');
            } else {
                await companiesAPI.create(formData);
                alert('Company created successfully!');
            }
            setShowForm(false);
            setEditingId(null);
            setFormData({
                companyName: '',
                companyCode: '',
                address: '',
                contactPerson: '',
                contactNumber: '',
                email: '',
                status: 'active',
            });
            fetchCompanies();
        } catch (err) {
            alert(err.response?.data?.message || `Failed to ${editingId ? 'update' : 'create'} company`);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this company? This will fail if the company has users or groups.')) {
            try {
                await companiesAPI.delete(id);
                fetchCompanies();
                alert('Company deleted successfully!');
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to delete company');
            }
        }
    };

    const cancelForm = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({
            companyName: '',
            companyCode: '',
            address: '',
            contactPerson: '',
            contactNumber: '',
            email: '',
            status: 'active',
        });
    };

    return (
        <div className="companies-page">
            <div className="page-header">
                <h1>Companies Management</h1>
                <button
                    className="add-button"
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? 'Cancel' : '+ Add Company'}
                </button>
            </div>

            {/* Add/Edit Company Form */}
            {showForm && (
                <div className="form-container">
                    <h2>{editingId ? 'Edit Company' : 'Create Company'}</h2>
                    <form onSubmit={handleSubmit} className="company-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Company Name *</label>
                                <input
                                    type="text"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleFormChange}
                                    required
                                    placeholder="Enter company name"
                                />
                            </div>

                            <div className="form-group">
                                <label>Company Code *</label>
                                <input
                                    type="text"
                                    name="companyCode"
                                    value={formData.companyCode}
                                    onChange={handleFormChange}
                                    required
                                    placeholder="e.g., ABC, XYZ"
                                    style={{ textTransform: 'uppercase' }}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Contact Person</label>
                                <input
                                    type="text"
                                    name="contactPerson"
                                    value={formData.contactPerson}
                                    onChange={handleFormChange}
                                    placeholder="Enter contact person name"
                                />
                            </div>

                            <div className="form-group">
                                <label>Contact Number</label>
                                <input
                                    type="tel"
                                    name="contactNumber"
                                    value={formData.contactNumber}
                                    onChange={handleFormChange}
                                    placeholder="+966 xxx xxx xxx"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleFormChange}
                                    placeholder="company@example.com"
                                />
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
                        </div>

                        <div className="form-group">
                            <label>Address</label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleFormChange}
                                placeholder="Enter company address"
                                rows="3"
                            />
                        </div>

                        <div className="form-buttons">
                            <button type="submit" className="submit-button">
                                {editingId ? 'Update Company' : 'Create Company'}
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
                    {(filters.status || filters.search) && (
                        <button onClick={clearFilters} className="clear-filters-btn">
                            Clear All Filters
                        </button>
                    )}
                </div>

                <div className="filters">
                    <input
                        type="text"
                        placeholder="Search by name, code, or contact person..."
                        value={searchInput}
                        onChange={handleSearchChange}
                        className="search-input"
                    />

                    <select name="status" value={filters.status} onChange={handleFilterChange}>
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </div>

            {/* Companies List */}
            <div className="data-section">
                <div className="section-header">
                    <h3>Companies List</h3>
                    <span className="count-badge">{pagination.total} companies</span>
                </div>

                {loading ? (
                    <div className="loading">Loading...</div>
                ) : error ? (
                    <div className="error">{error}</div>
                ) : companies.length === 0 ? (
                    <div className="no-data">No companies found</div>
                ) : (
                    <>
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Company Name</th>
                                        <th>Code</th>
                                        <th>Contact Person</th>
                                        <th>Contact Number</th>
                                        <th>Email</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {companies.map((company) => (
                                        <tr key={company._id}>
                                            <td className="company-name">{company.companyName}</td>
                                            <td className="company-code">{company.companyCode}</td>
                                            <td>{company.contactPerson || '-'}</td>
                                            <td>{company.contactNumber || '-'}</td>
                                            <td>{company.email || '-'}</td>
                                            <td>
                                                <span className={`status-badge ${company.status}`}>
                                                    {company.status}
                                                </span>
                                            </td>
                                            <td className="actions">
                                                <button
                                                    onClick={() => handleEdit(company)}
                                                    className="edit-btn"
                                                    title="Edit"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(company._id)}
                                                    className="delete-btn"
                                                    title="Delete"
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
                                    className="pagination-btn"
                                >
                                    Previous
                                </button>
                                <span className="page-info">
                                    Page {pagination.currentPage} of {pagination.totalPages}
                                </span>
                                <button
                                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                                    disabled={pagination.currentPage === pagination.totalPages}
                                    className="pagination-btn"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Companies;
