# Quick Start Guide - Qurbani Management System

## Prerequisites
- Node.js (v14+)
- npm or yarn

## Installation Steps

### 1. Install Backend Dependencies

Open PowerShell/Terminal and run:

```powershell
cd "G:\Qurbani App\backend"
npm install
```

### 2. Install Frontend Dependencies

```powershell
cd "G:\Qurbani App\frontend"
npm install
```

### 3. Start Backend Server

```powershell
cd "G:\Qurbani App\backend"
npm run dev
```

✅ Backend will run on: http://localhost:5000

### 4. Start Frontend (New Terminal)

Open a NEW terminal window:

```powershell
cd "G:\Qurbani App\frontend"
npm start
```

✅ Frontend will open automatically at: http://localhost:3000

## Login Credentials

- **Username**: `admin`
- **Password**: `admin123`

## What's Included

✅ Complete backend API with:
- MongoDB models (User, Group, Qurbani)
- Express routes and controllers
- Authentication middleware
- Session management
- Validation logic
- Advanced search functionality

✅ Complete frontend with:
- Admin login/logout
- Dashboard with statistics
- User management (create individual accounts)
- Group management (create groups, add/remove members)
- Qurbani tracking (view all, filter, mark as done)
- **🔍 Advanced Search & Filter**:
  - Debounced real-time search
  - Multi-field filtering
  - Pagination controls
  - Clear all filters button
  - Export to CSV (Qurbani page)
  - Results summary
- Responsive design

## File Structure

```
Qurbani App/
├── backend/          → Express.js API
│   ├── config/       → Database configuration
│   ├── controllers/  → Business logic
│   ├── middleware/   → Authentication
│   ├── models/       → MongoDB schemas
│   ├── routes/       → API endpoints
│   └── server.js     → Entry point
│
└── frontend/         → React.js Admin Panel
    ├── src/
    │   ├── components/  → React components
    │   ├── services/    → API calls
    │   └── styles/      → CSS files
    └── public/
```

## Testing the System

1. **Login** to admin panel
2. **Create Users**: Add individual Qurbani requests
3. **Create Groups**: Create group accounts with multiple members
4. **View Dashboard**: See statistics and overview
5. **Manage Qurbani**: Filter, update status, mark as done
6. **🆕 Use Search & Filter**:
   - Type in search boxes to find specific items
   - Use dropdown filters to narrow results
   - Navigate through pages with pagination
   - Export Qurbani data to CSV
   - Clear all filters with one click

## 🔍 New Search & Filter Features

### Quick Tips
- **Search**: Type and wait 500ms for results
- **Filter**: Select from dropdowns to narrow results
- **Paginate**: Use First/Previous/Next/Last buttons
- **Clear**: Click "Clear All Filters" to reset
- **Export**: Download Qurbani data as CSV

### Documentation
- **Quick Reference**: [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Visual guide
- **Detailed Guide**: [SEARCH_FILTER_GUIDE.md](SEARCH_FILTER_GUIDE.md) - Complete documentation
- **Implementation**: [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Technical details

## Key Features

- ✅ Passport number uniqueness validation
- ✅ Member limits (Sheep=1, Cow=5, Camel=7)
- ✅ Status tracking (pending → ready → done)
- ✅ Mock notification system (ready for email/SMS)
- ✅ Filtering by type, status, account type
- ✅ Real-time statistics

## Need Help?

Check the main [README.md](README.md) for:
- Complete API documentation
- Data models
- Business rules
- Future enhancements

## MongoDB Connection

Your MongoDB is already configured:
- Database: QurbaniDb
- Connection: MongoDB Atlas

The connection credentials are set in `backend/.env`

---

🎉 **You're all set! Happy coding!**
