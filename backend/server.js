const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

// Trust proxy - required for secure cookies behind reverse proxy
app.set('trust proxy', 1);

// Connect to MongoDB
connectDB();

// CORS configuration - Allow all origins
app.use(cors({
    origin: true, // Allow all origins
    credentials: true // Allow cookies
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log all responses to see Set-Cookie headers
app.use((req, res, next) => {
    const originalEnd = res.end;
    res.end = function (...args) {
        if (req.path === '/api/auth/login' || req.path.includes('auth')) {
            const setCookie = res.getHeader('Set-Cookie');
            console.log(`📤 Response for ${req.path}:`, {
                setCookie: setCookie || 'NONE',
                statusCode: res.statusCode
            });
        }
        originalEnd.apply(res, args);
    };
    next();
});

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'qurbani-secret-key-2026',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        dbName: process.env.DB_NAME || 'QurbaniDb'
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // true in production (HTTPS)
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-domain in production
        domain: undefined, // Let browser handle domain
        path: '/' // Explicitly set path
    }
}));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/companies', require('./routes/companies'));
app.use('/api/user', require('./routes/user')); // User profile operations
app.use('/api/users', require('./routes/users'));
app.use('/api/groups', require('./routes/groups')); // Admin group management
app.use('/api/group', require('./routes/group')); // Mobile group operations
app.use('/api/qurbani', require('./routes/qurbani'));
app.use('/api/admins', require('./routes/admins'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Qurbani Management API is running' });
});

// Configuration check endpoint (for debugging deployment issues)
app.get('/api/config-check', (req, res) => {
    res.json({
        nodeEnv: process.env.NODE_ENV || 'not set',
        sessionConfigured: {
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            httpOnly: true,
            maxAge: '24 hours'
        },
        corsOrigins: 'ALL (origin: true, credentials: true)',
        frontendUrl: process.env.FRONTEND_URL || 'not set',
        trustProxy: app.get('trust proxy'),
        timestamp: new Date().toISOString()
    });
});

// Session debug endpoint (check if session exists)
app.get('/api/session-debug', (req, res) => {
    res.json({
        hasSession: !!req.session,
        sessionID: req.sessionID,
        hasAdminId: !!req.session?.adminId,
        adminRole: req.session?.role,
        companyId: req.session?.companyId,
        cookie: {
            originalMaxAge: req.session?.cookie?.originalMaxAge,
            expires: req.session?.cookie?.expires,
            secure: req.session?.cookie?.secure,
            httpOnly: req.session?.cookie?.httpOnly,
            sameSite: req.session?.cookie?.sameSite
        },
        headers: {
            origin: req.headers.origin,
            referer: req.headers.referer,
            cookie: req.headers.cookie ? 'present (not shown for security)' : 'missing'
        }
    });
});

// Test cookie endpoint - force set a session value
app.get('/api/test-cookie', (req, res) => {
    req.session.testValue = 'cookie-test-' + Date.now();
    req.session.save((err) => {
        if (err) {
            return res.status(500).json({ error: 'Session save failed', details: err.message });
        }
        res.json({
            message: 'Session value set',
            sessionID: req.sessionID,
            testValue: req.session.testValue,
            cookieConfig: {
                secure: req.session.cookie.secure,
                sameSite: req.session.cookie.sameSite,
                httpOnly: req.session.cookie.httpOnly,
                domain: req.session.cookie.domain
            }
        });
    });
});

// Verify cookie endpoint - check if cookie is being sent back
app.get('/api/verify-cookie', (req, res) => {
    res.json({
        hasCookieHeader: !!req.headers.cookie,
        cookieHeader: req.headers.cookie || 'NONE',
        sessionID: req.sessionID,
        hasSession: !!req.session,
        testValue: req.session?.testValue || 'NOT SET',
        message: req.session?.testValue ? 'Cookie is working!' : 'Cookie not persisting'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: err.message
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Local: http://localhost:${PORT}`);

    // Get network IP for mobile device access
    const os = require('os');
    const networkInterfaces = os.networkInterfaces();
    const networkIPs = [];

    Object.keys(networkInterfaces).forEach((interfaceName) => {
        networkInterfaces[interfaceName].forEach((iface) => {
            if (iface.family === 'IPv4' && !iface.internal) {
                networkIPs.push(iface.address);
            }
        });
    });

    if (networkIPs.length > 0) {
        console.log(`Network: http://${networkIPs[0]}:${PORT} (for mobile devices)`);
    }
});
