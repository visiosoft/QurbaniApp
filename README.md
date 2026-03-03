# Qurbani Management System

A comprehensive admin panel for managing Hajj Qurbani requests using React.js, Express.js, and MongoDB.

## Features

- **Admin Authentication**: Secure login/logout with session management
- **User Management**: Create and manage individual Qurbani accounts
- **Group Management**: Create groups with member limits (Sheep=1, Cow=5, Camel=7)
- **Qurbani Tracking**: View and manage all Qurbani requests with filters
- **Status Updates**: Mark Qurbani as pending/ready/done
- **Notifications**: Mock notification system (ready for email/SMS integration)
- **Validation**: Passport number uniqueness, member limits per animal type
- **Dashboard**: Real-time statistics and overview
- **🔍 Advanced Search & Filter**: 
  - Debounced real-time search (500ms delay)
  - Multi-field filtering (status, type, account type)
  - Pagination controls (10 items per page)
  - Clear all filters button
  - Results count and summary
  - Export to CSV functionality
  - [See detailed guide →](SEARCH_FILTER_GUIDE.md)

## Tech Stack

### Backend
- Node.js & Express.js
- MongoDB & Mongoose
- Express Session for authentication
- Bcrypt for password hashing

### Frontend
- React.js (Functional Components)
- React Router for navigation
- Axios for API calls
- CSS3 for styling

## Project Structure

```
Qurbani App/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── groupController.js
│   │   └── qurbaniController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Group.js
│   │   └── Qurbani.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── groups.js
│   │   └── qurbani.js
│   ├── .env
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Dashboard.js
    │   │   ├── Login.js
    │   │   ├── Navbar.js
    │   │   ├── Users.js
    │   │   ├── Groups.js
    │   │   └── QurbaniList.js
    │   ├── services/
    │   │   └── api.js
    │   ├── styles/
    │   │   ├── App.css
    │   │   ├── Dashboard.css
    │   │   ├── Login.css
    │   │   ├── Navbar.css
    │   │   ├── Users.css
    │   │   ├── Groups.css
    │   │   └── QurbaniList.css
    │   ├── App.js
    │   └── index.js
    ├── .env
    └── package.json
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd "G:\Qurbani App\backend"
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables (already set in .env):
- MongoDB credentials are already configured
- Default admin: username=`admin`, password=`admin123`

4. Start the server:
```bash
npm run dev
```

Backend will run on http://localhost:5000

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd "G:\Qurbani App\frontend"
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

Frontend will run on http://localhost:3000

## Default Credentials

- **Username**: admin
- **Password**: admin123

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `GET /api/auth/check` - Check authentication status

### Users
- `GET /api/users` - Get all users (with filters)
- `GET /api/users/:id` - Get single user
- `POST /api/users` - Create individual user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Groups
- `GET /api/groups` - Get all groups (with filters)
- `GET /api/groups/:id` - Get single group
- `POST /api/groups` - Create group
- `POST /api/groups/add-member` - Add member to group
- `POST /api/groups/remove-member` - Remove member from group
- `PUT /api/groups/:id` - Update group
- `DELETE /api/groups/:id` - Delete group

### Qurbani
- `GET /api/qurbani` - Get all Qurbani requests (with filters)
- `GET /api/qurbani/stats` - Get statistics
- `GET /api/qurbani/:id` - Get single Qurbani
- `PUT /api/qurbani/:id` - Update Qurbani status
- `POST /api/qurbani/:id/mark-done` - Mark as done and send notifications
- `DELETE /api/qurbani/:id` - Delete Qurbani

## Data Models

### User
```javascript
{
  name: String,
  passportNumber: String (unique),
  phoneNumber: String,
  qurbaniType: 'Sheep' | 'Cow' | 'Camel',
  accountType: 'individual' | 'group',
  passwordHash: String,
  status: 'pending' | 'ready' | 'done',
  groupId: ObjectId
}
```

### Group
```javascript
{
  groupName: String,
  representative: ObjectId (User),
  members: [ObjectId] (Users),
  qurbaniType: 'Sheep' | 'Cow' | 'Camel',
  status: 'pending' | 'ready' | 'done'
}
```

### Qurbani
```javascript
{
  userId: ObjectId,
  groupId: ObjectId,
  qurbaniType: 'Sheep' | 'Cow' | 'Camel',
  accountType: 'individual' | 'group',
  status: 'pending' | 'ready' | 'done',
  createdAt: Date,
  completedAt: Date,
  notes: String
}
```

## Business Rules

1. **Passport Validation**: Each passport number must be unique
2. **Member Limits**:
   - Sheep: 1 person maximum
   - Cow: 5 people maximum
   - Camel: 7 people maximum
3. **Group Representative**: Cannot be removed from the group
4. **Status Flow**: pending → ready → done
5. **Notifications**: Sent automatically when status changes to "done"

## Future Enhancements

- [ ] Integrate real email service (SendGrid, AWS SES)
- [ ] Integrate SMS notifications (Twilio, AWS SNS)
- [ ] Add payment tracking
- [ ] Generate PDF reports
- [ ] Add user-facing mobile app
- [ ] Multi-language support (Arabic, English)
- [ ] Export data to Excel/CSV ✅ (Qurbani page implemented)
- [ ] Advanced analytics and reporting
- [ ] Date range filtering for Qurbani requests
- [ ] Save filter presets
- [ ] Bulk operations on filtered results

## Development Notes

- All validation logic is implemented in Mongoose models
- Session-based authentication (can be replaced with JWT)
- CORS enabled for local development
- Error handling middleware in place
- API responses follow consistent format

## Security Considerations

⚠️ **Important for Production**:
1. Change default admin credentials
2. Use environment variables for all secrets
3. Enable HTTPS
4. Implement rate limiting
5. Add CSRF protection
6. Validate and sanitize all inputs
7. Use JWT instead of sessions for stateless authentication
8. Set secure cookie flags in production

## License

MIT

## Support

For issues or questions, please contact the development team.
