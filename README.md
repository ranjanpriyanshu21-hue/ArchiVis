# ArchiVis 🏛️

### Discover architecture that matches your vision.

ArchiVis is a web-based architecture discovery platform designed to help users find **architects, houses, and architectural styles** that match their personal taste and project requirements.

Instead of searching for architects randomly, users can explore architecture based on the kind of design they actually want — whether that's **minimalist, maximalist, nature-oriented, contemporary, traditional, or another architectural aesthetic**.

## ✨ What ArchiVis Does

ArchiVis connects a user's architectural preferences with relevant architects and properties.

### 🎨 Find Architects by Design Aesthetic

Users can explore architects based on the architectural style they prefer.

For example:

* Minimalist
* Maximalist
* Nature-oriented
* Contemporary
* Traditional
* Experimental
* And other design preferences

The goal is to make finding the right architect more intuitive by starting with **the user's vision rather than just the architect's name**.

### 🏠 Discover Houses

ArchiVis also allows users to explore houses based on their preferred architectural style.

If a particular house strongly matches the user's desired aesthetic, it can serve as a reference or recommendation for their project.

The platform also showcases selected houses that are currently available in the market.

### 👨‍🎨 Explore Top Architects

Users can browse featured and top architects along with their architectural work, helping them discover professionals whose design philosophy matches their preferences.

### 🔎 Search & Explore

Users can search through architectural projects, houses, and architects to find designs that fit their requirements.

### 🤖 Architecture Assistant

ArchiVis includes a lightweight AI-style assistant that responds to user prompts related to architectural choices and preferences.

The current assistant uses **rule-based logic** rather than a machine-learning model. It interprets predefined patterns and provides relevant responses based on the user's input.

This is currently a simple implementation, with plans to expand it into a more capable AI-powered system in the future.

---

## 🛠️ Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* JavaScript/HTML/CSS

### Backend

* Node.js + Express
* MySQL 8 (`mysql2`, raw SQL — no ORM)
* JWT authentication with bcrypt password hashing
* dotenv + CORS

### Architecture

The React frontend talks to the Express API over REST; the API owns all designs, architects,
styles, testimonials, favourites, inquiries and the rule-based matcher, backed by MySQL.

```
src/                 React UI (unchanged visual design) + src/api API client
backend/             Express REST API
  config/            env + MySQL pool
  routes/            route definitions
  controllers/       request handling
  models/            SQL queries
  services/          rule-based AI matcher
  middleware/        auth, validation, error handling
  database/          schema.sql, migrate.js, seed.js
```

---

## 🎯 Future Goals

ArchiVis is being developed as a larger architecture discovery platform rather than just a static website.

Future improvements include:

* [x] Backend integration
* [x] Database for architects and properties
* [x] User authentication
* [x] Save/favourite architects and houses
* [x] Advanced architectural style filtering
* [x] API-based search and filtering
* [x] Architect/project comparison
* [ ] Personalized recommendations
* [ ] Real-time property availability
* [ ] Improved AI-based recommendations (ML instead of rule-based)
* [ ] User-specific architectural profiles

---

## 🚀 Running the Project

Clone the repository:

```bash
git clone https://github.com/ranjanpriyanshu21-hue/ArchiVis.git
cd ArchiVis
```

### 1. Database (MySQL 8)

Use an existing MySQL server, or start one with Docker:

```bash
docker run --name archivis-mysql -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=archivis -p 3306:3306 -d mysql:8.0
```

With a locally installed MySQL instead:

```sql
CREATE DATABASE archivis CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Backend

```bash
cd backend
cp .env.example .env      # then fill in DB_PASSWORD and JWT_SECRET
npm install
npm run db:reset          # creates the schema and loads seed data
npm run dev               # http://localhost:5000/api
```

Backend environment variables (`backend/.env.example`):

| Variable | Description |
| --- | --- |
| `PORT` | API port (default `5000`) |
| `NODE_ENV` | `development` / `production` |
| `CORS_ORIGIN` | Allowed frontend origin (default `http://localhost:5173`) |
| `DB_HOST` / `DB_PORT` | MySQL host and port |
| `DB_USER` / `DB_PASSWORD` | MySQL credentials |
| `DB_NAME` | Database name (default `archivis`) |
| `JWT_SECRET` | Long random string used to sign tokens |
| `JWT_EXPIRES_IN` | Token lifetime (default `7d`) |

Database scripts: `npm run db:migrate` (schema), `npm run db:seed` (seed data),
`npm run db:reset` (both).

The seed data includes a demo account — `demo@archivis.dev` / `password123` — for local testing only.

### 3. Frontend

In a second terminal, from the repository root:

```bash
cp .env.example .env      # optional: only if the API is not on http://localhost:5000/api
npm install
npm run dev               # http://localhost:5173
```

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | Backend API base URL (default `http://localhost:5000/api`) |

---

## 🔌 API Reference

Base URL: `http://localhost:5000/api`

### Catalog

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/health` | Service and database health |
| `GET` | `/styles` | Style filters with design counts |
| `GET` | `/designs` | List designs. Query: `q`, `style`, `maxBudget`, `sort` (`rating` \| `budget-low` \| `budget-high`), `featured`, `architectId`, `limit`, `offset` |
| `GET` | `/designs/:id` | Design detail + its architect + similar designs |
| `GET` | `/architects` | List architects. Query: `q`, `style` |
| `GET` | `/architects/:id` | Architect detail + portfolio |
| `GET` | `/testimonials` | Client testimonials |

### Matching and forms

| Method | Endpoint | Body | Description |
| --- | --- | --- | --- |
| `POST` | `/ai/match` | `{ prompt }` | Rule-based matcher → `{ reply, matched, results }` |
| `POST` | `/inquiries` | `{ name, email, subject, message, architectId? }` | Contact form |
| `POST` | `/newsletter` | `{ email }` | Newsletter subscription |

### Authentication

| Method | Endpoint | Body | Description |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | `{ name, email, password }` | Create account → `{ token, user }` |
| `POST` | `/auth/login` | `{ email, password }` | Sign in → `{ token, user }` |
| `GET` | `/auth/me` | — | Current user (requires `Authorization: Bearer <token>`) |

Passwords are hashed with bcrypt and never returned by the API.

### Favourites (all require `Authorization: Bearer <token>`)

| Method | Endpoint | Body | Description |
| --- | --- | --- | --- |
| `GET` | `/favorites` | — | Saved design ids + designs |
| `POST` | `/favorites` | `{ designId }` | Save a design |
| `POST` | `/favorites/sync` | `{ designIds }` | Merge anonymous favourites after sign-in |
| `DELETE` | `/favorites/:designId` | — | Remove a saved design |

Signed-out visitors keep favourites in `localStorage`; they are merged into the account on the
next sign-in.

### Database schema

`users`, `styles`, `architects`, `architect_specialties`, `architect_awards`, `designs`,
`design_images`, `design_tags`, `design_materials`, `favorites`, `inquiries`, `testimonials`,
`newsletter_subscribers` — see `backend/database/schema.sql` for keys, foreign keys and indexes.

---

## 🧪 Testing

```bash
# frontend
npm run typecheck
npm run build

# backend (with MySQL running and seeded)
cd backend && npm run db:reset && npm run dev
curl http://localhost:5000/api/health
curl "http://localhost:5000/api/designs?style=Minimalist&sort=rating"
curl -X POST http://localhost:5000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"demo@archivis.dev","password":"password123"}'
```

Then open http://localhost:5173 and check the landing page, Explore search/filters, a design
detail page, an architect profile, the AI matcher, saving designs, and the contact form.

---

## 💡 The Idea Behind ArchiVis

Choosing an architect can be difficult when you don't know exactly who can bring your vision to life.

ArchiVis approaches this problem from a different direction:

> **Start with the design you want, then find the architect who fits it.**

Whether someone wants a quiet minimalist home surrounded by nature, a bold maximalist space, or a completely different architectural aesthetic, ArchiVis aims to make discovering the right architect and inspiration easier.

---

## 📌 Project Status

**Current Status:** Full-stack — React frontend connected to an Express + MySQL backend.

Designs, architects, styles, testimonials, favourites, inquiries and the matcher are served from
the database. A machine-learning recommendation engine remains future work.
