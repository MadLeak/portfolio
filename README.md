# Adhonys Diaz Portfolio

Personal portfolio built with React + TypeScript on Vite, with a Bun-powered telemetry API for Proxmox metrics.

This repository is Bun-first.

## Stack

- Frontend: React 19, TypeScript, Vite 8, Tailwind CSS 4, HeroUI
- Routing: React Router
- i18n: i18next + react-i18next (EN/ES)
- Backend telemetry: Bun (`server.ts`)

## Requirements

- Bun 1.3+

Node.js is not required for normal development in this repo.

## Quick Start

1. Install dependencies:

```bash
bun install
```

2. Create `.env.local` in the project root:

```env
PVE_HOST=https://your-proxmox-host:8006
PVE_TOKEN=your-user@pam!tokenid=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
PVE_NODE=pve
VITE_TELEMETRY_URL=http://localhost:3001/api/telemetry
```

3. Start frontend + telemetry API:

```bash
bun run dev
```

Default ports:

- Frontend (Vite): `http://localhost:5173`
- Telemetry API (Bun): `http://localhost:3001`

## Scripts (Bun)

- `bun run dev`: Starts Vite and telemetry API in parallel.
- `bun run server`: Starts only the telemetry API.
- `bun run build`: Runs TypeScript build and Vite production bundle.
- `bun run preview`: Serves the production frontend build.

## Telemetry API

Entry point: `server.ts`

Endpoint:

```text
GET /api/telemetry
```

Response includes:

- CPU (usage, cores, load average)
- RAM, disk, and swap utilization
- Uptime, kernel, and Proxmox version
- LXC container states and resource usage
- Estimated temperature value

If Proxmox cannot be reached or credentials are invalid, the endpoint returns `503` with an error payload.

## Frontend Behavior

- Telemetry widget polls `VITE_TELEMETRY_URL` every 5 seconds.
- If telemetry URL is missing, widget remains disconnected.
- Language is auto-detected and cached in local storage.

## Project Layout

```text
src/
  components/   shared UI components
  modules/      route-level sections (hero/about/projects/experience/contact)
  hooks/        custom hooks (telemetry polling)
  i18n/         i18n setup + locale dictionaries
  data/         CV/profile data
server.ts       Bun telemetry service
```

## Current Status

- Repository currently contains both `bun.lock` and `package-lock.json`.
- For consistency, use Bun commands and keep `bun.lock` as the source of truth.

## License

Personal portfolio repository.
