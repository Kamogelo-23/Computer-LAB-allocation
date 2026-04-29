# CampusGrid / LabConnect Full System Documentation

## 1. System Overview
CampusGrid (LabConnect workspace) is a campus resource and timetable management platform with:
- Web frontend: React + Vite
- Backend API: Express + MySQL
- Mobile app shell: Expo/React Native

Core capabilities include:
- Role-based access (Admin, Scheduler, Lecturer, Student)
- Venue, course, and allocation management
- User management and verification
- Notifications (role-wide and targeted)
- OCR-based student proof-of-registration (PoR) verification
- Lecturer-to-module linking and student linkage via enrolled modules

## 2. Architecture
### 2.1 Frontend
- Main entry: frontend/src/App.jsx
- Single-page role-based dashboard
- Fetches initial state from backend /api/db
- Implements tabs per role and in-app CRUD flows

### 2.2 Backend
- Main entry: backend/src/server.js
- Business/data layer: backend/src/db.js
- OCR registration parser service: backend/src/services/RegistrationService.js
- Student lookup service (Prisma): backend/src/services/studentService.js
- Email service + templates: backend/src/email.js

### 2.3 Data Stores
- MySQL runtime schema: backend/mysql-schema.sql
- Prisma schema (academic + notification verification models): backend/prisma/schema.prisma

## 3. Roles and Permissions
### 3.1 Admin
- Manage users (create/update/delete staff, update users)
- Manage venues, courses, allocations, reports
- Send notifications with restricted recipient options:
  - All Students
  - All Schedulers
  - All Lecturers
  - Students in a specific module/course

### 3.2 Scheduler
- Manage allocations and conflicts
- View archives
- Send notifications with same restricted recipient options as Admin

### 3.3 Lecturer
- View assigned modules
- Submit room requests
- View notifications
- Lecturer-module linkage is managed by Admin user assignment and courses

### 3.4 Student
- Sign up with institutional student email domain
- Email verification required before login
- Profile/PoR verification required for module-access-related settings
- View timetable and notifications

## 4. Core Functional Modules
### 4.1 Authentication and Account Flows
- Login with role and password
- Student signup
- Email verification token flow
- Forgot/reset password flow

### 4.2 User Management
- Admin can create staff users
- Admin can edit users
- Admin can delete users
- Lecturer users can be linked to modules/courses during create/update

### 4.3 Venue Management
- Add/edit/delete venues
- Capacity and type constraints

### 4.4 Course Management
- Add/edit/delete courses
- Assign lecturer_id on course records
- Group size and lab requirements

### 4.5 Allocation and Conflict Handling
- Create/edit/delete allocations
- Conflict checking for venue and lecturer overlap
- Time-window validation

### 4.6 Notifications
- Notification records + read receipts
- Role-targeted and user-targeted display logic
- Admin/Scheduler sending restrictions implemented in frontend targeting options
- Module/course-targeted notification fan-out to enrolled students

### 4.7 OCR PoR Verification
- Student uploads Proof of Registration from Settings
- OCR/text extraction supports:
  - PDF text extraction via pdf-parse (PDFParse API)
  - Image OCR via tesseract.js
- Extracts:
  - Student number near Student Number / Student No
  - Name candidates
  - Module codes via regex [A-Z]{2,4}\d{3,4}[A-Z]?
- Compares extracted student number with signed-in identity
- Returns verification outcome and parsed summary

### 4.8 Lecturer-to-Module and Student Linkage
- Admin can assign modules to lecturers in Users tab
- Backend syncs assignments by:
  - Updating courses.lecturer_id
  - Maintaining course_students mappings for lecturer-course links
- Linked students are derived by students enrolled in those assigned modules

## 5. API Documentation (backend/src/server.js)
### 5.1 Health and Snapshot
- GET /health
- GET /api/db

### 5.2 Auth
- POST /api/login
- POST /api/signup
- POST /api/verify-email
- POST /api/forgot-password
- POST /api/reset-password

### 5.3 Admin User Management
- GET /api/admin/users
- POST /api/admin/users
  - Supports courses payload for lecturer module assignments
- PUT /api/admin/users/:id
  - Supports courses payload for lecturer module assignments
- DELETE /api/admin/users/:id
- POST /api/admin/create-staff

### 5.4 Student PoR Verification
- POST /api/student/verify-por
  - Multipart field proof (file)
  - Multipart field currentStudent (JSON string)
  - Runs OCR/parser and compares student number

## 6. Backend Function Inventory
### 6.1 Data Layer Functions (backend/src/db.js)
Exported functions:
- initDatabase()
- getDatabaseSnapshot()
- findUserForLogin({ email, password, role })
- createAllocation(allocationData)
- createNotification(notificationData)
- createUser({ name, email, role, password, courses })
- listUsers()
- updateUserById(userId, updates)
- deleteUserById(userId)
- verifyEmailToken(token)
- generatePasswordResetToken(email)
- resetUserPassword(resetToken, newPassword)

Internal migration/bootstrap helpers:
- getPool()
- bootstrapSchema()
- seedDatabase()
- ensureUserColumns()
- ensureNotificationColumns()
- loadDbSnapshot()

### 6.2 OCR/Registration Service Functions (backend/src/services/RegistrationService.js)
Exported:
- processRegistration(documentBuffer, options)
- processRegistrationDocument(documentBuffer, options)
- extractRegistrationData(documentBuffer)

Internal helpers:
- normaliseCode(code)
- extractStudentNumber(rawText)
- extractStudentName(rawText)
- extractModuleCodes(rawText)
- resolveCurrentStudentIdentity(currentStudent)
- extractTextFromDocument(documentBuffer)
- createSystemNotification(client, payload)

### 6.3 Student Service Functions (backend/src/services/studentService.js)
Exported:
- getStudentsByModule(moduleCode)

### 6.4 Email Service Functions (backend/src/email.js)
Exported:
- initEmailService()
- sendEmail({ to, subject, html, text })
- emailTemplates.signupWelcome(userData)
- emailTemplates.passwordReset(resetData)

## 7. Database Model Summary (MySQL)
Main tables:
- users
- venues
- courses
- course_students
- allocations
- notifications
- notification_reads
- logs

Notification schema includes:
- category enum
- priority enum
- is_archived
- expires_at
- target constraint and supporting indexes

## 8. Frontend Functional Areas
Main dashboard tabs/components include:
- Overview (role-specific)
- Venues
- Users
- Courses
- Allocations
- Reports
- Conflicts
- Archives
- Modules
- Room Request
- Timetable
- Notifications
- Settings

Notable behavior added:
- Users tab:
  - No default demo password in Add User form
  - Lecturer module assignment UI by module code/name
  - Linked student count display for lecturers
- Notifications tab:
  - Admin/Scheduler restricted recipient choices
  - Course/module targeted notifications to enrolled students
- Settings tab:
  - PoR upload and OCR verification flow
  - Student profile lock rules tied to verification status

## 9. Environment and Setup
Backend environment variables (backend/.env) include MySQL and SMTP settings such as:
- MYSQL_HOST
- MYSQL_PORT
- MYSQL_USER
- MYSQL_PASSWORD
- MYSQL_DATABASE
- SMTP_HOST
- SMTP_PORT
- SMTP_USER
- SMTP_PASSWORD
- SMTP_FROM
- FRONTEND_URL

Run commands:
- npm --prefix backend run dev
- npm --prefix frontend run dev
- npm --prefix mobile start

Build command:
- npm --prefix frontend run build

## 10. Operational Notes
- Backend startup may fail with EADDRINUSE if port 3001 is already in use.
- OCR PDF parsing uses pdf-parse v2 class API; images use tesseract.js worker.
- Error middleware returns Request failed with detail message for easier debugging.

## 11. Recent Enhancements Included
- Notification schema expansion (category/priority/archive/expiry + indexes)
- Prisma notification models and enums
- OCR parser service with PDF/image support
- PoR verification endpoint and settings upload flow
- Student-number identity matching from institutional email local-part
- Lecturer-module linking via Admin Users flow
- Restricted Admin/Scheduler notification targeting + course-based student targeting
- Removal of demo prefill from Add User password input

## 12. Recommended Next Steps
- Add server-side notification targeting policy enforcement (not only frontend restrictions)
- Add endpoint-level authorization middleware per role
- Add automated tests for:
  - OCR extraction and mismatch handling
  - Lecturer-course assignment consistency
  - Notification targeting fan-out
- Add migration/versioning strategy for schema evolution in production
