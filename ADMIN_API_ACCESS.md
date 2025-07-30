# Admin API Access Documentation

## Overview
The admin functionality is now restricted to API access only for enhanced security. The frontend no longer displays admin login options.

## Admin Login Endpoint

### POST `/api/auth/admin/login`

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "role": "operator"
}
```

## Using the Admin Token

Once you have the admin token, you can access all admin endpoints by including it in the Authorization header:

```
Authorization: Bearer <your_admin_token>
```

## Available Admin Endpoints

### Student Management
- `GET /api/students` - Get all students
- `POST /api/students` - Add new student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student
- `POST /api/students/:id/photo` - Upload student photo

### Data Export
- `GET /api/export/csv` - Export all student data as CSV

## Example API Calls

### Using cURL

```bash
# Login as admin
curl -X POST http://localhost:5000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'

# Get all students (using the token from login)
curl -X GET http://localhost:5000/api/students \
  -H "Authorization: Bearer <your_token>"

# Add a new student
curl -X POST http://localhost:5000/api/students \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "branch": "Computer Science",
    "dob": "2000-01-01",
    "phone": "1234567890",
    "ac_year": "2024",
    "address": "123 Main St",
    "prn": "2024CS001"
  }'
```

### Using JavaScript/Fetch

```javascript
// Login as admin
const loginResponse = await fetch('http://localhost:5000/api/auth/admin/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'admin',
    password: 'admin123'
  })
});

const { token } = await loginResponse.json();

// Use the token for admin operations
const studentsResponse = await fetch('http://localhost:5000/api/students', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const students = await studentsResponse.json();
```

## Security Notes

1. **Admin credentials are hardcoded** - In production, these should be stored securely in environment variables
2. **Token expiration** - Admin tokens expire after 1 day
3. **API-only access** - Admin functionality is not available through the web interface
4. **CORS enabled** - The API accepts requests from any origin (configure appropriately for production)

## Frontend Access

The frontend now only shows:
- Student registration
- Student login
- Student profile viewing

All admin functionality must be accessed through direct API calls as described above. 