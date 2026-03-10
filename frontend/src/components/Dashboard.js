import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { qurbaniAPI } from '../services/api';
import '../styles/Dashboard.css';

const Dashboard = ({ adminInfo }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await qurbaniAPI.getStats();
            setStats(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load statistics');
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading">Loading dashboard...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>Dashboard</h1>
                <div className="admin-info">
                    {adminInfo?.company && (
                        <p className="company-name">
                            🏢 {adminInfo.role === 'super_admin' ? 'All Companies' : adminInfo.company.name}
                        </p>
                    )}
                    {adminInfo?.fullName && (
                        <p className="admin-name">👤 {adminInfo.fullName}</p>
                    )}
                </div>
                <p>Qurbani Management System Overview</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card pending">
                    <h3>Pending</h3>
                    <p className="stat-number">{stats?.summary?.totalPending || 0}</p>
                </div>

                <div className="stat-card ready">
                    <h3>Ready</h3>
                    <p className="stat-number">{stats?.summary?.totalReady || 0}</p>
                </div>

                <div className="stat-card done">
                    <h3>Completed</h3>
                    <p className="stat-number">{stats?.summary?.totalDone || 0}</p>
                </div>

                <div className="stat-card individual">
                    <h3>Individual</h3>
                    <p className="stat-number">{stats?.summary?.totalIndividual || 0}</p>
                </div>

                <div className="stat-card group">
                    <h3>Groups</h3>
                    <p className="stat-number">{stats?.summary?.totalGroup || 0}</p>
                </div>
            </div>



            <div className="quick-actions">
                <h2>Quick Actions</h2>
                <div className="action-buttons">
                    <Link to="/users" className="action-btn">
                        👤 Manage Users
                    </Link>
                    <Link to="/groups" className="action-btn">
                        👥 Manage Groups
                    </Link>
                    <Link to="/qurbani" className="action-btn">
                        📋 View All Qurbani
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
