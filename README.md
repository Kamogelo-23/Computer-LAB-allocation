# LabConnect

LabConnect is split into three parts:

- `frontend/` - React + Vite web app
- `backend/` - Express API with the seeded LabConnect data
- `mobile/` - Expo/React Native mobile app

## Run

Install dependencies in each app folder the first time you open the workspace.

```bash
npm --prefix backend run dev
npm --prefix frontend run dev
npm --prefix mobile start
```

## Build

```bash
npm --prefix frontend run build
```

## Notes

- Seeded sample accounts use `demo` unless changed by admins.
- The frontend loads its initial state from the backend API at `http://localhost:3001`.
- MySQL Workbench schema: [backend/mysql-schema.sql](backend/mysql-schema.sql)
- Backend MySQL settings live in [backend/.env](backend/.env).

## Full Documentation

For full system documentation (features, APIs, modules, and function inventory), see [SYSTEM_DOCUMENTATION.md](SYSTEM_DOCUMENTATION.md).

## Recent Changes

### 1. Faculty Field for Module Management

**Overview**: Added the ability to link modules/courses with faculty names during course creation and editing.

**Files Modified**:
- `backend/mysql-schema.sql` - Added `faculty_name VARCHAR(255) DEFAULT NULL` column to the `courses` table
- `backend/src/db.js` - Updated 6 key functions to handle faculty data
- `frontend/src/App.jsx` - Added faculty input field to the CoursesTab form

**How It Works**:

1. **Backend Schema**: The `courses` table now includes a `faculty_name` column that stores the faculty associated with a course as free-text input.

2. **Database Migration**: When the backend starts, `ensureCourseColumns()` in `db.js` automatically checks for the `faculty_name` column and adds it if missing (via ALTER TABLE).

3. **API Layer**: 
   - `createCourse()` accepts `faculty` from the request payload, trims whitespace, and stores it as `facultyName` in the database
   - `updateCourseById()` handles updates to the faculty field
   - All API responses include `facultyName` so the frontend can display and edit it
   - `loadDbSnapshot()` and `normalizeAuthDb()` map the database field to the correct response format

4. **Frontend Form**:
   - CoursesTab component includes a new text input for "Faculty (e.g., Engineering, Science)"
   - When creating/editing a module, the faculty value is collected and sent to the backend
   - The form loads existing faculty values when editing a module
   - Faculty is included in the `modulePayload` sent to POST/PUT `/api/admin/courses`

**Endpoints Affected**:
- `POST /api/admin/courses` - Creates course with faculty
- `PUT /api/admin/courses/:id` - Updates course including faculty
- `GET /api/admin/courses` - Returns courses with faculty information

---

### 2. Login UI Redesign: Side-by-Side Hero + Form Layout

**Overview**: Restored the login page to display a professional side-by-side layout with a blue gradient hero section on the left and the sign-in form on the right.

**Files Modified**:
- `frontend/src/App.jsx` - Updated CSS and JSX for login layout

**How It Works**:

1. **Layout Structure**:
   - `.login-wrap` uses CSS Grid with `grid-template-columns: 1fr 1fr` to create two equal columns
   - `.login-hero` (left side) displays with a blue gradient background (`#0b2a5c` to `#1a4d8f`)
   - `.login-form-side` (right side) centers the login card on a light background

2. **Hero Section Content**:
   - **Header**: CampusGrid logo and branding
   - **Tagline**: "Smart scheduling for modern institutions"
   - **Description**: Overview of platform capabilities
   - **Feature List**: Four key features with icons (📅, 🏛️, 👥, 🔔)
   - **Legal Notice**: Authorization and monitoring disclaimer

3. **Responsive Behavior**:
   - On screens smaller than 1024px, the hero section hides (`display: none`) and only the form displays
   - Mobile users see just the centered login card without the hero section

4. **Styling Details**:
   - Hero uses flexbox (`flex-direction: column; justify-content: space-between`) to distribute content vertically
   - Text is white with varying opacity for hierarchy
   - Form card maintains its existing design (white background, rounded corners, shadow)

**CSS Classes Added**:
- `.hero-top` - Logo and branding area
- `.hero-middle` - Main content with tagline, description, and features
- `.hero-bottom` - Legal disclaimer
- `.hero-eyebrow` - Small uppercase label
- `.hero-tagline` - Main headline
- `.hero-feature` - Individual feature item with icon and text

---

### 3. Password Verification Function

**Overview**: Added the `verifyPassword()` function to properly authenticate users by comparing plaintext passwords with their hashed equivalents.

**Files Modified**:
- `frontend/src/App.jsx` - Added `verifyPassword()` function

**How It Works**:

1. **Function Definition**:
   ```javascript
   const verifyPassword = (plaintext, hashedPassword) => {
     return hashPassword(plaintext) === hashedPassword;
   };
   ```

2. **Authentication Flow**:
   - When a user logs in with their email and password, `loginUser()` is called
   - The function retrieves the user's stored hashed password from the database
   - `verifyPassword()` hashes the plaintext password the user entered
   - The newly hashed password is compared to the stored hashed password
   - If they match, authentication succeeds; otherwise, "Incorrect password" error is returned

3. **Hash Algorithm**:
   - Uses the same algorithm as `hashPassword()`: a simple string hash based on character codes
   - Returns a consistent hash for the same input (deterministic)
   - Format: `h$` prefix followed by base-36 encoded hash

4. **Integration**:
   - Called in `loginUser()` at line 641 to validate credentials
   - Part of the authentication pipeline for all user roles (Admin, Student, Lecturer, Scheduler)

**Error Handling**:
- If password doesn't match, returns: `{ ok: false, error: "Incorrect password.", errorCode: "BAD_PASSWORD" }`
- Prevents unauthorized access while allowing legitimate users to log in
