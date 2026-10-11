
const Database = require("better-sqlite3");
const path = require("path");

// Create the database file inside the Backend folder.
const dbPath = path.join(__dirname, "civicx.db");
const db = new Database(dbPath);

// Enable safer database settings.
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Create the required tables.
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE COLLATE NOCASE,
        date_of_birth TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'citizen',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS complaints (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        complaint_id TEXT NOT NULL UNIQUE,
        user_id INTEGER,
        project_id TEXT NOT NULL,
        problem_type TEXT NOT NULL,
        location TEXT NOT NULL,
        description TEXT NOT NULL,
        photo_name TEXT,
        status TEXT NOT NULL DEFAULT 'Awaiting Verification',
        submitted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
`);
// Add the role column to existing databases if needed.
const userColumns = db.prepare("PRAGMA table_info(users)").all();

if (!userColumns.some(column => column.name === "role")) {
    db.exec(`
        ALTER TABLE users
        ADD COLUMN role TEXT NOT NULL DEFAULT 'citizen'
    `);
}

console.log("CivicX database initialized successfully.");

module.exports = db;
