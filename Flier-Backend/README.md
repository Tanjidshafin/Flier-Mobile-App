# Flier Backend

Express + MongoDB backend for the Flier app, prepared for both local Node execution and Vercel deployment.

## Environment variables

Create a `.env` file from `.env.example` and set:

- `MONGODB_URI`: MongoDB connection string
- `DB_NAME`: database name to use
- `JWT_SECRET`: secret used to sign auth tokens
- `PORT`: local development port, defaults to `5000`
- `CLIENT_URL`: single allowed frontend origin
- `CLIENT_URLS`: optional comma-separated list of additional allowed origins, useful for Vercel preview/production URLs
- `JWT_EXPIRES_IN`: optional token expiry, defaults to `7d`
- `ADMIN_BOOTSTRAP_EMAILS`: optional comma-separated list of email addresses that should auto-promote to admin on register/login/session refresh
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: required for avatar and hotel image uploads
- `STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`: required for the Stripe payment flow

On Vercel, add the same values in Project Settings -> Environment Variables.

## Local development

```bash
npm install
npm run dev
```

The local server runs from `src/server.js`.

## Deploying to Vercel

This backend is configured as a serverless Express app through [api/index.js](/d:/Project/Flier-app/Flier-Backend/api/index.js) and [vercel.json](/d:/Project/Flier-app/Flier-Backend/vercel.json).

Suggested Vercel setup:

1. Import the `Flier-Backend` folder as its own Vercel project, or set the project root to `Flier-Backend`.
2. Framework preset: `Other`.
3. Install command: `npm install`
4. Build command: leave empty
5. Output directory: leave empty
6. Add environment variables: `MONGODB_URI`, `DB_NAME`, `JWT_SECRET`, and optionally `CLIENT_URL`, `CLIENT_URLS`, `JWT_EXPIRES_IN`

After deployment, your health check should be available at:

```text
https://your-project.vercel.app/api/health
```

## Seeding data

Seed the hotel data from your machine or CI environment after the MongoDB values are set:

```bash
npm run seed
```

or:

```bash
npm run seed:hotels
```

The script is idempotent and upserts records by hotel `slug`, so running it again updates existing seeded hotels instead of creating duplicates.

Example PowerShell flow:

```powershell
cd Flier-Backend
Copy-Item .env.example .env
npm install
npm run seed
```

## Notes

- Vercel does not use `src/server.js`; it uses the serverless handler in `api/index.js`.
- Database connections are cached between warm invocations to reduce reconnect overhead.
- Requests without an `Origin` header, such as mobile app calls or server-to-server requests, are allowed.
