import React, { useState, useEffect } from 'react';
import { qurbaniAPI } from '../services/api';
import '../styles/QurbaniList.css';

const QurbaniList = () => {
    const [qurbaniList, setQurbaniList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        total: 0
    });
    const [filters, setFilters] = useState({
        qurbaniType: '',
        status: '',
        accountType: '',
        page: 1,
        limit: 10
    });
    const [searchInput, setSearchInput] = useState('');

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters(prev => ({ ...prev, search: searchInput, page: 1 }));
        }, 500);
        return () => clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        fetchQurbani();
    }, [filters.qurbaniType, filters.status, filters.accountType, filters.search, filters.page]);

    const fetchQurbani = async () => {
        try {
            setLoading(true);
            const response = await qurbaniAPI.getAll(filters);
            setQurbaniList(response.data.qurbaniRequests);
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
        return count;
    };

    const exportToCSV = () => {
        // Prepare CSV data
        const headers = ['Type', 'Account Type', 'Name/Group', 'Status', 'Created', 'Completed'];
        const rows = qurbaniList.map(q => [
            q.qurbaniType,
            q.accountType,
            q.userId ? q.userId.name : (q.groupId ? q.groupId.groupName : 'N/A'),
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
                        placeholder="Search by name, group, or passport..."
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
                <div className="table-container">
                    <table className="qurbani-table">
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Account</th>
                                <th>Details</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th>Completed</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {qurbaniList.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="no-data">No Qurbani requests found</td>
                                </tr>
                            ) : (
                                qurbaniList.map((qurbani) => (
                                    <tr key={qurbani._id}>
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
                                            ) : qurbani.groupId ? (
                                                <div>
                                                    <strong>{qurbani.groupId.groupName}</strong><br />
                                                    <small>{qurbani.groupId.members?.length || 0} members</small>
                                                </div>
                                            ) : (
                                                'N/A'
                                            )}
                                        </td>
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
                                            {qurbani.status !== 'done' && (
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
