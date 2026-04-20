import React, { useEffect, useState } from 'react';
import { authAPI, currentUserAPI } from '../services/api';
import '../styles/UserPortal.css';

const normalizeUser = (payload) => {
    if (!payload) {
        return null;
    }

    return {
        id: payload.id || payload._id,
        name: payload.name,
        passportNumber: payload.passportNumber,
        phoneNumber: payload.phoneNumber,
        qurbaniType: payload.qurbaniType,
        accountType: payload.accountType,
        status: payload.status,
        groupId: payload.groupId,
        companyId: payload.companyId,
        createdAt: payload.createdAt,
    };
};

const UserProfile = ({ userInfo, setUserInfo }) => {
    const [phoneNumber, setPhoneNumber] = useState(userInfo?.phoneNumber || '');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const response = await authAPI.getUserProfile();
                const nextUser = normalizeUser(response.data.user);
                setUserInfo(nextUser);
                setPhoneNumber(nextUser?.phoneNumber || '');
            } catch (err) {
                console.error('Failed to load user profile:', err);
                setError(err.response?.data?.message || 'Failed to load profile');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [setUserInfo]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        setError('');

        try {
            const response = await currentUserAPI.updateProfile({ phoneNumber });
            const nextUser = normalizeUser(response.data);
            setUserInfo(nextUser);
            setPhoneNumber(nextUser.phoneNumber || '');
            setMessage('Profile updated successfully.');
        } catch (err) {
            console.error('Failed to update profile:', err);
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="user-portal-loading">Loading your profile...</div>;
    }

    const currentUser = userInfo || {};

    return (
        <div className="user-portal-page">
            <div className="user-portal-header">
                <div>
                    <h1>My Profile</h1>
                    <p>Review your account details and update your phone number.</p>
                </div>
            </div>

            {error && <div className="user-portal-error">{error}</div>}
            {message && <div className="user-portal-success">{message}</div>}

            <div className="user-portal-grid single-column">
                <section className="user-card">
                    <h2>Account Details</h2>
                    <dl className="user-detail-list">
                        <div>
                            <dt>Name</dt>
                            <dd>{currentUser.name || 'N/A'}</dd>
                        </div>
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
                        <div>
                            <dt>Company</dt>
                            <dd>{currentUser.companyId?.companyName || 'Not available'}</dd>
                        </div>
                    </dl>
                </section>

                <section className="user-card">
                    <h2>Update Phone Number</h2>
                    <form onSubmit={handleSubmit} className="user-profile-form">
                        <label htmlFor="phoneNumber">Phone Number</label>
                        <input
                            id="phoneNumber"
                            type="text"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            required
                            autoComplete="tel"
                            placeholder="Enter your phone number"
                        />

                        <button type="submit" className="status-button active" disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
};

export default UserProfile;