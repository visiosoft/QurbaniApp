import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import '../styles/Login.css';

const Login = ({ setIsAuthenticated, setAdminRole, setAdminInfo }) => {
    const [credentials, setCredentials] = useState({
        username: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            console.log('🔐 Attempting login...');
            const response = await authAPI.login(credentials);
            console.log('✅ Login response:', response.data);

            if (response.data.success) {
                console.log('✅ Login successful, saving JWT token');
                
                // Save JWT token to localStorage
                if (response.data.authToken) {
                    localStorage.setItem('authToken', response.data.authToken);
                    console.log('✅ JWT token saved');
                } else {
                    console.error('❌ No authToken in response');
                    setError('Login failed: No authentication token received');
                    setLoading(false);
                    return;
                }
                
                // Save admin info
                if (response.data.admin) {
                    setIsAuthenticated(true);
                    if (setAdminRole) {
                        setAdminRole(response.data.admin.role);
                    }
                    if (setAdminInfo) {
                        setAdminInfo(response.data.admin);
                    }
                    localStorage.setItem('admin', JSON.stringify(response.data.admin));
                    console.log('✅ Admin info stored:', response.data.admin.role);
                }

                console.log('🚀 Navigating to dashboard...');
                navigate('/dashboard');
            }
        } catch (err) {
            console.error('❌ Login error:', err);
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1>Qurbani Management</h1>
                    <h2>Admin Panel</h2>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={credentials.username}
                            onChange={handleChange}
                            required
                            autoFocus
                            placeholder="Enter admin username"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={credentials.password}
                            onChange={handleChange}
                            required
                            placeholder="Enter password"
                        />
                    </div>

                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className="login-footer">
                    <p>Default credentials: admin / admin123</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
