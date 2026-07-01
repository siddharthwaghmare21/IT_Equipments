# IT Equipment Management

Next.js frontend with ASP.NET Core Web API backend and local MySQL database.

## Local Run

Frontend:

```powershell
npm.cmd run dev
```

Backend:

```powershell
dotnet run --project backend\ITEquipment.Api\ITEquipment.Api.csproj
```

URLs:

- Frontend: http://localhost:3000
- Backend health: http://localhost:5168/api/health

## Phase Status

- Phase 1 Local Setup: complete
- Phase 2 Database Design: complete
- Phase 3 Authentication: complete for current scope
- Phase 4 Core APIs: complete
- Phase 5 Frontend Integration: complete
- Phase 6 Reports: complete
- Phase 7 Export, Import and Backup Tracking: complete for current scope
- Phase 8 Email/Security: email verification current scope complete; SMTP/OTP parked for company deployment
- Phase 9 RBAC/Admin/Profile/Settings: complete
- Phase 10 Final Testing: in progress

## Phase 10 Final Testing Checklist

Current rule: only page open/load and build checks are done until original/new data is added. Full add/edit/delete and end-to-end testing must be done after test data is ready.

Pre-test checks:

- Run backend and confirm `/api/health` returns healthy.
- Run frontend and confirm `/login` opens.
- Confirm `npm.cmd run lint` passes.
- Confirm `npm.cmd run build` passes.
- Confirm backend build passes.

Authentication and roles:

- Login as Super Admin.
- Verify invalid access code is rejected.
- Verify unverified email login is blocked by backend.
- Submit access request from `/admin-request-access`.
- Approve/reject access request from `/admin-request-management`.
- Verify `/admin-user-management` is Super Admin only.
- Verify Viewer can read records/reports but cannot add/edit/archive/cancel.

Core modules:

- Departments: list, add, edit, view, archive.
- Vendors: list, add, edit, view, archive.
- Assets: list, add, edit, view, archive, history.
- Purchases/Work Orders: list, add, edit, view, cancel.
- Deliveries: list, add, edit, view, cancel.
- Transfers: list, add, edit, view, cancel.
- Returns: list, add, edit, view, reject.
- Maintenance: list, add, edit, view, cancel.

Reports and exports:

- Open all report pages.
- Verify live data appears after records are added.
- Verify CSV export.
- Verify Excel-compatible export.
- Verify browser print/PDF.
- Verify report branding from Settings appears in report letterhead.

Import, backup and settings:

- Validate CSV template flow on Import Data page.
- Create import tracking job after validating a file.
- Create backup tracking job.
- Download JSON backup snapshot.
- Verify backup restore remains disabled/parked.
- Save report branding in Settings and verify it persists through backend settings.

Final deployment readiness:

- Set `NEXT_PUBLIC_API_BASE_URL` for hosted backend.
- Host ASP.NET Core backend separately from Vercel.
- Move MySQL from local DB to hosted/cloud DB.
- Apply database scripts `001` through `009` in production.
- Configure production JWT signing key, DB connection, setup key and CORS origin.
- Configure SMTP only when company email credentials are available.
