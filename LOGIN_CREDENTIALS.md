# LabConnect Demo Login Credentials

## System Access
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Password for all demo accounts**: `demo`

## Account Management Policy

### Students
- Can **self-register** using the signup form
- Must use **@student.tut.ac.za** email domain
- Initial password: Set during signup

### Staff (Admin, Scheduler, Lecturer)
- **Created by administrators** using the admin API endpoint
- Use **@tut.ac.za** email domain
- Can **reset password** after first login using the Forgot Password function
- Initial password: Provided by admin in welcome email

---

## Admin Account
| Field | Value |
|-------|-------|
| **Email** | lmoyo@tut.ac.za |
| **Password** | demo |
| **Name** | Leila Moyo |
| **Role** | Admin |

**Permissions:**
- Full system access
- User management
- Venue management
- Course management
- View all allocations and logs

---

## Scheduler Account
| Field | Value |
|-------|-------|
| **Email** | sdube@tut.ac.za |
| **Password** | demo |
| **Name** | Sam Dube |
| **Role** | Scheduler |

**Permissions:**
- Create and manage lab allocations
- Assign venues to courses
- Schedule time slots
- View all lecturer and course information

---

## Lecturer Accounts

### Lecturer 1
| Field | Value |
|-------|-------|
| **Email** | ndlovu@tut.ac.za |
| **Password** | demo |
| **Name** | Dr Ndlovu |
| **Role** | Lecturer |
| **Assigned Courses** | CSC301 (Advanced Databases), INF220 (Systems Analysis) |

### Lecturer 2
| Field | Value |
|-------|-------|
| **Email** | dlamini@tut.ac.za |
| **Password** | demo |
| **Name** | Dr Dlamini |
| **Role** | Lecturer |
| **Assigned Courses** | MAT210 (Discrete Mathematics), CSC410 (Machine Learning) |

**Lecturer Permissions:**
- View their assigned course allocations
- Access course details and student lists
- Check lab schedules
- Receive email notifications

---

## Student Accounts (for testing)

## Student Accounts

Students must **self-register** using the signup form in the application:

1. Click the role selector and choose **Student**
2. Enter your **@tut4life.ac.za** email address
3. Create a password and confirm it
4. Click **Sign Up**
5. Check your email for the welcome message with verification instructions

**Note**: No demo student accounts are provided. All students create their own accounts via email signup.

**Student Permissions:**
- View their course allocations
- Access their enrolled courses

---

## Courses in the System

| Code | Name | Type | Capacity | Section |
|------|------|------|----------|---------|
| CSC301 | Advanced Databases | Lab | 35 | A |
| MAT210 | Discrete Mathematics | Lecture | 90 | MAIN |
| INF220 | Systems Analysis | Lecture | 45 | B |
| CSC410 | Machine Learning | Lab | 28 | A |

---

## Venues in the System

| Name | Capacity | Type | Computers |
|------|----------|------|-----------|
| Lab A1 | 40 | Lab | Yes |
| Hall B2 | 120 | Lecture | No |
| Lab C4 | 32 | Lab | Yes |
| Seminar D3 | 25 | Seminar | No |

---

## Quick Start Guide

### Login as Admin
1. Go to http://localhost:5173
2. Select role: **Admin**
3. Email: `lmoyo@tut.ac.za`
4. Password: `demo`
5. Click **Login**

### Login as Scheduler
1. Go to http://localhost:5173
2. Select role: **Scheduler**
3. Email: `sdube@tut.ac.za`
4. Password: `demo`
5. Click **Login**

### Login as Lecturer
1. Go to http://localhost:5173
2. Select role: **Lecturer**
3. Email: `ndlovu@tut.ac.za` or `dlamini@tut.ac.za`
4. Password: `demo`
5. Click **Login**

### Sign Up as Student
1. Go to http://localhost:5173
2. Select role: **Student**
3. Click the form to access signup
4. Use **@tut4life.ac.za** email domain
5. Set your password and confirm
6. Click **Create Account**
7. Check your email for welcome message

---

## How Staff Change Their Password After First Login

1. **Staff receives welcome email** with temporary password
2. **Staff logs in** using provided credentials
3. **Staff goes to Settings → Change Password** or clicks "Forgot Password?" on login screen
4. **Staff enters their email** and receives a reset link via email
5. **Staff clicks the reset link** and sets a new permanent password
6. **Staff logs in again** with new password
- All demo accounts use the password: `demo`
- Email notifications are enabled for all accounts
- Demo data is seeded automatically when the backend starts
- Allocations are linked to specific lecturers and venues
- Student accounts can only view their enrolled courses
