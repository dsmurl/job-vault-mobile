# Viewing the App Database

When developing **Job Vault Mobile**, you'll often need to inspect the local SQLite database to verify data persistence or troubleshoot schema issues. Since we use `expo-sqlite`, the database lives directly on your simulator or emulator.

## Database Details

- **Database Name:** `jobvault.db`
- **Bundle ID / Package Name:** `com.jobvault.app`

---

## 1. Locate the Database File

### iOS Simulator

iOS app data is stored in a unique, hashed directory. You can find the exact path by running this command in your terminal while the simulator is running:

```bash
xcrun simctl get_app_container booted com.jobvault.app data
```

1. Copy the resulting path.
2. In Finder, use **Go > Go to Folder...** (`Cmd+Shift+G`) and paste the path.
3. Navigate to: `Library/Application Support/SQLite/jobvault.db`.

### Android Emulator

Android makes it a bit harder to browse files directly, so it's easiest to "pull" the database file to your local machine:

```bash
adb pull /data/data/com.jobvault.app/databases/jobvault.db ./jobvault.db
```

_Note: This requires `adb` (Android Debug Bridge) to be installed and in your PATH._

---

## 2. Tools for Inspection

Once you have the `jobvault.db` file (or its path), use one of these tools to explore the tables and run queries:

- **[DB Browser for SQLite](https://sqlitebrowser.org/):** (Highly Recommended) Simple, open-source, and powerful.
- **[DBeaver](https://dbeaver.io/):** A professional database tool if you prefer a more IDE-like experience.
- **SQLite CLI:** If you're comfortable with the terminal:
  ```bash
  sqlite3 jobvault.db
  ```

---

## 3. Pro-Tips for Developers

### Live Inspection with Expo

If you want to avoid manual file hunting, check out the **Expo Dev Tools** or specialized plugins like `expo-community-flipper`. These tools often provide a "Database" tab that lets you browse SQLite tables directly in your browser while the app is running.

### Fresh Starts

If you need to wipe the database and start clean:

- **iOS:** Delete the app from the simulator or "Erase All Content and Settings".
- **Android:** `adb shell pm clear com.jobvault.app`

---

For more advanced configuration or to learn more about Junie skills, visit the [Junie Documentation](https://junie.jetbrains.com/docs).
