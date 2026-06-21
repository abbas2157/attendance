# BMS HR Portal

React + Vite HR dashboard for the BMS Attendance Management System.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Build for Production

```bash
npm run build
npm run preview   # preview the build locally
```

## Project Structure

```
src/
├── api/
│   ├── client.js          # Axios instance with JWT interceptors + auto-refresh
│   └── services.js        # All API call functions
├── components/
│   ├── Layout.jsx/css      # App shell (sidebar + topbar + outlet)
│   ├── Sidebar.jsx/css     # Navigation sidebar
│   ├── Topbar.jsx/css      # Top header bar
│   └── UI.jsx/css          # Shared: Avatar, Chip, StatCard, Spinner, etc.
├── context/
│   └── AuthContext.jsx     # JWT auth state, login/logout
├── hooks/
│   └── useApi.js           # Generic data-fetching hook
├── pages/
│   ├── Login.jsx/css       # Login with split-panel layout
│   ├── Dashboard.jsx/css   # KPI cards, activity feed, warehouse bars
│   ├── Employees.jsx/css   # Searchable employee table
│   ├── Attendance.jsx/css  # Date-filtered attendance records
│   └── Warehouses.jsx/css  # Warehouse cards grid
└── utils/
    └── helpers.js          # Avatar colors, initials, date helpers
```

## API Base URL

Change in `src/api/client.js`:
```js
baseURL: 'https://api.bmsapp.com.pk/api'
```

## Authentication

- Calls `POST /api/auth/login/` with `{ username, password }`
- Stores `access` + `refresh` tokens in `localStorage`
- Interceptor automatically retries with refreshed token on 401
- Redirects to `/login` if refresh fails

## Recommended Backend Additions

| Endpoint | Purpose |
|---|---|
| `DELETE /api/employees/{id}/` | Deactivate employee from HR portal |
| `PATCH /api/employees/{id}/`  | Edit employee details |
| `GET /api/attendance/records?start_date=&end_date=` | Date range filter |
| Add `full_name` to JWT payload | Show real name in sidebar |
