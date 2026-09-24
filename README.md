# André Graça — Portfolio

A modern full-stack portfolio site with a database-backed admin panel.

Live demo (previous static version) → https://dmfg45.github.io/PortfolioWebsite/

## Stack

- **Frontend**: React 19 + TypeScript, built with Vite, styled with Tailwind CSS v4, routed with React Router.
- **Backend**: Node.js + Express (TypeScript), REST API, JWT-backed httpOnly cookie sessions.
- **Database**: PostgreSQL, accessed through Prisma ORM.
- **Admin section**: `/admin` — password-protected dashboard to manage portfolio projects (create/edit/delete, with image upload) and read contact-form submissions, backed by the Postgres database.
- **Tests & CI**: API integration tests (Vitest + Supertest) and a GitHub Actions workflow that typechecks, tests, and builds both apps on every push/PR.

The previous version of this site (`index.html`, `assets/`, `pages/*.php`) was a static Bootstrap 3 + jQuery template with a PHP/MySQL contact form containing a SQL-injection vulnerability. It has been fully replaced by the stack above.

## Project structure

```
server/   Express + Prisma API (projects, contact messages, admin auth, uploads)
client/   React + Vite + Tailwind frontend (public site + admin dashboard)
docker-compose.yml   Full stack (Postgres + API + frontend) for local/prod-like runs
.github/workflows/ci.yml   Typecheck, test, and build both apps on push/PR
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

- Add, edit, and delete portfolio projects (title, description, image, link, sort order) — changes appear immediately on the public gallery. Images can be uploaded directly from the form (stored on the server under `server/uploads/`, served at `/uploads/...`) or set by URL.
- View and manage messages submitted through the public contact form (mark as read, delete).

Authentication uses a JWT stored in an `httpOnly`, `SameSite=Lax` session cookie (not `localStorage`), so the token is never exposed to client-side JavaScript and can't be exfiltrated via XSS. `POST /api/auth/login` sets the cookie, `POST /api/auth/logout` clears it, and `GET /api/auth/me` lets the client check whether a session is active on load. All write endpoints (`POST`/`PUT`/`PATCH`/`DELETE` on `/api/projects`, `/api/contact`, and `/api/uploads`, except the public contact submission) require a valid session cookie.

Set `COOKIE_SECURE=true` in `server/.env` (or the root `.env` for Docker) once the app is served over HTTPS through a TLS-terminating reverse proxy — otherwise leave it `false` for local HTTP development, since browsers silently drop `Secure` cookies sent over plain HTTP.

## Tests

The API has integration tests (Vitest + Supertest) that run against a real Postgres database (`portfolio_test`), exercising auth, project CRUD, contact messages, and uploads end to end.

```bash
sudo -u postgres createdb portfolio_test   # once, if it doesn't exist yet
cd server
npm test
```

`npm test` runs `prisma migrate deploy` against `portfolio_test` first, then the test suite. The same steps run in CI (`.github/workflows/ci.yml`) against a Postgres service container, alongside a typecheck and build of both apps.

## Production build (without Docker)

```bash
npm run build        # builds the client into client/dist
cd server && npm run build && npm start   # compiles and runs the API
```

Serve `client/dist` behind any static host or reverse proxy, and point it at the deployed API (set `VITE_API_URL` at build time if the API is on a different origin).

## Running the full stack with Docker

`docker-compose.yml` builds and runs Postgres, the API, and the frontend (served by nginx, which proxies `/api` and `/uploads` to the API) together:

```bash
cp .env.example .env   # set JWT_SECRET and ADMIN_PASSWORD
docker compose up --build
```

Then seed the admin user and sample projects once the containers are up:

```bash
docker compose exec server npm run seed
```

Visit http://localhost:8080 for the site and http://localhost:8080/admin/login for the admin panel. Uploaded images and Postgres data persist in named Docker volumes across restarts.

## SEO

`client/index.html` has Open Graph/Twitter meta tags, `client/public/robots.txt`, and `client/public/sitemap.xml`. Once the site has a real domain, update the `og:image`/`twitter:image` tags and the sitemap's `<loc>` to absolute URLs (e.g. `https://your-domain.com/...`) so link previews and search engines resolve them correctly.
