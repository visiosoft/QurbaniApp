const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
    origin: true, // Allow all origins (for mobile app development)
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
        secure: process.env.NODE_ENV === 'production'
    }
}));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/companies', require('./routes/companies'));
app.use('/api/users', require('./routes/users'));
app.use('/api/groups', require('./routes/groups')); // Admin group management
app.use('/api/group', require('./routes/group')); // Mobile group operations
app.use('/api/qurbani', require('./routes/qurbani'));
app.use('/api/admins', require('./routes/admins'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Qurbani Management API is running' });
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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
