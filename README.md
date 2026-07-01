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

## Deployment Readiness

The frontend can be deployed to Vercel, but the full system needs a separately hosted ASP.NET Core backend and a hosted MySQL database. Vercel alone is not enough because the browser frontend must call the backend API, and the backend must connect to MySQL.

Frontend environment variable for Vercel:

```text
NEXT_PUBLIC_API_BASE_URL=https://your-backend-api-domain
```

Backend production environment variables:

```text
ConnectionStrings__DefaultConnection=Server=your-mysql-host;Port=3306;Database=it_equipment_management_smkc;User=your-user;Password=your-password;
Jwt__Issuer=ITEquipment.Api
Jwt__Audience=ITEquipment.Frontend
Jwt__SigningKey=use-a-strong-random-key-with-at-least-32-characters
Jwt__ExpiryMinutes=480
Bootstrap__SetupKey=use-a-private-setup-key
Cors__AllowedOrigins__0=https://your-vercel-domain.vercel.app
```

Optional SMTP variables for company email deployment:

```text
Email__SmtpHost=smtp.your-company.com
Email__SmtpPort=587
Email__EnableSsl=true
Email__Username=your-smtp-user
Email__Password=your-smtp-password
Email__FromEmail=no-reply@your-company.com
Email__FromName=IT Equipment Management
```

Production database setup:

- Create hosted MySQL database `it_equipment_management_smkc`.
- Apply scripts from `database/smkc/001_database_setup.sql` through `database/smkc/009_email_otp_schema.sql` in order.
- Create/verify the first Super Admin through the app setup flow.
- Add original organization data only after deployment configuration is confirmed.

## Phase Status

- Phase 1 Local Setup: complete
- Phase 2 Database Design: complete
- Phase 3 Authentication: complete for current scope
- Phase 4 Core APIs: complete
- Phase 5 Frontend Integration: complete
- Phase 6 Reports: complete
- Phase 7 Export, Import and Backup Tracking: complete for current scope
- Phase 8 Email/Security: email verification current scope complete; SMTP/OTP requires company email deployment
- Phase 9 RBAC/Admin/Profile/Settings: complete
- Phase 10 Final Testing: pre-data smoke checks complete; full E2E pending after original data is loaded

## Submission Handover Notes

- Current local app is backend-connected; visible demo labels and static status badges have been removed.
- Activity Logs, Dashboard, Settings, Reports, Help, Admin pages and core modules read backend/API data.
- Original organization data is intentionally not loaded yet; add it at the final testing stage.
- Full add/edit/delete/end-to-end testing must be done after original data or approved test data is available.
- Vercel can host the Next.js frontend only. ASP.NET Core API and MySQL must be hosted separately for full production use.
- SMTP/OTP email delivery needs real company SMTP credentials; without SMTP, keep email OTP out of the production login flow.
- Backup download/tracking is active; restore/import-from-backup remains a controlled maintenance operation.

## Original Data Collection Template

Use this order when collecting and loading real organization data so foreign-key relationships stay valid:

1. Departments
2. Vendors
3. Purchases / Work Orders
4. Assets
5. Deliveries
6. Transfers
7. Returns
8. Maintenance
9. Users / access requests, if extra users are needed beyond Super Admin

Minimum columns to prepare:

- Departments: `departmentCode`, `departmentName`, `headOfDepartment`, `email`, `phone`, `location`, `status`
- Vendors: `vendorCode`, `vendorName`, `contactPerson`, `contactEmail`, `contactPhone`, `gstNumber`, `paymentTerms`, `address`, `status`
- Purchases / Work Orders: `workOrderNumber`, `vendorCode`, `invoiceNumber`, `workOrderDate`, `expectedDeliveryDate`, `itemName`, `category`, `quantity`, `unitPrice`, `approvalStatus`, `paymentStatus`, `receivedStatus`, `invoiceStatus`
- Assets: `assetTag`, `assetName`, `category`, `brand`, `model`, `serialNumber`, `workOrderNumber`, `invoiceNumber`, `purchaseDate`, `warrantyExpiry`, `custodianDepartmentCode`, `currentDepartmentCode`, `currentReceiverName`, `location`, `assetCondition`, `lifecycleStatus`, `assetStatus`
- Deliveries: `deliveryCode`, `assetTag`, `departmentCode`, `receiverName`, `deliveryDate`, `accessories`, `acknowledgementStatus`, `deliveryStatus`
- Transfers: `transferCode`, `assetTag`, `fromDepartmentCode`, `toDepartmentCode`, `currentReceiverName`, `newReceiverName`, `transferReason`, `conditionAtTransfer`, `collectionDate`, `issueDate`, `transferStatus`
- Returns: `returnCode`, `deliveryCode`, `assetTag`, `departmentCode`, `returnedByName`, `returnDate`, `returnCondition`, `receivedLocation`, `inspectionStatus`, `damageDecision`, `returnStatus`
- Maintenance: `maintenanceCode`, `assetTag`, `issueType`, `reportedByName`, `vendorCode`, `serviceType`, `priority`, `serviceDate`, `expectedCompletionDate`, `completionDate`, `downtimeHours`, `warrantyClaim`, `approvalStatus`, `maintenanceCost`, `maintenanceStatus`

Final test data rule: keep asset tags, department codes, vendor codes, work order numbers and workflow codes unique. Use real values only after taking a database backup or before the first production launch.

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
- Verify backup restore remains disabled as a controlled maintenance operation.
- Save report branding in Settings and verify it persists through backend settings.

Final deployment readiness:

- Set `NEXT_PUBLIC_API_BASE_URL` for hosted backend.
- Host ASP.NET Core backend separately from Vercel.
- Move MySQL from local DB to hosted/cloud DB.
- Apply database scripts `001` through `009` in production.
- Configure production JWT signing key, DB connection, setup key and CORS origin.
- Configure SMTP only when company email credentials are available.
