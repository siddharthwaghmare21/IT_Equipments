# Deployment Guide

This project has two deployable parts:

1. Next.js frontend: deploy to Vercel.
2. ASP.NET Core API: deploy separately as a .NET service or Docker container.
3. MySQL database: deploy separately on a hosted MySQL provider.

Vercel alone cannot run the full system because the frontend must call the ASP.NET Core API and the API must connect to MySQL.

## Production Order

1. Create hosted MySQL database.
2. Run database scripts from `database/smkc/001_database_setup.sql` through `database/smkc/009_email_otp_schema.sql`.
3. Deploy backend API.
4. Confirm backend health endpoint:

```text
https://your-backend-api-domain/api/health
```

5. Add backend origin to `Cors__AllowedOrigins__0` using your Vercel URL.
6. Deploy frontend to Vercel with:

```text
NEXT_PUBLIC_API_BASE_URL=https://your-backend-api-domain
```

## Backend Environment Variables

Use `backend/ITEquipment.Api/.env.example` as the production template.

Required values:

- `ConnectionStrings__DefaultConnection`
- `Jwt__SigningKey`
- `Bootstrap__SetupKey`
- `Cors__AllowedOrigins__0`

Optional values:

- `Email__*` SMTP variables

## Frontend Environment Variables

Use `.env.production.example` as the Vercel template.

Required value:

- `NEXT_PUBLIC_API_BASE_URL`

Important: `NEXT_PUBLIC_API_BASE_URL` is built into the browser bundle during `next build`, so set it before deploying/building on Vercel.

## Backend Docker Deploy

Build from the backend project folder:

```powershell
cd backend\ITEquipment.Api
docker build -t it-equipment-api .
```

The container listens on port `8080`.

## Final Verification

After deployment:

1. Open `https://your-backend-api-domain/api/health`.
2. Open Vercel frontend URL.
3. Login with the production Super Admin.
4. Confirm `/dashboard`, `/assets`, `/reports`, `/settings`, and `/activity-logs` load.
5. Confirm CORS by checking that frontend pages show backend data.
