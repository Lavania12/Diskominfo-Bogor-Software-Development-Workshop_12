# Login API Documentation

## Overview
This document describes the Next.js API login system using Sequelize with Admin model and bcrypt for password validation.

## API Endpoints

### 1. Login API
**Endpoint:** `POST /api/auth/login`

**Description:** Authenticates admin users using email and password.

#### Request Body
```json
{
  "email": "admin@diskominfo.go.id",
  "password": "your_password"
}
```

#### Response (Success - 200)
```json
{
  "success": true,
  "message": "Login successful",
  "admin": {
    "id": "uuid-here",
    "email": "admin@diskominfo.go.id",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  "login_time": "2024-01-01T00:00:00.000Z"
}
```

#### Response (Error - 401)
```json
{
  "success": false,
  "message": "Invalid email or password",
  "type": "INVALID_CREDENTIALS"
}
```

#### Response (Error - 400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": "Invalid email format",
    "password": "Password is required"
  }
}
```

#### Response (Error - 429)
```json
{
  "success": false,
  "message": "Too many failed attempts. Try again in 15 minutes.",
  "type": "RATE_LIMITED"
}
```

### 2. Create Admin API
**Endpoint:** `POST /api/admin/create`

**Description:** Creates a new admin account with hashed password.

#### Request Body
```json
{
  "email": "newadmin@diskominfo.go.id",
  "password": "SecurePassword123!"
}
```

#### Response (Success - 201)
```json
{
  "success": true,
  "message": "Admin created successfully",
  "admin": {
    "id": "uuid-here",
    "email": "newadmin@diskominfo.go.id",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

## Security Features

### 1. Password Hashing
- Uses bcrypt with 12 salt rounds
- Passwords are never stored in plain text
- Secure password comparison using bcrypt.compare()

### 2. Rate Limiting
- Maximum 5 failed attempts per email/IP
- 15-minute lockout period
- Automatic attempt clearing on successful login

### 3. Input Validation
- Email format validation
- Password strength requirements
- SQL injection prevention via Sequelize ORM
- XSS protection headers

### 4. Security Headers
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Cache-Control: no-store, no-cache, must-revalidate
```

## Database Schema

### Admin Model
```javascript
{
  id: UUID (Primary Key)
  email: VARCHAR (Unique, Not Null)
  password: VARCHAR (Not Null, bcrypt hashed)
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
}
```

## Usage Examples

### 1. JavaScript/Node.js
```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'admin@diskominfo.go.id',
    password: 'your_password'
  })
});

const result = await response.json();
if (result.success) {
  console.log('Login successful:', result.admin);
} else {
  console.log('Login failed:', result.message);
}
```

### 2. cURL
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@diskominfo.go.id","password":"your_password"}'
```

### 3. Python
```python
import requests

response = requests.post('http://localhost:3000/api/auth/login', json={
    'email': 'admin@diskominfo.go.id',
    'password': 'your_password'
})

if response.status_code == 200:
    data = response.json()
    print('Login successful:', data['admin'])
else:
    print('Login failed:', response.json()['message'])
```

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Login successful |
| 400 | Validation error |
| 401 | Invalid credentials |
| 405 | Method not allowed |
| 409 | Email already exists (create admin) |
| 429 | Rate limited |
| 500 | Internal server error |

## Testing

### 1. Create Test Admin
```bash
node scripts/create-test-admin.js
```

### 2. Test Login API
```bash
node scripts/test-login-api.js
```

### 3. Manual Testing
1. Start the server: `npm run dev`
2. Visit: `http://localhost:3000/admin/login`
3. Use test credentials:
   - Email: `test@diskominfo.go.id`
   - Password: `TestAdmin123!`

## Best Practices

### 1. Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character
- Not in common passwords list

### 2. Security Recommendations
- Use HTTPS in production
- Implement JWT tokens for session management
- Add CSRF protection
- Log all login attempts
- Regular password rotation
- Two-factor authentication (2FA)

### 3. Database Security
- Use connection pooling
- Enable SSL for database connections
- Regular security updates
- Backup encryption

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check DATABASE_URL environment variable
   - Verify database server is running
   - Check network connectivity

2. **Login Always Fails**
   - Verify admin exists in database
   - Check password hashing
   - Verify bcrypt comparison

3. **Rate Limiting Issues**
   - Clear browser cache
   - Wait for lockout period to expire
   - Check IP address changes

### Debug Commands
```bash
# Check database connection
node scripts/check-admin-table.js

# Test login functionality
node scripts/test-login.js

# Create test admin
node scripts/create-test-admin.js
```
