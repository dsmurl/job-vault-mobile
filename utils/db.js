import * as SQLite from "expo-sqlite";

let db;

export const initDatabase = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync("jobvault.db");
  }

  await db.execAsync(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      url TEXT,
      contact_name TEXT,
      notes TEXT,
      star_rating INTEGER DEFAULT 0,
      archived BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS calendar_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER,
      title TEXT NOT NULL,
      description TEXT,
      start_time DATETIME NOT NULL,
      end_time DATETIME,
      event_type TEXT DEFAULT 'other',
      selected_emoji TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE
    );
  `);

  return db;
};

export const getDb = async () => {
  if (!db) {
    await initDatabase();
  }
  return db;
};

export const companiesApi = {
  getAll: async () => {
    const database = await getDb();
    return await database.getAllAsync(
      "SELECT * FROM companies ORDER BY name ASC",
    );
  },
  getById: async (id) => {
    const database = await getDb();
    return await database.getFirstAsync(
      "SELECT * FROM companies WHERE id = ?",
      [id],
    );
  },
  create: async (company) => {
    const database = await getDb();
    const result = await database.runAsync(
      "INSERT INTO companies (name, url, contact_name, notes, star_rating, archived) VALUES (?, ?, ?, ?, ?, ?)",
      [
        company.name,
        company.url,
        company.contact_name,
        company.notes,
        company.star_rating || 0,
        company.archived ? 1 : 0,
      ],
    );
    return { id: result.lastInsertRowId, ...company };
  },
  update: async (id, companyUpdate) => {
    const database = await getDb();
    const existing = await companiesApi.getById(id);
    if (!existing) throw new Error(`Company with id ${id} not found`);

    const company = { ...existing, ...companyUpdate };

    await database.runAsync(
      "UPDATE companies SET name = ?, url = ?, contact_name = ?, notes = ?, star_rating = ?, archived = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [
        company.name,
        company.url,
        company.contact_name,
        company.notes,
        company.star_rating || 0,
        company.archived ? 1 : 0,
        id,
      ],
    );
    return { id, ...company };
  },
  delete: async (id) => {
    const database = await getDb();
    await database.runAsync("DELETE FROM companies WHERE id = ?", [id]);
    return { success: true };
  },
};

export const calendarEventsApi = {
  getAll: async () => {
    const database = await getDb();
    return await database.getAllAsync(
      "SELECT * FROM calendar_events ORDER BY start_time ASC",
    );
  },
  create: async (event) => {
    const database = await getDb();
    const result = await database.runAsync(
      "INSERT INTO calendar_events (company_id, title, description, start_time, end_time, event_type, selected_emoji) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        event.company_id,
        event.title,
        event.description,
        event.start_time,
        event.end_time,
        event.event_type,
        event.selected_emoji,
      ],
    );
    return { id: result.lastInsertRowId, ...event };
  },
  getById: async (id) => {
    const database = await getDb();
    return await database.getFirstAsync(
      "SELECT * FROM calendar_events WHERE id = ?",
      [id],
    );
  },
  update: async (id, eventUpdate) => {
    const database = await getDb();
    const existing = await calendarEventsApi.getById(id);
    if (!existing) throw new Error(`Calendar event with id ${id} not found`);

    const event = { ...existing, ...eventUpdate };

    await database.runAsync(
      "UPDATE calendar_events SET company_id = ?, title = ?, description = ?, start_time = ?, end_time = ?, event_type = ?, selected_emoji = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [
        event.company_id,
        event.title,
        event.description,
        event.start_time,
        event.end_time,
        event.event_type,
        event.selected_emoji,
        id,
      ],
    );
    return { id, ...event };
  },
  delete: async (id) => {
    const database = await getDb();
    await database.runAsync("DELETE FROM calendar_events WHERE id = ?", [id]);
    return { success: true };
  },
};
