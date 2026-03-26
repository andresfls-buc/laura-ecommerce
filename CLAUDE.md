# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Laura Ecommerce** (Gogo Uniformes) — a full-stack e-commerce app with a React frontend and Express/PostgreSQL backend. The two services run independently on separate ports.

## Development Commands

### Frontend (port 3001)
```bash
cd frontend
npm start       # Dev server
npm run build   # Production build
npm test        # Run tests (Jest / React Testing Library)
```

### Backend (port 3000)
```bash
cd server
npm run dev     # Start Express server (node src/app.js)
```

### Database
```bash
docker-compose up -d   # Start PostgreSQL (5432) and PGAdmin (5050)

# From server/ directory:
npx sequelize-cli db:migrate          # Run pending migrations
npx sequelize-cli db:migrate:undo     # Rollback last migration
```

## Architecture

### Monorepo Structure
- `frontend/` — React 19 app (Create React App + Tailwind CSS)
- `server/` — Express 5 REST API
- `migrations/` — Sequelize migration files (historical; active migrations live in `server/migrations/`)
- `docker-compose.yml` — PostgreSQL 14 + PGAdmin

### Frontend

**State management** is via React Context API only — no Redux:
- `CartContext` — cart items, persisted to `localStorage`
- `AuthContext` — JWT token storage and admin role management

**API calls** all go through `frontend/src/services/api.js`, a fetch-based client that injects the Bearer token automatically.

**Routing** is page-based in `App.js`. Admin routes (`/admin/*`) are wrapped in `<ProtectedRoute>` which checks `AuthContext`.

### Backend (MVC-style)

Request flow: `routes → middleware (validate/auth) → controller → service → model`

- **Routes** (`server/src/routes/`) — `index.js` aggregates all route files
- **Controllers** — handle HTTP request/response, delegate logic to services
- **Services** — business logic layer (email sending, payment processing, order orchestration)
- **Models** — Sequelize ORM; associations defined in `models/index.js`
- **Schemas** — Joi validation schemas used by `validate.middleware.js` before controllers run
- **Middlewares** — `auth.middleware.js` (JWT + admin role), `upload.middleware.js` (Multer), `globalErrorHandler.js` (Boom-based)

### Key Domain Models

`Product → ProductVariant → ProductImage` (one-to-many chain)
`Order → OrderItems` → references `ProductVariant`

### Payment Flow

Wompi (Colombian payment gateway) in sandbox/test mode. The backend exposes `/api/payments` for webhook event handling. Payment status is tracked via enums on the `Order` model (see migrations for the enum values).

### File Uploads

Multer stores uploaded files in `server/uploads/`, served as static assets by Express.

### Email Notifications

Nodemailer with Gmail SMTP. Order confirmation sent to customer; admin notification sent to `ADMIN_EMAIL`. HTML templates in `server/src/templates/`.

## Environment Variables

**Frontend** (`frontend/.env`):
```
REACT_APP_API_URL=http://localhost:3000/api
```

**Backend** (`server/.env`):
```
PORT, DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT
JWT_SECRET
WOMPI_PUBLIC_KEY, WOMPI_PRIVATE_KEY, WOMPI_INTEGRITY_KEY, WOMPI_EVENTS_SECRET
WOMPI_REDIRECT_URL, FRONTEND_URL
GMAIL_USER, GMAIL_APP_PASSWORD
STORE_NAME, ADMIN_EMAIL
```

## Code Style

Prettier is configured at root (`.prettierrc`): 2-space indent, double quotes, trailing commas (ES5), semicolons on.
