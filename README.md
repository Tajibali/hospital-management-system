# OPD Mirpur Mathelo — Hospital Management System

Next.js 14 (App Router) + TypeScript + Tailwind CSS + **MongoDB** (Prisma) + NextAuth.
Three isolated portals: **Admin**, **Doctor**, **Staff** — each with its own login and protected dashboard.

No dummy/seed data is included. Every collection starts empty — add your own doctors, staff, patients, and appointments after setup.

## 1. How accounts work

- **Admin has no database record at all.** The admin email/password live only in environment variables (`ADMIN_EMAIL` / `ADMIN_PASSWORD`) — see below. Nothing is saved to MongoDB for the admin account; whoever controls the `.env` file controls admin access.
- **Doctors and Staff sign up themselves** at `/doctor/signup` and `/staff/signup`, but their account is **PENDING** until the Admin approves it from the **Account Requests** page. They cannot log in until approved.
- Every role logs in on its own dedicated page (`/admin/login`, `/doctor/login`, `/staff/login`) — fully separate pages, and middleware keeps each portal isolated from the others (a staff account can never open `/admin/*`, etc).

## 2. Requirements

- Node.js 18+ and npm
- A MongoDB database — **MongoDB Atlas** is recommended (free tier works, and it's what you'll point Vercel at in production too)

## 3. Setting up MongoDB Atlas (free tier is enough)

1. Go to https://www.mongodb.com/cloud/atlas/register and create a free account.
2. Create a free **M0 cluster**.
3. Under **Database Access**, create a database user with a username/password.
4. Under **Network Access**, add `0.0.0.0/0` (allow access from anywhere) — needed since Vercel's IPs aren't fixed.
5. Click **Connect > Drivers**, copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Add a database name right after the host and before the `?`:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/hospital_db?retryWrites=true&w=majority
   ```
   This full string is your `DATABASE_URL`.

## 4. Local setup

```bash
npm install
cp .env.example .env
```

Edit `.env`:
```
DATABASE_URL="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/hospital_db?retryWrites=true&w=majority"
NEXTAUTH_SECRET="paste output of: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"

# Admin login — NOT stored in the database, just these two values
ADMIN_EMAIL="admin@opdmirpurmathelo.com"
ADMIN_PASSWORD="ChangeThisStrongPassword123"
```

Push the Prisma schema to MongoDB (creates all collections — MongoDB has no migration files, `db push` is all you need):
```bash
npx prisma db push
```

Run the app:
```bash
npm run dev
```

Open http://localhost:3000 → log in at `/admin/login` with the `ADMIN_EMAIL` / `ADMIN_PASSWORD` you set in `.env`.

## 5. Approving Doctors & Staff

1. A doctor/staff member goes to `/doctor/signup` or `/staff/signup`, fills the form (photo optional), and submits.
2. They land on a "Request sent" page — their account exists but is **PENDING**.
3. Log in as Admin → **Account Requests** in the sidebar → approve or reject.
4. Once approved, they can log in immediately at their own login page.

## 6. ID Cards & QR attendance

- Every Doctor and Staff member (whether they self-signed-up or were added directly by Admin) gets a unique QR code automatically.
- From the Doctors or Staff page, click **"View ID card"** to see a hospital-branded card: **OPD Mirpur Mathelo** header, their photo (if uploaded), name, role, and QR code.
- Two buttons on that card:
  - **Download PNG** — saves the card as an image file, ready to send to a printer or print shop.
  - **Print** — opens the browser's print dialog with only the card visible (use "Save as PDF" there if you want a PDF instead of paper).
- The same QR code is what the **QR Scanner** page (Admin sidebar) reads to mark daily attendance — works for both doctors and staff.
- Photos are optional everywhere they appear (signup forms and Admin's Add Doctor/Add Staff forms). If no photo is uploaded, the card shows a placeholder icon instead.

## 7. How the system works

### Admin Portal (`/admin/dashboard`)
- Sidebar: Dashboard, Account Requests, Patients, Doctors, Staff, Appointments, Leave Requests, QR Scanner, Analytics.
- Full CRUD on appointments (book, edit, cancel, delete, mark complete).
- Add Doctor / Add Staff forms (with optional photo) — these are auto-approved immediately since the Admin is creating them personally; each gets a temporary password shown once in a toast.
- Two leave tables: doctors currently on approved leave, staff currently on approved leave.
- Analytics: weekly and monthly appointment volume charts.

### Doctor Portal (`/doctor/dashboard`)
- Sees only their own appointments: total, pending, completed counts, today's schedule.
- Can mark appointments Complete or Cancelled — reflects immediately on the Admin dashboard.
- Can submit a leave request — goes to the Admin, shows "granted" once approved.
- Sees a table of staff currently on approved leave.

### Staff Portal (`/staff/dashboard`)
- Sees today's appointments across all doctors, total doctors, and an hourly graph of today's appointments.
- Sees a table of doctors currently on approved leave.
- Can submit their own leave requests and track approval status.

## 8. Deploying to Vercel

1. Push this project to a GitHub repository.
2. Go to https://vercel.com/new and import the repo.
3. In **Environment Variables**, add:
   - `DATABASE_URL` → your MongoDB Atlas connection string
   - `NEXTAUTH_SECRET` → a strong random secret
   - `NEXTAUTH_URL` → your production URL, e.g. `https://your-app.vercel.app`
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` → your real admin credentials for production
4. Deploy. Vercel runs `npm run build`, which runs `prisma generate` first automatically.
5. **Push the schema to your production database once**, from your local machine, pointed at the same `DATABASE_URL`:
   ```bash
   npx prisma db push
   ```
6. Visit `https://your-app.vercel.app/admin/login` and log in with your production `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

Notes for Vercel specifically:
- The Prisma schema already includes `binaryTargets = ["native", "rhel-openssl-3.0.x"]` — required for Prisma's query engine on Vercel's serverless functions.
- MongoDB Atlas clusters are always replica sets (even the free M0 tier), which Prisma's MongoDB connector requires — no extra configuration needed.

## 9. Tech notes

- **Auth**: NextAuth (Credentials provider, JWT sessions). Admin is checked purely against env vars, no DB call. Doctor/Staff login checks `user.status` — `PENDING` and `REJECTED` accounts are blocked with a clear message.
- **Database**: Prisma ORM with the MongoDB connector. Schema in `prisma/schema.prisma`.
- **Photos**: stored as base64 data URLs directly on the `User` document (`photoUrl` field) — no external file storage needed. Fine for ID-card-sized photos; if you later want full-size photo galleries, swap this for a proper object storage bucket.
- **QR flow**: both Doctor and Staff get a unique `qrToken` at creation. The ID Card modal renders it as a scannable QR (`qrcode` package) alongside the photo and hospital name, exportable via `html2canvas` (PNG) or the browser's native print dialog (PDF). The QR Scanner page reads it back with `html5-qrcode` and calls `/api/attendance`, checking the token against both Doctor and Staff records.
- **Charts**: Recharts, used for weekly/monthly trends (Admin) and today's hourly chart (Staff).

## 10. Automation-friendly integration (n8n / Make.com)

Every collection (appointments, leave, attendance, doctors, staff, patients) is exposed through plain REST JSON endpoints under `/api/*`, protected by session cookies. For webhook-driven automation, the cleanest pattern is a dedicated `/api/webhooks/...` route with its own API-key check, then push results into Google Sheets using n8n's Google Sheets node.

## 11. Production build (manual, without Vercel)

```bash
npm run build
npm run start
```
