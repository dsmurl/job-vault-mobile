# Job Vault - Local-First Mobile App

## Project Overview

**Job Vault** is a local-first application designed to manage job search activities directly on your device. It allows users to track companies and schedule job-related events in a calendar, using a local SQLite database for privacy and speed.

## Technology Stack

- **Frontend:** React Native with Expo
- **Database:** Expo SQLite (`expo-sqlite`)
- **Package Manager:** `pnpm`
- **Navigation:** `expo-router`
- **UI Components:** `react-native-paper` and `lucide-react-native`

## Project Structure

- `app/`: Contains the Expo Router screen components (`index.jsx`, `calendar.jsx`, `events.jsx`, `_layout.jsx`).
- `components/`: Reusable React Native components.
- `utils/`: Utility functions, including `db.js` for database operations and `time.js` for date/time formatting.
- `assets/`: App icons, splash screens, and other static assets.
- `docs/`: Project documentation.

## Core Concepts

- **Local Storage:** All data (Companies and Calendar Events) is stored in a local SQLite database on the device.
- **Privacy First:** No data is sent to a server. Everything remains under your control.
- **Simplified Tracking:** Direct entry and management of job search progress without needing an internet connection.

## Development Workflow

- Start the development server with `pnpm expo start`.
- Manage dependencies with `pnpm`.
- The database schema is defined and initialized in `utils/db.js`.

## Running with Expo

- To run the application, use `pnpm expo start`.
- Scan the QR code with your phone or use a simulator/emulator.
