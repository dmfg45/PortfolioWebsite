# André Graça — Portfolio

A modern full-stack portfolio site with a database-backed admin panel.

Live demo (previous static version) → https://dmfg45.github.io/PortfolioWebsite/

## Stack

- **Frontend**: React 19 + TypeScript, built with Vite, styled with Tailwind CSS v4, routed with React Router.
- **Backend**: Node.js + Express (TypeScript), REST API, JWT authentication.
- **Database**: PostgreSQL, accessed through Prisma ORM.
- **Admin section**: `/admin` — password-protected dashboard to manage portfolio projects (create/edit/delete) and read contact-form submissions, backed by the Postgres database.

The previous version of this site (`index.html`, `assets/`, `pages/*.php`) was a static Bootstrap 3 + jQuery template with a PHP/MySQL contact form containing a SQL-injection vulnerability. It has been fully replaced by the stack above.

## Project structure

```
server/   Express + Prisma API (projects, contact messages, admin auth)
client/   React + Vite + Tailwind frontend (public site + admin dashboard)
docker-compose.yml   Postgres for local development
```

## Prerequisites

- Node.js 20+
- A PostgreSQL 14+ instance (either via Docker or installed locally)

## Setup

1. **Install dependencies** (from the repo root):

   ```bash
   npm run install:all
   ```

2. **Start Postgres.** Either run it via Docker:

   ```bash
   npm run db:up
   ```

   or point `DATABASE_URL` in `server/.env` at any existing Postgres instance.

3. **Configure environment variables:**

   ```bash
   cp server/.env.example server/.env
   ```

   Edit `server/.env` and set `JWT_SECRET`, `ADMIN_USERNAME`, and `ADMIN_PASSWORD` (used only by the seed script to create the first admin account).

   Optionally create `client/.env` with `VITE_API_URL=` (empty is fine in development — Vite proxies `/api` to the server).

4. **Run database migrations and seed the admin user + sample projects:**

   ```bash
   cd server
   npm run prisma:migrate
   npm run seed
   cd ..
   ```

5. **Run the app** (server on `:4000`, client on `:5173`):

   ```bash
   npm run dev
   ```

   Visit http://localhost:5173. Log in to the admin dashboard at http://localhost:5173/admin/login with the credentials from `ADMIN_USERNAME` / `ADMIN_PASSWORD`.

## Admin panel

The admin dashboard lets you:

- Add, edit, and delete portfolio projects (title, description, image, link, sort order) — changes appear immediately on the public gallery.
- View and manage messages submitted through the public contact form (mark as read, delete).

Authentication is JWT-based: logging in returns a token stored in `localStorage` and sent as a `Bearer` token on admin API requests. All write endpoints (`POST`/`PUT`/`PATCH`/`DELETE` on `/api/projects` and `/api/contact`, except the public contact submission) require a valid token.

## Production build

```bash
npm run build        # builds the client into client/dist
cd server && npm run build && npm start   # compiles and runs the API
```

Serve `client/dist` behind any static host or reverse proxy, and point it at the deployed API (set `VITE_API_URL` at build time if the API is on a different origin).
