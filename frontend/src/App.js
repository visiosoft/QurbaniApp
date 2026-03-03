import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authAPI } from './services/api';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Companies from './components/Companies';
import Users from './components/Users';
import Groups from './components/Groups';
import QurbaniList from './components/QurbaniList';
import Admins from './components/Admins';
import './styles/App.css';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await authAPI.checkAuth();
            setIsAuthenticated(response.data.authenticated);
        } catch (err) {
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="app-loading">
                <div className="spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <Router>
            <div className="App">
                <Navbar
                    isAuthenticated={isAuthenticated}
                    setIsAuthenticated={setIsAuthenticated}
                />

                <div className={`main-content ${isAuthenticated ? 'authenticated' : ''}`}>
                    <Routes>
                        <Route
                            path="/login"
                            element={
                                isAuthenticated ?
                                    <Navigate to="/dashboard" /> :
                                    <Login setIsAuthenticated={setIsAuthenticated} />
                            }
                        />

                        <Route
                            path="/dashboard"
                            element={
                                isAuthenticated ?
                                    <Dashboard /> :
                                    <Navigate to="/login" />
                            }
                        />

                        <Route
                            path="/users"
                            element={
                                isAuthenticated ?
                                    <Users /> :
                                    <Navigate to="/login" />
                            }
                        />

                        <Route
                            path="/companies"
                            element={
                                isAuthenticated ?
                                    <Companies /> :
                                    <Navigate to="/login" />
                            }
                        />

                        <Route
                            path="/groups"
                            element={
                                isAuthenticated ?
                                    <Groups /> :
                                    <Navigate to="/login" />
                            }
                        />

                        <Route
                            path="/qurbani"
                            element={
                                isAuthenticated ?
                                    <QurbaniList /> :
                                    <Navigate to="/login" />
                            }
                        />

                        <Route
                            path="/admins"
                            element={
                                isAuthenticated ?
                                    <Admins /> :
                                    <Navigate to="/login" />
                            }
                        />

                        <Route
                            path="/"
                            element={
                                <Navigate to={isAuthenticated ? "/dashboard" : "/login"} />
                            }
                        />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;
