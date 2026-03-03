# Company-Based Multi-Tenancy System

## Overview
The Qurbani App now supports company-based multi-tenancy where each company has its own isolated data and admin accounts.

## Key Features

### 1. Admin Accounts with Company Assignment
- Each admin belongs to a specific company
- Two admin roles:
  - **Super Admin**: Can manage all companies and create new admin accounts
  - **Company Admin**: Can only manage their company's users, groups, and qurbani records

### 2. Data Isolation
- Users can only see and manage data from their own company
- Groups are company-specific
- All queries are automatically filtered by the logged-in admin's company

### 3. Company Management
- Super admins can create and manage companies
- Company admins can only view their own company details
- Companies cannot be deleted if they have users or groups

## Initial Setup

### Creating the First Admin
Run this command to create the initial super admin:
```bash
cd backend
node createAdmin.js
```

**Default Credentials:**
- Username: superadmin
- Password: admin123

**IMPORTANT:** Change this password immediately after first login!

## How It Works

### Admin Login
1. Admins log in with username and password (not passport/phone)
2. The system loads the admin's company context
3. All subsequent queries are filtered by this company

### Creating Users
- When a company admin creates a user, the user is automatically assigned to the admin's company
- No need to select a company - it's automatic

### Creating Groups
- Groups are automatically assigned to the admin's company
- Only users from the same company can be added as members

### Creating New Admin Accounts
- Super admins can create new company admin accounts from the Admin Management page
- Each admin must be assigned to a company
- Admins can only manage data within their assigned company
- Available roles:
  - **Super Admin**: Full system access, can manage all companies and admins
  - **Company Admin**: Limited to managing their company's data only
- Features:
  - Create, edit, and delete admin accounts
  - Change admin passwords
  - Filter admins by company, role, or status
  - Set admin status (active/inactive)

## API Changes

### Authentication
- **Login Endpoint**: `/api/auth/login`
  - For Admins: Send `username` and `password`
  - For Users: Send phone number as `username` and passport number as `password`

### Session Data
The session now includes:
- `adminId`: Admin's database ID
- `companyId`: Admin's company ID
- `role`: Admin's role (super_admin or company_admin)
- `username`: Admin's username

### Automatic Filtering
All endpoints now automatically filter by the logged-in admin's company:
- `/api/users` - Only returns users from admin's company
- `/api/groups` - Only returns groups from admin's company
- `/api/qurbani` - Only returns qurbani records from admin's company
- `/api/companies` - Super admins see all, company admins see only their own

## Models

### Admin Model
```javascript
{
    username: String (unique),
    email: String (unique),
    passwordHash: String,
    fullName: String,
    companyId: ObjectId (ref: Company),
    role: 'super_admin' | 'company_admin',
    status: 'active' | 'inactive'
}
```

### Updated User Model
Now includes:
- `companyId`: Required reference to Company

### Updated Group Model
Now includes:
- `companyId`: Required reference to Company

## Migration Notes

If you have existing data:
1. All existing users and groups need a `companyId`
2. You may need to create a migration script to assign existing records to a default company
3. Update any existing admin access to use the new authentication system

## Security Improvements

1. **Password-based admin authentication**: No more hardcoded credentials
2. **Company-level data isolation**: Admins can't access other companies' data
3. **Role-based access control**: Different permissions for super admins vs company admins
4. **Session-based company context**: Company filter applied automatically

## Frontend Changes

1. Removed company dropdown from user and group forms (auto-assigned)
2. Login now expects admin username/password format
3. Session includes company information
4. All API calls automatically filtered server-side

## Next Steps

Additional features to enhance the system:
1. ✅ ~~Create an admin management interface (for super admins)~~ **COMPLETED**
2. Add password change functionality for end users
3. Add forgot password feature
4. Implement company switching (if a super admin needs to work on behalf of a specific company)
5. Add audit logs for admin actions
6. Add email notifications for user account creation
