# WebPulse — Intelligent Web Scraper & AI Data Explorer

Production-ready full-stack SaaS for web scraping, change detection, analytics, and AI-powered data exploration.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React (Vite), Tailwind CSS, Shadcn UI, TanStack Table, Recharts, Axios, Zustand |
| Backend | Node.js, Express, JWT, PostgreSQL, pgvector |
| Scraping | Cheerio, Puppeteer |
| Queue | BullMQ + Redis |
| Scheduler | node-cron |
| AI | OpenAI (RAG + pgvector semantic search) |

## Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- OpenAI API key (for AI chat & embeddings)

### 1. Start infrastructure

```bash
docker compose up -d
```

### 2. Configure environment

```bash
cp backend/.env.example backend/.env
# Edit backend/.env — set JWT_SECRET and OPENAI_API_KEY
```

### 3. Install dependencies

```bash
npm run install:all
```

### 4. Run migrations

```bash
npm run migrate
```

### 5. Start services (3 terminals)

```bash
# Terminal 1 — API server
npm run dev:backend

# Terminal 2 — Queue worker
npm run dev:worker

# Terminal 3 — Frontend
npm run dev:frontend
```

- Frontend: http://localhost:5173
- API: http://localhost:3001/api/health

## Project Structure

```
Webpulse/
├── backend/
│   ├── src/
│   │   ├── config/           # Environment configuration
│   │   ├── controllers/      # Route handlers
│   │   ├── db/
│   │   │   ├── migrations/   # SQL schema migrations
│   │   │   ├── migrate.js
│   │   │   └── pool.js
│   │   ├── middleware/       # Auth, validation, error handling
│   │   ├── repositories/     # Data access layer
│   │   ├── routes/           # REST API routes
│   │   ├── services/
│   │   │   ├── scraper/      # Cheerio + Puppeteer engines
│   │   │   ├── aiService.js  # RAG + embeddings
│   │   │   ├── queueService.js
│   │   │   └── ...
│   │   ├── workers/          # BullMQ scrape worker
│   │   ├── app.js
│   │   └── index.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/       # UI + layout + charts
│   │   ├── pages/            # All app pages
│   │   ├── stores/           # Zustand state
│   │   └── lib/              # API client + utils
│   └── package.json
└── docker-compose.yml
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Get project |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |
| POST | `/api/projects/:id/scrape` | Trigger scrape |
| GET | `/api/projects/:id/runs` | Scrape runs |
| GET | `/api/projects/:id/data` | Scraped data |
| GET | `/api/projects/:id/changes` | Change logs |
| GET | `/api/projects/:id/analytics` | Analytics |
| GET | `/api/projects/:id/export?format=json\|csv` | Export data |
| POST | `/api/projects/:id/chat` | AI chat (SSE stream) |
| GET | `/api/projects/:id/chat` | Chat history |

### Dashboard & Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Dashboard widgets |
| GET | `/api/notifications` | List notifications |
| PATCH | `/api/notifications/:id/read` | Mark read |

## Database Schema

- **users** — Authentication & roles
- **projects** — Scraping projects per user
- **scrape_runs** — Individual scrape executions
- **scraped_data** — Structured JSON + pgvector embeddings
- **change_logs** — Detected additions/removals/updates
- **chat_history** — AI conversation history
- **notifications** — System notifications

## Features

- JWT authentication with protected routes & tenant isolation
- Cheerio (static) + Puppeteer (JS-rendered) scraping with auto-detect
- BullMQ job queue with retries
- Scheduled scraping (hourly/daily/weekly)
- Change detection between scrape runs
- pgvector semantic search + OpenAI RAG chatbot
- Dashboard with stats, charts, and notifications
- CSV/JSON export per project or scrape run
- Rate limiting, input validation, helmet security headers

## License

MIT
