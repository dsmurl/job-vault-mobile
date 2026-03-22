# Job Vault Mobile - Features & Functionality

This document provides a comprehensive list of features and their intentions for future developers of the Job Vault mobile application.

## Overview

Job Vault is a local-first mobile app designed for tracking job search activities. It focuses on managing **Companies** and **Calendar Events** entirely on-device using SQLite.

The app is organized into three main navigation tabs: **Companies**, **Calendar**, and **Events**.

---

## 1. Companies Tab

The Companies tab is the primary place to manage organizations you are interacting with.

### Features

- **Company List:** Displays all added companies. Archived companies appear with a subtle style.
- **Star Rating:** Rate companies from 0 to 5 stars to prioritize your targets.
- **Archiving:** Archive companies you are no longer actively pursuing to keep your list clean without deleting data.
- **Quick Filtering Navigation:** Each company card has two action buttons:
  - **Calendar Icon:** Sets the global company filter and navigates to the Calendar tab.
  - **List Icon:** Sets the global company filter and navigates to the Events tab.

### Buttons & Options

- **Add (Header):** Opens a modal to create a new company (Name, URL, Contact, Notes).
- **Edit (Pencil Icon):** Update existing company information.
- **Delete (Trash Icon):** Permanently removes a company after confirmation.
- **Archive/Restore (Box/Restore Icon):** Toggles the archived status.
- **Star Icons:** Clickable to set the rating (1-5 stars). Clicking the current rating resets it to one level lower (or 0).

---

## 2. Calendar Tab

The Calendar tab provides a monthly view of all job-related events, such as interviews, coffee chats, and application deadlines.

### Features

- **Monthly View:** Standard calendar grid showing days of the month.
- **Event Indicators:** Days with events show colored dots corresponding to the event types.
- **Daily Event Sheet:** Tapping a day opens a bottom sheet or modal listing all events for that specific day.
- **Global Company Filter:** Use the header dropdown to filter the calendar to only show events for a specific company.

### Buttons & Options

- **Chevron Left/Right:** Navigate between months.
- **Filter Dropdown (Header):** Select a specific company to filter events, or "All Companies".
- **Plus Icon (on a specific day):** Quickly add a new event for that date.
- **Event Item (in daily list):** Tap to view full event details or edit.

---

## 3. Events Tab

The Events tab provides a chronological list of all events across all dates.

### Features

- **Scrollable List:** Shows all events, grouped or sorted by date.
- **Visual Feedback:** Event types are color-coded (e.g., Interviews, Applications).
- **Global Company Filter:** Similar to the Calendar tab, you can filter the entire list by company using the header dropdown.

### Buttons & Options

- **Filter Dropdown (Header):** Filter events by company.
- **Event Item:** Tap to view details, edit, or delete the event.
- **Add (if present):** Typically handled via the Calendar or specific company actions, but the list provides a view of existing data.

---

## Core Entities & Relationships

### Companies

- **Nature:** Represents a potential employer.
- **Use:** Acts as the parent entity for events. Most events should be linked to a company to track the timeline of interaction with that specific employer.

### Events

- **Nature:** Represents a specific point-in-time activity (Interview, Phone Screen, Application, Coffee Chat, Technical Test, etc.).
- **Use:** Used to build a timeline of your job search.
- **Fields:**
  - **Type:** Categorizes the event (Interview, etc.).
  - **Company:** Link to a record in the Companies table.
  - **Time:** Start and end times (stored in UTC, displayed in local time).
  - **Emoji:** Custom visual indicator for the event.

## Intentions for Developers

- **Local-First Privacy:** All database operations are in `utils/db.js`. Avoid adding any network calls that leak user data.
- **Shared State:** The `_layout.jsx` provides a `FilterContext` (via `useFilter`) to keep the "Selected Company" in sync when navigating between tabs.
- **Consistent UI:** Use `react-native-paper` components and `lucide-react-native` icons to maintain the design language.
- **Date Handling:** Always use `utils/time.js` helpers for converting between UTC (database) and local time (UI) to prevent timezone bugs.
