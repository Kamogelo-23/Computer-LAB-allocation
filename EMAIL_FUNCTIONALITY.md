# Email Functionality Documentation

## Overview
The LabConnect backend implements role-based user management:
- **Students**: Can self-register via public signup
- **Staff** (Admin, Scheduler, Lecturer): Created by admins using a dedicated endpoint
- **All users**: Can reset their password using the forgot password flow

This ensures proper access control and staff accountability.

## Configuration
Email settings are stored in `.env`:
- `SMTP_HOST`: Gmail SMTP server (smtp.gmail.com)
- `SMTP_PORT`: 587 (TLS port)
- `SMTP_USER`: Gmail address (kamogelomabote2001@gmail.com)
- `SMTP_PASSWORD`: Gmail app password
- `SMTP_FROM`: Sender email address
- `FRONTEND_URL`: Frontend URL for reset links (defaults to http://localhost:5173)

## API Endpoints

### 1. Student Signup (Public)
**POST** `/api/signup`

**Important**: Only students can sign up via this endpoint using @tut4life.ac.za email address.

Request body:
```json
{
  "name": "John Doe",
  "email": "john@tut4life.ac.za",
  "password": "securePassword123"
}
```

Response (Success):
```json
{
  "success": true,
  "user": {
    "id": "user-id-123",
    "name": "John Doe",
    "email": "john@tut4life.ac.za",
    "role": "Student"
  },
  "message": "User created successfully. Welcome email sent."
}
```

**Email Sent To:** New student's email address
**Email Content:**
- Subject: "Welcome to LabConnect - Confirm Your Account"
- Includes credentials and login link
- Reminds user to change password after first login

---

### 2. Admin: Create Staff Account
**POST** `/api/admin/create-staff`

**Important**: Only admins should call this endpoint. Used to create Admin, Scheduler, and Lecturer accounts.

Request body:
```json
{
  "name": "Dr. John Smith",
  "email": "jsmith@tut.ac.za",
  "role": "Lecturer",
  "password": "tempPassword123"
}
```

Valid roles:
- `Admin`
- `Scheduler`
- `Lecturer`

Response (Success):
```json
{
  "success": true,
  "user": {
    "id": "staff-id-456",
    "name": "Dr. John Smith",
    "email": "jsmith@tut.ac.za",
    "role": "Lecturer"
  },
  "message": "Lecturer account created successfully. Welcome email sent."
}
```

**Email Sent To:** New staff member's email address
**Email Content:**
- Subject: "Welcome to LabConnect - Confirm Your Account"
- Includes credentials and login link
- Reminds user to change password after first login

---

### 3. Forgot Password (All Users)
**POST** `/api/forgot-password`

Available to all users (Students and Staff). Staff members can use this to reset their password after first login.

Request body:
```json
{
  "email": "user@tut.ac.za"
}
```

Response (Success):
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

**Email Sent To:** User's registered email
**Email Content:**
- Subject: "Password Reset Request - LabConnect"
- Contains unique reset link (valid for 24 hours)
- Instructions to reset password

---

### 4. Reset Password (using Token)
**POST** `/api/reset-password`

Used after receiving the password reset link in email.

Request body:
```json
{
  "token": "reset-token-from-email-link",
  "newPassword": "newSecurePassword456"
}
```

Response (Success):
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

Response (Error - Invalid Token):
```json
{
  "error": "Invalid or expired reset token"
}
```

---

## Email Templates

### Welcome Email (Signup)
Sends credentials and encourages user to log in with reminder to change password.

### Password Reset Email
Includes a clickable link that directs to: 
`{FRONTEND_URL}/reset-password?token={resetToken}`

The token expires after 24 hours.

---

## Testing

### Test Signup with Email
```bash
curl -X POST http://localhost:3001/api/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "testuser@tut4life.ac.za",
    "role": "Student",
    "password": "Test@123"
  }'
```

### Test Password Reset
```bash
# 1. Request reset token
curl -X POST http://localhost:3001/api/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "testuser@tut4life.ac.za"}'

# 2. Use token to reset password
curl -X POST http://localhost:3001/api/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "your-reset-token-here",
    "newPassword": "NewPassword@456"
  }'
```

Check backend console for email sending logs:
- `Email sent to [email]: [messageId]` = Success
- `Failed to send email to [email]: [error]` = Failed

---

## Features
✅ Real-time email sending via Gmail SMTP  
✅ Welcome email on user signup with credentials  
✅ Password reset emails with 24-hour valid tokens  
✅ Professional HTML email templates  
✅ Error handling and logging  
✅ Secure password reset flow  

## Security Notes
- Passwords are sent in welcome email only - users MUST change them after first login
- Reset tokens are 32-character random strings
- Reset tokens expire after 24 hours
- Tokens are cleared after successful password reset


