import React, { useState, useEffect } from 'react';
import { qurbaniAPI, companiesAPI } from '../services/api';
import '../styles/QurbaniList.css';

const QurbaniList = ({ adminRole, adminInfo }) => {
    const [qurbaniList, setQurbaniList] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedItems, setSelectedItems] = useState([]); // For multi-select
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        total: 0
    });
    const [filters, setFilters] = useState({
        qurbaniType: '',
        status: '',
        accountType: '',
        companyId: '',
        page: 1,
        limit: 10
    });
    const [searchInput, setSearchInput] = useState('');

    const isSuperAdmin = adminRole === 'super_admin';

    // Fetch companies for super admin
    const fetchCompanies = async () => {
        if (!isSuperAdmin) return;
        try {
            const response = await companiesAPI.getAll();
            setCompanies(response.data.companies || []);
        } catch (err) {
            console.error('Failed to load companies:', err);
        }
    };

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters(prev => ({ ...prev, search: searchInput, page: 1 }));
        }, 500);
        return () => clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        fetchCompanies();
    }, []);

    useEffect(() => {
        fetchQurbani();
    }, [filters.qurbaniType, filters.status, filters.accountType, filters.companyId, filters.search, filters.page]);

    const fetchQurbani = async () => {
        try {
            setLoading(true);
            const response = await qurbaniAPI.getAll(filters);
            // Filter out group records - only show individual accounts
            const individualOnly = response.data.qurbaniRequests.filter(q => q.accountType === 'individual');
            setQurbaniList(individualOnly);
            setPagination({
                currentPage: parseInt(response.data.currentPage),
                totalPages: response.data.totalPages,
                total: response.data.total
            });
            setLoading(false);
        } catch (err) {
            setError('Failed to load Qurbani requests');
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
            qurbaniType: '',
            status: '',
            accountType: '',
            search: '',
            companyId: '',
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
        if (filters.qurbaniType) count++;
        if (filters.status) count++;
        if (filters.accountType) count++;
        if (filters.search) count++;
        if (filters.companyId) count++;
        return count;
    };

    const exportToCSV = () => {
        // Prepare CSV data
        const headers = ['Type', 'Account Type', 'Name', 'Status', 'Created', 'Completed'];
        const rows = qurbaniList.map(q => [
            q.qurbaniType,
            q.accountType,
            q.userId ? q.userId.name : 'N/A',
            q.status,
            new Date(q.createdAt).toLocaleDateString(),
            q.completedAt ? new Date(q.completedAt).toLocaleDateString() : 'N/A'
        ]);

        let csvContent = headers.join(',') + '\n';
        rows.forEach(row => {
            csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
        });

        // Download CSV
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `qurbani-requests-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handleMarkAsDone = async (id) => {
        if (window.confirm('Mark this Qurbani as completed? Notifications will be sent.')) {
            try {
                await qurbaniAPI.markAsDone(id);
                fetchQurbani();
                alert('Qurbani marked as done! Notifications sent successfully.');
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to mark as done');
            }
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await qurbaniAPI.updateStatus(id, { status: newStatus });
            fetchQurbani();
            alert(`Status updated to ${newStatus}`);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update status');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Multi-select handlers
    const toggleSelectItem = (id) => {
        setSelectedItems(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        const readyItems = qurbaniList.filter(q => q.status === 'ready');
        if (selectedItems.length === readyItems.length && readyItems.length > 0) {
            setSelectedItems([]);
        } else {
            // Only select items with 'ready' status
            const selectableItems = readyItems.map(q => q._id);
            setSelectedItems(selectableItems);
        }
    };

    const handleBulkMarkAsDone = async () => {
        if (selectedItems.length === 0) {
            alert('Please select items to mark as done');
            return;
        }

        if (!window.confirm(`Are you sure you want to mark ${selectedItems.length} item(s) as done?`)) {
            return;
        }

        try {
            // Mark each selected item as done
            await Promise.all(
                selectedItems.map(id =>
                    qurbaniAPI.updateStatus(id, { status: 'done' })
                )
            );

            setSelectedItems([]); // Clear selection
            fetchQurbani(); // Refresh list
            alert(`Successfully marked ${selectedItems.length} item(s) as done`);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to mark items as done');
        }
    };

    return (
        <div className="qurbani-page">
            <div className="page-header">
                <div>
                    <h1>Qurbani Requests</h1>
                    <p>Manage and track all Qurbani requests</p>
                </div>
                {qurbaniList.length > 0 && (
                    <button onClick={exportToCSV} className="export-btn">
                        📥 Export to CSV
                    </button>
                )}
            </div>

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
                        placeholder="Search by name or passport..."
                        value={searchInput}
                        onChange={handleSearchChange}
                        className="search-input"
                    />

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

                    <select name="accountType" value={filters.accountType} onChange={handleFilterChange}>
                        <option value="">All Account Types</option>
                        <option value="individual">Individual</option>
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
                    Showing {qurbaniList.length} of {pagination.total} Qurbani requests
                    {filters.search && ` - Search: "${filters.search}"`}
                </div>
            </div>

            {/* Qurbani Table */}
            {loading ? (
                <div className="loading">Loading Qurbani requests...</div>
            ) : error ? (
                <div className="error">{error}</div>
            ) : (
                <>
                    {/* Bulk Actions Bar */}
                    {selectedItems.length > 0 && (
                        <div className="bulk-actions-bar">
                            <span className="selected-count">
                                {selectedItems.length} item(s) selected
                            </span>
                            <button
                                className="bulk-action-btn mark-done"
                                onClick={handleBulkMarkAsDone}
                            >
                                ✓ Mark Selected as Done
                            </button>
                            <button
                                className="bulk-action-btn clear"
                                onClick={() => setSelectedItems([])}
                            >
                                Clear Selection
                            </button>
                        </div>
                    )}

                    <div className="table-container">
                        <table className="qurbani-table">
                            <thead>
                                <tr>
                                    <th className="checkbox-column">
                                        <input
                                            type="checkbox"
                                            onChange={toggleSelectAll}
                                            checked={selectedItems.length === qurbaniList.filter(q => q.status === 'ready').length && qurbaniList.filter(q => q.status === 'ready').length > 0}
                                        />
                                    </th>
                                    <th>Type</th>
                                    <th>Account</th>
                                    <th>Details</th>
                                    {isSuperAdmin && <th>Company</th>}
                                    <th>Status</th>
                                    <th>Created</th>
                                    <th>Completed</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {qurbaniList.length === 0 ? (
                                    <tr>
                                        <td colSpan={isSuperAdmin ? "9" : "8"} className="no-data">No Qurbani requests found</td>
                                    </tr>
                                ) : (
                                    qurbaniList.map((qurbani) => (
                                        <tr key={qurbani._id} className={selectedItems.includes(qurbani._id) ? 'selected-row' : ''}>
                                            <td className="checkbox-column">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedItems.includes(qurbani._id)}
                                                    onChange={() => toggleSelectItem(qurbani._id)}
                                                    disabled={qurbani.status !== 'ready'}
                                                />
                                            </td>
                                            <td>
                                                <span className="qurbani-type">
                                                    🐑 {qurbani.qurbaniType}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${qurbani.accountType}`}>
                                                    {qurbani.accountType}
                                                </span>
                                            </td>
                                            <td>
                                                {qurbani.userId ? (
                                                    <div>
                                                        <strong>{qurbani.userId.name}</strong><br />
                                                        <small>{qurbani.userId.passportNumber}</small><br />
                                                        <small>{qurbani.userId.phoneNumber}</small>
                                                    </div>
                                                ) : (
                                                    'N/A'
                                                )}
                                            </td>
                                            {isSuperAdmin && (
                                                <td>
                                                    {qurbani.userId?.companyId ? (
                                                        <span className="company-badge">
                                                            {qurbani.userId.companyId.companyName}
                                                        </span>
                                                    ) : (
                                                        'N/A'
                                                    )}
                                                </td>
                                            )}
                                            <td>
                                                <select
                                                    className={`status-select ${qurbani.status}`}
                                                    value={qurbani.status}
                                                    onChange={(e) => handleStatusChange(qurbani._id, e.target.value)}
                                                    disabled={qurbani.status === 'done'}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="ready">Ready</option>
                                                    <option value="done">Done</option>
                                                </select>
                                            </td>
                                            <td>{formatDate(qurbani.createdAt)}</td>
                                            <td>{formatDate(qurbani.completedAt)}</td>
                                            <td>
                                                {qurbani.status === 'ready' && (
                                                    <button
                                                        className="done-button"
                                                        onClick={() => handleMarkAsDone(qurbani._id)}
                                                    >
                                                        ✓ Mark Done
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
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

export default QurbaniList;
