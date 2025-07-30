# Student ID Management System

A modern, animated, role-based web app for managing student ID data. Built with React, MUI, Framer Motion, Node.js, Express, and MongoDB Atlas.

## Project Structure

- /client — React frontend (MUI, Framer Motion)
- /server — Node.js backend (Express, MongoDB)

## Quick Start

1. Clone the repo
2. Install dependencies:
   - Backend: `cd server && npm install`
   - Frontend: `cd client && npm install`
3. Set up your MongoDB Atlas URI in `server/.env`:
   ```
   MONGODB_URI=your_mongodb_atlas_uri
   JWT_SECRET=your_jwt_secret
   ```
4. Start backend: `cd server && npm start`
5. Start frontend: `cd client && npm start`
6. Visit http://localhost:3000

---

## Features

### Student Features
- **Profile Viewing**: View complete student profile with academic and personal information
- **Profile Updates**: Update phone number and address (with 3-month restriction)
- **Update History**: View complete history of profile changes
- **Update Status**: Real-time status showing when next update is available
- **Student Home Page**: Personalized dashboard with notices and quick access
- **Notices System**: View important announcements and updates

### Admin/Operator Features
- **Student Management**: Add, edit, delete students
- **Photo Upload**: Upload and manage student photos
- **Data Export**: Export student data to CSV
- **Admin Override**: Bypass 3-month restriction for urgent updates
- **Update Tracking**: Monitor student profile update history
- **Advanced Search & Filtering**: Powerful search and filter capabilities
- **Sorting**: Sort by any column with visual indicators
- **Real-time Statistics**: Quick stats on filtered results
- **Notices Management**: Create, edit, and manage announcements

### Security Features
- **Role-based Access**: Different permissions for students, operators, and viewers
- **Update Restrictions**: Students can only update profiles once every 3 months
- **Audit Trail**: Complete history of all profile changes
- **Admin Override**: Controlled bypass of restrictions with reason tracking

## Profile Update System

### Student Self-Service
- Students can update their phone number and address
- Updates are restricted to once every 3 months
- Complete update history is maintained
- Clear indication of next available update date

### Admin Override
- Operators can bypass the 3-month restriction
- Requires a reason for the override
- All override actions are logged in update history
- Maintains data integrity while allowing flexibility

### Update Tracking
- All changes are logged with timestamps
- Previous and new values are preserved
- Update count is maintained
- Distinction between student and admin updates

## Search & Filtering System

### Advanced Search
- **Real-time Search**: Search across name, PRN, phone, address, and branch
- **Debounced Input**: Optimized performance with 500ms debounce
- **Server-side Processing**: Efficient handling of large datasets
- **Highlighted Results**: Clear indication of search terms

### Multi-Filter System
- **Branch Filter**: Filter by specific academic branches
- **Academic Year**: Filter by enrollment year
- **Photo Status**: Filter students with/without photos
- **Update Status**: Filter by profile update restrictions
- **Combined Filters**: Apply multiple filters simultaneously

### Sorting & Organization
- **Column Sorting**: Click any column header to sort
- **Visual Indicators**: Clear up/down arrows for sort direction
- **Multi-field Support**: Sort by name, branch, DOB, year, PRN
- **Persistent State**: Sort preferences maintained during filtering

### Performance Features
- **Server-side Filtering**: Reduces client-side processing
- **Pagination Ready**: Built-in support for large datasets
- **Optimized Queries**: Efficient database queries with indexes
- **Caching**: Smart caching of filter results

### User Experience
- **Collapsible Filters**: Show/hide advanced filter options
- **Quick Stats**: Real-time statistics on filtered results
- **Clear All**: One-click reset of all filters
- **Status Chips**: Visual indicators for active filters
- **Empty States**: Helpful messages when no results found

## Student Home Page & Notices System

### Student Home Page Features
- **Personalized Welcome**: Custom greeting with student name and details
- **Quick Stats Dashboard**: Overview of urgent notices, profile status, and academic info
- **Urgent Notices Section**: Highlighted important announcements requiring attention
- **Recent Notices**: Latest announcements with easy access
- **Quick Actions**: Direct links to profile and notices
- **Responsive Design**: Optimized for all device sizes

### Notices System
- **Multi-category Notices**: General, academic, event, important, announcement
- **Priority Levels**: Urgent, high, medium, low with color coding
- **Target Audience**: All, students only, or operators only
- **Expiration Dates**: Optional automatic expiration
- **Rich Content**: Full text support with formatting
- **Admin Management**: Create, edit, delete, and toggle notices

### Notice Categories
- **General**: General information and updates
- **Academic**: Academic-related announcements
- **Event**: Upcoming events and activities
- **Important**: Important information requiring attention
- **Announcement**: General announcements

### Priority System
- **Urgent**: Critical information (red)
- **High**: Important updates (orange)
- **Medium**: Standard information (blue)
- **Low**: Minor updates (green)

### Admin Notice Management
- **Create Notices**: Full form with all options
- **Edit Notices**: Modify existing notices
- **Delete Notices**: Remove notices permanently
- **Toggle Status**: Activate/deactivate notices
- **Bulk Operations**: Manage multiple notices efficiently

## API Endpoints

### Student Profile Management
- `GET /api/students/profile` - Get student's own profile
- `PUT /api/students/profile` - Update student's own profile (with 3-month restriction)
- `GET /api/students/profile/history` - Get profile update history

### Admin Override
- `PUT /api/students/:id/admin-update` - Admin override for profile updates

### Standard Admin Endpoints
- `GET /api/students` - Get all students (with optional query parameters for filtering)
- `POST /api/students` - Add new student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Notices Management
- `GET /api/notices` - Get all active notices (filtered by user role)
- `GET /api/notices/:id` - Get specific notice
- `POST /api/notices` - Create new notice (admin only)
- `PUT /api/notices/:id` - Update notice (admin only)
- `DELETE /api/notices/:id` - Delete notice (admin only)
- `PATCH /api/notices/:id/toggle` - Toggle notice active status (admin only)

### Search & Filter Query Parameters
- `search` - Search across multiple fields
- `branch` - Filter by branch
- `ac_year` - Filter by academic year
- `hasPhoto` - Filter by photo status (yes/no)
- `updateStatus` - Filter by update restriction status
- `sortBy` - Sort field (name, branch, dob, ac_year, prn)
- `sortOrder` - Sort direction (asc/desc)
- `limit` - Pagination limit
- `page` - Page number

## Database Schema

### Student Model
```javascript
{
  name: String,
  branch: String,
  dob: Date,
  phone: String,
  ac_year: String,
  address: String,
  prn: String (unique),
  photo_path: String,
  lastProfileUpdate: Date,
  profileUpdateCount: Number,
  profileUpdateHistory: [{
    field: String,
    oldValue: String,
    newValue: String,
    updatedAt: Date,
    updatedBy: String, // 'student' or 'admin'
    reason: String // for admin overrides
  }]
}
```

### Notice Model
```javascript
{
  title: String,
  content: String,
  category: String, // 'general', 'academic', 'event', 'important', 'announcement'
  priority: String, // 'low', 'medium', 'high', 'urgent'
  targetAudience: String, // 'all', 'students', 'operators'
  isActive: Boolean,
  createdBy: String,
  createdAt: Date,
  updatedAt: Date,
  expiresAt: Date, // optional
  attachments: [{
    filename: String,
    path: String,
    uploadedAt: Date
  }]
}
```

---

- Operator: Add/edit/delete students, upload photos, admin override, advanced search & filtering, notices management
- Student: View profile, update contact info (with restrictions), personalized home page, notices access
- Viewer: Read-only, export CSV
- Stylish, animated, mobile-friendly UI 