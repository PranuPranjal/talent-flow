## TalentFlow

TalentFlow is an open-source single-page application for managing jobs and candidates. It's built with React + TypeScript, powered by Vite, and includes a small in-browser database and mock API used during development.

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Quick start (development)](#quick-start-development)
- [Build & preview](#build--preview)
- [Useful npm scripts](#useful-npm-scripts)
- [Project structure (high-level)](#project-structure-high-level)
- [API endpoints (mocked by MSW)](#api-endpoints-mocked-by-msw)
- [Development notes](#development-notes)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Features

- Jobs CRUD and ordering (drag & drop)
- Candidate management with stages (applied, screen, tech, offer, hired, rejected)
- Kanban view for candidates
- Local in-browser DB (Dexie) and migrations
- Mock API for local development (MSW)
- Framer Motion animations and TailwindCSS UI

## Tech stack

- React 19 + TypeScript
- Vite (dev server & build)
- TailwindCSS for styling
- Framer Motion for UI animations
- Dexie for IndexedDB-based local database
- MSW (Mock Service Worker) for local API mocking
- @dnd-kit for drag & drop

## Quick start (development)

Prerequisites: Node.js (16+ recommended) and npm.

Open a terminal in the project root and run:

```powershell
# install dependencies
npm install

# start dev server (Vite)
npm run dev
```

The app runs on the port printed by Vite (default 5173). Open the URL shown by the dev server in your browser.

MSW (Mock Service Worker) is configured to run in development: the worker file is available under `public/mockServiceWorker.js` and the service is initialized from `src/msw/browser.ts`.

## Build & preview

```powershell
# build for production
npm run build

# preview production build locally
npm run preview
```

## Useful npm scripts

- `npm run dev` — start development server with HMR
- `npm run build` — compile TypeScript and bundle production assets
- `npm run preview` — serve the production build locally
- `npm run lint` — run ESLint across the project

These scripts are defined in `package.json`.

## Project structure (high-level)

- `src/`
- `components/` — reusable UI components (Buttons, Modal, LoadingSpinner, etc.)
- `screens/` — top-level pages (Jobs, Candidates, Auth, Home)
- `db/` — Dexie schema, migrations and services for data access
- `contexts/` — React context providers (Auth, Database)
- `hooks/` — custom hooks (useApi, useDebounce, useLocalStorage)
- `msw/` — mock API handlers and worker setup
- `services/` — API client adapters
- `types/` — TypeScript types
- `utils/` — helpers and constants

Other files:

- `public/` — static assets and the MSW worker file
- `vite.config.ts` — Vite configuration
- `tailwind.config.js` — Tailwind configuration

## API endpoints (mocked by MSW)

During development the project uses MSW (Mock Service Worker) to provide an HTTP API. The handlers are defined in `src/msw/handlers.ts`. Below are the available endpoints and brief usage notes — these mirror the client-side `services` calls used in the UI.

Base path used in dev: `/api`

Jobs
- GET /api/jobs?page=&pageSize=&search=&status=&tags=&sort=
	- List jobs with pagination and optional filters. Example: `/api/jobs?search=engineer&page=1&pageSize=10`
- GET /api/jobs/:id
	- Get a single job by id
- POST /api/jobs
	- Create a new job. Body: job object (title, description, status, order, etc.)
- PATCH /api/jobs/:id
	- Update job fields. Body: partial job object
- PATCH /api/jobs/:id/reorder
	- Reorder jobs. Body: `{ fromOrder: number, toOrder: number }`
- DELETE /api/jobs/:id
	- Delete job by id

Candidates
- GET /api/candidates?page=&pageSize=&search=&stage=&jobId=&sort=
	- List candidates; supports filtering by stage and jobId
- GET /api/candidates/:id
	- Get candidate details
- GET /api/candidates/:id/timeline
	- Get candidate timeline/activity
- POST /api/candidates
	- Create candidate. Body: candidate object
- PATCH /api/candidates/:id
	- Update candidate fields

Assessments
- GET /api/assessments?page=&pageSize=&jobId=&search=
	- List assessments (optionally by jobId)
- GET /api/assessments/:jobId
	- Get the assessment for a job
- PUT /api/assessments/:jobId
	- Create or update assessment for a job. Body: assessment payload
- POST /api/assessments/:jobId/submit
	- Submit an assessment response for a job's assessment. Body: response data

Notes
- MSW simulates delay and occasional errors (see `src/msw/handlers.ts`) to mimic a real API during development.
- In production you would replace the mocked endpoints with a real backend and adjust the base URL in `src/services/api.ts`.

## Development notes

- The app uses Dexie (IndexedDB) as a local database. Migrations live under `src/db/migrations` and are run on startup by the database initialization helper.
- MSW provides a local API surface for dev; handlers are in `src/msw/handlers.ts` and the worker is registered from `src/msw/browser.ts`.
- The Kanban and drag reorder use `@dnd-kit`.

### Common development tasks

- Reset local DB: open dev tools > Application > IndexedDB > delete the `talent-flow` database (or use a helper in the app if provided).
- Seed data is available in `src/data/seedData.ts`.

## Troubleshooting

- If the dev server doesn't start, check which process is using the port and try another port: `npm run dev -- --port 5174`.
- If MSW doesn't seem to mock requests, ensure `public/mockServiceWorker.js` is present and that the worker is registered in `src/msw/browser.ts`.

## Contributing

Contributions are welcome. A suggested workflow:

1. Fork the repo and create a feature branch
2. Run lint and tests locally
3. Open a pull request with a clear description of the change

Please follow existing code style and run `npm run lint` before creating PRs.

## License

This repository includes a LICENSE file — follow the terms in that file.

---