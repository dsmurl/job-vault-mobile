# Job Vault - Project Guidelines

## Project Overview

**Job Vault** is a local-first application designed to manage job search activities. It allows users to enter raw notes
about their job search, which an AI then processes to populate a calendar and provide chat-based insights.

## Technology Stack

- **Backend:** Ruby on Rails 7.2.2.1
- **Frontend:** React with Vite, integrated via `vite-ruby`
- **Database:** SQLite3
- **AI Integration:** [Ollama](http://localhost:11434) running the `llama4:16x17b` model
- **Package Manager:** `pnpm`
- **Deployment/Management:** `bin/dev` (uses `Procfile.dev`)

## Directory Structure

- `app/frontend/`: Contains the React application (components, styles, entrypoints).
- `app/models/`: Core data models: `JobNote`, `CalendarEvent`, `Job`.
- `app/controllers/api/`: API endpoints for the frontend.
- `app/services/`: Business logic, including `OllamaService` for AI interactions.
- `config/`: Rails configuration files.
- `db/`: Database schema, migrations, and seeds.
- `docs/`: Project documentation and guides.

## Core Concepts & AI Integration

- **Notes & Sync:** Users add notes in `app/frontend/components/App.jsx`. The AI (`OllamaService`) scans these notes and
  converts them into structured `CalendarEvent` records.
- **AI Chat:** A sidebar chat allows users to query their job search history using the local AI model.
- **Local-First:** Designed to run locally with a local model to ensure privacy and speed.

## Coding Standards

- **Ruby:** Standard Rails conventions. Use services for complex business logic.
- **JavaScript/React:** Functional components with hooks. Styles are located in `app/frontend/styles`.
- **API:** Prefixes API routes with `/api`. Returns JSON responses.

## Development Workflow

- Use `bin/dev` to start both the Rails and Vite development servers.
- Database changes should be managed via standard Rails migrations (`bin/rails g migration ...`).
- Frontend dependencies should be managed with `pnpm`.

## Expo

- when running anything with expo, please use `pnpm expo whatever` instead of npx.

## Things to not do

- don't use npx for anything