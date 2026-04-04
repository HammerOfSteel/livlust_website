# Livslust och hållbart stöd — Website

Website for **Livslust och hållbart stöd**, a Swedish support organisation (förening) for suicide loss survivors — family members and friends who have lost a loved one to suicide.

## Project Overview

See [overview.md](overview.md) for a full description of the organisation, design direction, and technical architecture.

See [todo.md](todo.md) for the MVP task list and suggested future features.

## Design Reference

`poster.jpg` in this folder contains the organisation's poster and logo, used as the primary design reference for colours, typography, and branding.

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Frontend**: React (Vite)
- **Backend / API**: Express (TypeScript)
- **Database**: PostgreSQL
- **Orchestration**: Docker Compose
- **i18n**: Swedish (primary) + English

## Repository

Hosted on GitHub under the **hammerofsteel** organisation.

## Getting Started

```bash
docker compose up --build
```

The app will be available at `http://localhost:3000`.