import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../services/api';
import '../styles/Navbar.css';

const Navbar = ({ isAuthenticated, setIsAuthenticated, adminRole, setAdminRole, adminInfo }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        try {
            await authAPI.logout();
            setIsAuthenticated(false);
            setAdminRole(null);
            localStorage.removeItem('admin');
            navigate('/login');
        } catch (err) {
            console.error('Logout error:', err);
        }
    };

    const isSuperAdmin = adminRole === 'super_admin';

    if (!isAuthenticated) {
        return null;
    }

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <h2>🕌 Qurbani Management</h2>
            </div>

            <div className="navbar-links">
                <Link
                    to="/dashboard"
                    className={location.pathname === '/dashboard' ? 'active' : ''}
                >
                    Dashboard
                </Link>
                {isSuperAdmin && (
                    <Link
                        to="/companies"
                        className={location.pathname === '/companies' ? 'active' : ''}
                    >
                        Companies
                    </Link>
                )}
                <Link
                    to="/users"
                    className={location.pathname === '/users' ? 'active' : ''}
                >
                    Users
                </Link>
                <Link
                    to="/groups"
                    className={location.pathname === '/groups' ? 'active' : ''}
                >
                    Groups
                </Link>
                <Link
                    to="/qurbani"
                    className={location.pathname === '/qurbani' ? 'active' : ''}
                >
                    Qurbani
                </Link>
                {isSuperAdmin && (
                    <Link
                        to="/admins"
                        className={location.pathname === '/admins' ? 'active' : ''}
                    >
                        Admins
                    </Link>
                )}
            </div>

            <div className="navbar-actions">
                <div className="admin-info-navbar">
                    {adminInfo?.company && (
                        <span className="company-label">
                            {adminRole === 'super_admin' ? 'ALL COMPANIES' : adminInfo.company.name}
                        </span>
                    )}
                    <span className="admin-label">{adminInfo?.fullName || 'Admin'}</span>
                </div>
                <button onClick={handleLogout} className="logout-button">
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
