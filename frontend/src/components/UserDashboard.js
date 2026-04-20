import React, { useCallback, useEffect, useState } from 'react';
import { authAPI, qurbaniAPI, userGroupAPI } from '../services/api';
import '../styles/UserPortal.css';

const statusOptions = ['pending', 'ready', 'done'];

const formatDate = (value) => {
    if (!value) {
        return 'Not set';
    }

    return new Date(value).toLocaleString();
};

const UserDashboard = ({ userInfo, setUserInfo }) => {
    const [qurbani, setQurbani] = useState(null);
    const [groupData, setGroupData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusLoading, setStatusLoading] = useState(false);
    const [memberLoadingId, setMemberLoadingId] = useState(null);

    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            setError('');

            const [profileResponse, qurbaniResponse] = await Promise.all([
                authAPI.getUserProfile(),
                qurbaniAPI.getMine(),
            ]);

            const nextUser = profileResponse.data.user;
            setUserInfo(nextUser);
            setQurbani(qurbaniResponse.data.qurbani);

            if (nextUser.accountType === 'group') {
                const groupResponse = await userGroupAPI.getMembers();
                setGroupData(groupResponse.data);
            } else {
                setGroupData(null);
            }
        } catch (err) {
            console.error('Failed to load user dashboard:', err);
            setError(err.response?.data?.message || 'Failed to load your dashboard');
        } finally {
            setLoading(false);
        }
    }, [setUserInfo]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const handleStatusUpdate = async (status) => {
        try {
            setStatusLoading(true);
            const response = await qurbaniAPI.updateMyStatus({ status });
            setQurbani(response.data.qurbani);
            setUserInfo((currentUser) => currentUser ? {
                ...currentUser,
                status: response.data.user.status,
            } : currentUser);
        } catch (err) {
            console.error('Failed to update status:', err);
            setError(err.response?.data?.message || 'Failed to update your status');
        } finally {
            setStatusLoading(false);
        }
    };

    const handleMarkMemberReady = async (memberId) => {
        try {
            setMemberLoadingId(memberId);
            await userGroupAPI.markMemberReady({ memberId });
            await fetchDashboardData();
        } catch (err) {
            console.error('Failed to mark member ready:', err);
            setError(err.response?.data?.message || 'Failed to mark group member as ready');
        } finally {
            setMemberLoadingId(null);
        }
    };

    if (loading) {
        return <div className="user-portal-loading">Loading your dashboard...</div>;
    }

    const currentUser = userInfo || {};
    const isRepresentative = groupData?.group?.representative?.id === currentUser.id;

    return (
        <div className="user-portal-page">
            <div className="user-portal-header">
                <div>
                    <h1>My Dashboard</h1>
                    <p>Track your qurbani progress and account details.</p>
                </div>
                <div className="user-portal-identity">
                    <span>{currentUser.name || 'User'}</span>
                    <span>{currentUser.phoneNumber || 'No phone number'}</span>
                </div>
            </div>

            {error && <div className="user-portal-error">{error}</div>}

            <div className="user-portal-grid">
                <section className="user-card">
                    <h2>Account Summary</h2>
                    <dl className="user-detail-list">
                        <div>
                            <dt>Passport</dt>
                            <dd>{currentUser.passportNumber || 'N/A'}</dd>
                        </div>
                        <div>
                            <dt>Account Type</dt>
                            <dd>{currentUser.accountType || 'N/A'}</dd>
                        </div>
                        <div>
                            <dt>Status</dt>
                            <dd>{currentUser.status || 'N/A'}</dd>
                        </div>
                        <div>
                            <dt>Qurbani Type</dt>
                            <dd>{currentUser.qurbaniType || 'N/A'}</dd>
                        </div>
                    </dl>
                </section>

                <section className="user-card">
                    <h2>My Qurbani</h2>
                    {qurbani ? (
                        <>
                            <dl className="user-detail-list">
                                <div>
                                    <dt>Type</dt>
                                    <dd>{qurbani.qurbaniType}</dd>
                                </div>
                                <div>
                                    <dt>Current Status</dt>
                                    <dd>{qurbani.status}</dd>
                                </div>
                                <div>
                                    <dt>Created</dt>
                                    <dd>{formatDate(qurbani.createdAt)}</dd>
                                </div>
                                <div>
                                    <dt>Completed</dt>
                                    <dd>{formatDate(qurbani.completedAt)}</dd>
                                </div>
                            </dl>

                            <div className="status-actions">
                                {statusOptions.map((status) => (
                                    <button
                                        key={status}
                                        type="button"
                                        className={status === qurbani.status ? 'status-button active' : 'status-button'}
                                        onClick={() => handleStatusUpdate(status)}
                                        disabled={statusLoading || status === qurbani.status}
                                    >
                                        {statusLoading && status === qurbani.status ? 'Saving...' : `Mark ${status}`}
                                    </button>
                                ))}
                            </div>
                        </>
                    ) : (
                        <p>No qurbani record found for this account.</p>
                    )}
                </section>
            </div>

            {groupData && (
                <section className="user-card group-card">
                    <div className="section-header">
                        <div>
                            <h2>{groupData.group.groupName}</h2>
                            <p>
                                {groupData.group.qurbaniType} group, status {groupData.group.status}
                            </p>
                        </div>
                        <span className="representative-badge">
                            Representative: {groupData.group.representative.name}
                        </span>
                    </div>

                    <div className="user-table-wrap">
                        <table className="user-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Passport</th>
                                    <th>Status</th>
                                    <th>Qurbani</th>
                                    <th>Role</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {groupData.members.map((member) => (
                                    <tr key={member.id}>
                                        <td>{member.name}</td>
                                        <td>{member.passportNumber}</td>
                                        <td>{member.status}</td>
                                        <td>{member.qurbaniStatus}</td>
                                        <td>{member.isRepresentative ? 'Representative' : 'Member'}</td>
                                        <td>
                                            {isRepresentative && !member.isRepresentative && member.status !== 'ready' ? (
                                                <button
                                                    type="button"
                                                    className="inline-action-button"
                                                    onClick={() => handleMarkMemberReady(member.id)}
                                                    disabled={memberLoadingId === member.id}
                                                >
                                                    {memberLoadingId === member.id ? 'Saving...' : 'Mark Ready'}
                                                </button>
                                            ) : (
                                                <span className="muted-label">No action</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}
        </div>
    );
};

export default UserDashboard;