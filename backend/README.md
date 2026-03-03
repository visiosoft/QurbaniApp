# Backend - Qurbani Management System

Express.js REST API for Qurbani Management System

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Start production server:
```bash
npm start
```

## Environment Variables

Make sure `.env` file has:
- MONGODB_URI
- DB_NAME
- PORT
- SESSION_SECRET
- ADMIN_USERNAME
- ADMIN_PASSWORD

## API Documentation

See main README.md for complete API documentation.

## Development

- Use `nodemon` for auto-restart during development
- MongoDB connection is configured in `config/db.js`
- All routes require authentication except `/api/auth/*`
