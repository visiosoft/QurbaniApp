import React, { useState, useEffect } from 'react';
import { groupsAPI, usersAPI, companiesAPI } from '../services/api';
import './Modal.css';
import '../styles/Groups.css';

const Groups = ({ adminRole, adminInfo }) => {
    const [groups, setGroups] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [showAddMember, setShowAddMember] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        total: 0
    });
    const [filters, setFilters] = useState({
        status: '',
        qurbaniType: '',
        search: '',
        companyId: '',
        page: 1,
        limit: 10
    });
    
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
    const [searchInput, setSearchInput] = useState('');
    const [formData, setFormData] = useState({
        groupName: '',
        representativeId: '',
        qurbaniType: 'Sheep',
    });
    const [memberData, setMemberData] = useState({
        groupId: '',
        userId: '',
    });

    // New user creation state
    const [showCreateUser, setShowCreateUser] = useState(false);
    const [modalGroupId, setModalGroupId] = useState(null); // Track which group modal is open for
    const [newUserData, setNewUserData] = useState({
        name: '',
        passportNumber: '',
        phoneNumber: '',
    });
    // Create new user directly from group UI
    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name: newUserData.name,
                passportNumber: newUserData.passportNumber,
                phoneNumber: newUserData.phoneNumber,
                qurbaniType: 'Sheep',
                accountType: 'individual',
            };
            const response = await usersAPI.create(payload);
            setShowCreateUser(false);
            setModalGroupId(null);
            setNewUserData({ name: '', passportNumber: '', phoneNumber: '' });
            // Directly add the new user to the group
            await groupsAPI.addMember({
                groupId: modalGroupId,
                userId: response.data.user._id,
            });
            fetchGroups();
            fetchAvailableUsers();
            alert('User created and added to group!');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create user or add to group');
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
        fetchGroups();
        fetchAvailableUsers();
    }, [filters.status, filters.qurbaniType, filters.search, filters.companyId, filters.page]);

    const fetchGroups = async () => {
        try {
            setLoading(true);
            const response = await groupsAPI.getAll(filters);
            setGroups(response.data.groups);
            setPagination({
                currentPage: parseInt(response.data.currentPage),
                totalPages: response.data.totalPages,
                total: response.data.total
            });
            setLoading(false);
        } catch (err) {
            setError('Failed to load groups');
            setLoading(false);
        }
    };

    const fetchAvailableUsers = async () => {
        try {
            // Fetch users who are not already in a group
            const response = await usersAPI.getAll({ accountType: 'individual' });
            setUsers(response.data.users);
        } catch (err) {
            console.error('Failed to load users:', err);
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
            qurbaniType: '',
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
        if (filters.status) count++;
        if (filters.qurbaniType) count++;
        if (filters.search) count++;
        if (filters.companyId) count++;
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
            await groupsAPI.create(formData);
            setShowForm(false);
            setFormData({
                groupName: '',
                representativeId: '',
                qurbaniType: 'Sheep',
            });
            fetchGroups();
            fetchAvailableUsers();
            alert('Group created successfully!');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create group');
        }
    };

    const handleAddMember = async (groupId) => {
        if (!memberData.userId) {
            alert('Please select a user');
            return;
        }

        try {
            await groupsAPI.addMember({
                groupId,
                userId: memberData.userId,
            });
            setShowAddMember(null);
            setMemberData({ groupId: '', userId: '' });
            fetchGroups();
            fetchAvailableUsers();
            alert('Member added successfully!');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add member');
        }
    };

    const handleRemoveMember = async (groupId, userId) => {
        if (window.confirm('Are you sure you want to remove this member?')) {
            try {
                await groupsAPI.removeMember({ groupId, userId });
                fetchGroups();
                fetchAvailableUsers();
                alert('Member removed successfully!');
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to remove member');
            }
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this group?')) {
            try {
                await groupsAPI.delete(id);
                fetchGroups();
                fetchAvailableUsers();
                alert('Group deleted successfully!');
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to delete group');
            }
        }
    };

    // Remove member limit for groups
    const getMemberLimit = () => Infinity;

    return (
        <div className="groups-page">
            <div className="page-header">
                <h1>Groups Management</h1>
                <button
                    className="add-button"
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? 'Cancel' : '+ Create Group'}
                </button>
            </div>

            {/* Create Group Form */}
            {showForm && (
                <div className="form-container">
                    <h2>Create New Group</h2>
                    <form onSubmit={handleSubmit} className="group-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Group Name *</label>
                                <input
                                    type="text"
                                    name="groupName"
                                    value={formData.groupName}
                                    onChange={handleFormChange}
                                    required
                                    placeholder="Enter group name"
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
                                    <option value="Sheep">Sheep (1 person)</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Representative *</label>
                            <select
                                name="representativeId"
                                value={formData.representativeId}
                                onChange={handleFormChange}
                                required
                            >
                                <option value="">Select Representative</option>
                                {users.map((user) => (
                                    <option key={user._id} value={user._id}>
                                        {user.name} - {user.passportNumber}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button type="submit" className="submit-button">
                            Create Group
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
                        placeholder="Search by group name..."
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
                    Showing {groups.length} of {pagination.total} groups
                    {filters.search && ` - Search: "${filters.search}"`}
                </div>
            </div>

            {/* Groups List */}
            {loading ? (
                <div className="loading">Loading groups...</div>
            ) : error ? (
                <div className="error">{error}</div>
            ) : (
                <div className="groups-grid">
                    {groups.length === 0 ? (
                        <div className="no-data">No groups found</div>
                    ) : (
                        groups.map((group) => (
                            <div key={group._id} className="group-card">

                                <div className="group-header">
                                    <h3>
                                        {group.groupName}
                                        {group.members && group.members.length > 0 && (
                                            <span style={{ fontWeight: 400, fontSize: '0.95em', color: '#666', marginLeft: 8 }}>
                                                — {group.members[0].name}
                                            </span>
                                        )}
                                    </h3>
                                    <span className={`status ${group.status}`}>
                                        {group.status}
                                    </span>
                                </div>

                                <div className="group-info">
                                    {isSuperAdmin && group.companyId && (
                                        <p><strong>Company:</strong> <span className="company-badge">{group.companyId.companyName}</span></p>
                                    )}
                                    <p><strong>Type:</strong> {group.qurbaniType}</p>
                                    <p><strong>Members:</strong> {group.members.length} / {getMemberLimit(group.qurbaniType)}</p>
                                    <p><strong>Representative:</strong> {group.representative?.name}</p>
                                </div>

                                <div className="members-section">
                                    <h4>Members:</h4>
                                    <ul className="members-list">
                                        {group.members && group.members.map((member) => (
                                            <li key={member._id}>
                                                {member.name} - {member.passportNumber}
                                                {group.representative?._id !== member._id && (
                                                    <button
                                                        className="remove-member-btn"
                                                        onClick={() => handleRemoveMember(group._id, member._id)}
                                                    >
                                                        ×
                                                    </button>
                                                )}
                                            </li>
                                        ))}
                                    </ul>

                                    {group.members.length < getMemberLimit(group.qurbaniType) && (
                                        <div className="add-member-section">
                                            {showAddMember === group._id ? (
                                                <div className="add-member-form">
                                                    <select
                                                        value={memberData.userId}
                                                        onChange={(e) => setMemberData({ ...memberData, userId: e.target.value })}
                                                    >
                                                        <option value="">Select user</option>
                                                        {users.map((user) => (
                                                            <option key={user._id} value={user._id}>
                                                                {user.name} - {user.passportNumber}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        className="confirm-btn"
                                                        onClick={() => handleAddMember(group._id)}
                                                    >
                                                        Add
                                                    </button>
                                                    <button
                                                        className="cancel-btn"
                                                        onClick={() => setShowAddMember(null)}
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        className="create-user-btn"
                                                        type="button"
                                                        onClick={() => { setShowCreateUser(true); setModalGroupId(group._id); }}
                                                        style={{ marginLeft: 8 }}
                                                    >
                                                        + New User
                                                    </button>
                                                    {showCreateUser && modalGroupId === group._id && (
                                                        <div className="modal-overlay">
                                                            <div className="modal-content">
                                                                <h3>Create New User</h3>
                                                                <form className="create-user-form" onSubmit={handleCreateUser}>
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Name"
                                                                        value={newUserData.name}
                                                                        onChange={e => setNewUserData({ ...newUserData, name: e.target.value })}
                                                                        required
                                                                    />
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Passport Number"
                                                                        value={newUserData.passportNumber}
                                                                        onChange={e => setNewUserData({ ...newUserData, passportNumber: e.target.value })}
                                                                        required
                                                                    />
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Phone"
                                                                        value={newUserData.phoneNumber}
                                                                        onChange={e => setNewUserData({ ...newUserData, phoneNumber: e.target.value })}
                                                                    />
                                                                    {/* Email field removed as requested */}
                                                                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                                                                        <button type="submit" className="confirm-btn">Create User</button>
                                                                        <button type="button" className="cancel-btn" onClick={() => { setShowCreateUser(false); setModalGroupId(null); }}>Cancel</button>
                                                                    </div>
                                                                </form>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <button
                                                    className="add-member-btn"
                                                    onClick={() => setShowAddMember(group._id)}
                                                >
                                                    + Add Member
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="group-actions">
                                    <button
                                        className="delete-btn"
                                        onClick={() => handleDelete(group._id)}
                                    >
                                        Delete Group
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
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

export default Groups;
