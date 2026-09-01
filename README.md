# Dynamic QR Code Generator & Analytics Platform

A production-ready SaaS application that allows administrators to generate dynamic QR codes, change destination URLs without regenerating the printed code, and track detailed scan analytics (unique visitors, coarse location, devices, browsers).

## Features
- **Dynamic Destination URLs**: Change the redirect destination anytime while the physical QR code remains exactly the same.
- **Unique Visitor Tracking**: Identifies unique scanners while preserving privacy, preventing refresh spam from inflating metrics.
- **Coarse Geolocation**: Approximates city-level scanning data using IP.
- **Analytics Dashboard**: Granular analytics (Charts, Locations, Devices, Timeline).
- **Authentication**: Secure admin login via Auth.js.
- **QR Export**: Download high-quality PNG of the QR Code.

## Architecture & Technology Stack
- **Frontend / Backend**: Next.js (App Router, React Server Components, Server Actions)
- **Styling**: Tailwind CSS & shadcn/ui
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth**: Auth.js (NextAuth.js v5)
- **Charts**: Recharts
- **QR Code Generation**: `qrcode` library

## How Dynamic QR Redirect Works
When a user scans the QR Code, they hit `GET /r/[shortCode]`. 
1. The server checks the DB to validate the QR Code is active and not expired.
2. It assigns a cryptographically secure, anonymous visitor ID cookie if none exists.
3. The server asynchronously records a `ScanEvent` containing the anonymous visitor hash, location headers, and device properties.
4. The server responds with an HTTP 307 redirect to the final destination URL.

## How Unique Visitors are Calculated
Unique visitors are calculated based on the anonymous visitor ID cookie. 
**Privacy Limitation**: Anonymous browser/device identification cannot guarantee absolute physical-device uniqueness. 
The same physical device can appear as multiple unique visitors if users:
- Clear browser cookies/storage
- Switch between browsers (e.g., from Chrome to Safari)
- Use private/incognito browsing
- Reset their browser or block storage

## How Approximate Location Works
City analytics are derived from approximate IP geolocation headers (e.g. Vercel's `x-vercel-ip-city`).
**Geolocation Limitation**: Location may occasionally be inaccurate because of mobile networks, VPNs, carrier gateways, corporate networks, and ISP routing. It is not GPS-level accuracy.

## Prerequisites
- Node.js >= 18
- A PostgreSQL Database (e.g. Supabase, Neon, Railway, or local)

## Local Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Provide your `DATABASE_URL` and generate a secret for `AUTH_SECRET` (using `npx auth secret`).

3. **Database Migration**
   Apply the Prisma schema to your database:
   ```bash
   npx prisma db push
   # Or npx prisma migrate dev
   ```

4. **Database Seed (Optional)**
   Create the initial admin user (`admin@example.com` / `password123`):
   ```bash
   npm run db:seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## Production Build & Deployment

To deploy this application (e.g., to Vercel):
1. Connect your GitHub repository to Vercel.
2. Set the Environment Variables (`DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`) in Vercel settings.
3. Vercel will automatically run `npm run build`.
4. Ensure your PostgreSQL database is accessible from Vercel's IP ranges.
5. (Optional) Run `npm run db:seed` manually in your production environment if it's a fresh database, or configure your database provider's UI to create an initial user.
