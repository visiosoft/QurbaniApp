import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../services/api';
import '../styles/Navbar.css';

const Navbar = ({ isAuthenticated, setIsAuthenticated }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        try {
            await authAPI.logout();
            setIsAuthenticated(false);
            localStorage.removeItem('admin');
            navigate('/login');
        } catch (err) {
            console.error('Logout error:', err);
        }
    };

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
                <Link
                    to="/companies"
                    className={location.pathname === '/companies' ? 'active' : ''}
                >
                    Companies
                </Link>
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
                <Link
                    to="/admins"
                    className={location.pathname === '/admins' ? 'active' : ''}
                >
                    Admins
                </Link>
            </div>

            <div className="navbar-actions">
                <span className="admin-label">Admin</span>
                <button onClick={handleLogout} className="logout-button">
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
