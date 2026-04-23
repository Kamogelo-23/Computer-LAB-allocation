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

- Demo login passwords use `demo`.
- The frontend loads its initial state from the backend API at `http://localhost:3001`.
- MySQL Workbench schema: [backend/mysql-schema.sql](backend/mysql-schema.sql)
- Backend MySQL settings live in [backend/.env](backend/.env).
