const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'demashqi.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    DELETE FROM orders
    WHERE id NOT IN (
      SELECT MIN(id)
      FROM orders
      GROUP BY daily_id
    )
    AND daily_id IS NOT NULL;
  `, function(err) {
    if (err) {
      console.error('Error cleaning up duplicates:', err.message);
    } else {
      console.log(`Cleanup complete. Deleted ${this.changes} duplicate row(s).`);
    }
    db.close();
  });
});
