const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'demashqi.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err);
  } else {
    console.log('Database connected');
    
    db.serialize(() => {
      // Enable WAL mode for better concurrency and set a busy timeout
      db.run("PRAGMA journal_mode = WAL;");
      db.run("PRAGMA busy_timeout = 5000;");

        db.run(`CREATE TABLE IF NOT EXISTS reservations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT NOT NULL,
          date TEXT NOT NULL,
          time TEXT NOT NULL,
          guests INTEGER NOT NULL,
          tableId TEXT
        )`, () => {
          // Ensure phone column exists (in case table existed before migration)
          db.run(`ALTER TABLE reservations ADD COLUMN phone TEXT NOT NULL DEFAULT ''`, (err) => {
            if (err) {
              // Ignore if column already exists
            }
          });
          // Safe migration to add tableId if it doesn't exist
          db.run(`ALTER TABLE reservations ADD COLUMN tableId TEXT;`, (err) => {
            if (err) {
              // Ignore error if column already exists (sqlite error 1 when column exists)
            } else {
              console.log('Migrated reservations table: added tableId');
            }
          });
        });
      
      db.run(`CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        items TEXT NOT NULL,
        total INTEGER NOT NULL,
        address TEXT NOT NULL,
        paymentMethod TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
    });
  }
});

module.exports = db;
