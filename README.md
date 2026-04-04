# Livslust och hållbart stöd — Website

Website for **Livslust och hållbart stöd**, a Swedish non-profit support organisation (ideell förening) for suicide loss survivors — family members and friends who have lost a loved one to suicide.

## Project Overview

See [overview.md](overview.md) for a full description of the organisation, design direction, and technical architecture.

See [todo.md](todo.md) for the MVP task list and suggested future features.

## Design Reference

`poster.jpg` in this folder contains the organisation's poster, used as a design reference for colours and branding.

## Tech Stack

- **Frontend**: React + Vite + TypeScript
- **CMS**: Directus (headless, self-hosted, Docker image)
- **Database**: PostgreSQL 16
- **Orchestration**: Docker Compose
- **i18n**: Swedish (primary) + English

## Repository

Hosted on GitHub: [HammerOfSteel/livlust_website](https://github.com/HammerOfSteel/livlust_website)

## Getting Started

```bash
cp .env.example .env   # review and fill in secrets
docker compose up --build
```

| Service  | URL                          | Description              |
|----------|------------------------------|--------------------------|
| Frontend | http://localhost:3000        | Public website           |
| Directus | http://localhost:8055/admin  | CMS admin panel          |

## Themes

Change `VITE_THEME` in `.env` and restart the frontend container:

| Value      | Palette                        |
|------------|--------------------------------|
| `ocean`    | Teal and soft green (default)  |
| `forest`   | Deep green and warm gold       |
| `nordic`   | Navy and light blue            |
| `sunset`   | Warm terracotta and amber      |
| `lavender` | Soft purple and lilac          |