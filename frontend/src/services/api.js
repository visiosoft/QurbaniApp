import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Only redirect to login if we're not already on login page
            // and if it's not the initial auth check
            const isLoginPage = window.location.pathname === '/login';
            const isAuthCheck = error.config?.url?.includes('/auth/check');
            
            if (!isLoginPage && !isAuthCheck) {
                console.log('Unauthorized - redirecting to login');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    logout: () => api.post('/auth/logout'),
    checkAuth: () => api.get('/auth/check'),
};

// Users API
export const usersAPI = {
    getAll: (params) => api.get('/users', { params }),
    getById: (id) => api.get(`/users/${id}`),
    create: (data) => api.post('/users', data),
    update: (id, data) => api.put(`/users/${id}`, data),
    delete: (id) => api.delete(`/users/${id}`),
};

// Groups API
export const groupsAPI = {
    getAll: (params) => api.get('/groups', { params }),
    getById: (id) => api.get(`/groups/${id}`),
    create: (data) => api.post('/groups', data),
    addMember: (data) => api.post('/groups/add-member', data),
    removeMember: (data) => api.post('/groups/remove-member', data),
    update: (id, data) => api.put(`/groups/${id}`, data),
    delete: (id) => api.delete(`/groups/${id}`),
};

// Companies API
export const companiesAPI = {
    getAll: (params) => api.get('/companies', { params }),
    getActive: () => api.get('/companies/active'),
    getById: (id) => api.get(`/companies/${id}`),
    create: (data) => api.post('/companies', data),
    update: (id, data) => api.put(`/companies/${id}`, data),
    delete: (id) => api.delete(`/companies/${id}`),
};

// Qurbani API
export const qurbaniAPI = {
    getAll: (params) => api.get('/qurbani', { params }),
    getStats: () => api.get('/qurbani/stats'),
    getById: (id) => api.get(`/qurbani/${id}`),
    updateStatus: (id, data) => api.put(`/qurbani/${id}`, data),
    markAsDone: (id) => api.post(`/qurbani/${id}/mark-done`),
    delete: (id) => api.delete(`/qurbani/${id}`),
};

// Admins API
export const adminsAPI = {
    getAll: (params) => api.get('/admins', { params }),
    create: (data) => api.post('/admins', data),
    update: (id, data) => api.put(`/admins/${id}`, data),
    delete: (id) => api.delete(`/admins/${id}`),
    changePassword: (data) => api.post('/admins/change-password', data),
};

export default api;
