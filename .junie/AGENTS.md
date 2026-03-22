# Job Vault Mobile - Project Guidelines

## Project Overview

**Job Vault Mobile** is a local-first application built with React Native and Expo, designed to manage job search
activities. Users can track companies and schedule job-related events in a local SQLite database for privacy and
performance.

## Technology Stack

- **Framework:** React Native with Expo
- **Routing:** Expo Router (File-based)
- **Database:** Expo SQLite (`expo-sqlite`)
- **UI Components:** `react-native-paper` and `lucide-react-native`
- **Package Manager:** `pnpm`
- **Navigation:** `expo-router`

## Directory Structure

- `app/`: Contains Expo Router screens (`index.jsx`, `calendar.jsx`, `_layout.jsx`, etc.).
- `components/`: Reusable React Native UI components.
- `utils/`: Utility functions and database logic (`db.js`, `time.js`).
- `assets/`: App icons, splash screens, and static assets.
- `docs/`: Project documentation and architecture guides.

## Core Concepts

- **Local Storage:** All user data (Companies, Calendar Events) is stored in a local SQLite database (`jobvault.db`) on
  the device.
- **Privacy-First:** Data is not synced to a remote server; it stays on the device.
- **Database Logic:** Centralized in `utils/db.js` using the `expo-sqlite` API.

## Coding Standards

- **React Native:** Use functional components with hooks and don't use default exports for a component unless they are
  route level components that must be cdefault exports. I want to use named exports when possible.
- **Styling:** Use `react-native-paper` components where appropriate; otherwise, use `StyleSheet`.
- **Async Operations:** All database and storage calls must be asynchronous.

## Development Workflow

- Start development: `pnpm expo start`
- Running on iOS/Android: `i` or `a` from the Expo CLI, or scan QR with Expo Go.
- Dependency management: Use `pnpm`.

## Prohibitions

- **DO NOT** use `npx` for Expo commands; always use `pnpm expo whatever`.
- **DO NOT** add remote API calls for user data without explicit instruction.
- **DO NOT** bypass the `utils/db.js` API for database access.

## Skills

Skills are stored in `.junie/skills/`. Please refer to that directory for additional automated capabilities.

## Building on the ai files

When the user asks questions about Junie skills, commands, custom agents, or ai setup, can you reference the
site https://junie.jetbrains.com/docs for authoritative methods of using junie config files.
