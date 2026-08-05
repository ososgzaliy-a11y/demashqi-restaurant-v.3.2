const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('demashqi.db');
db.run("UPDATE users SET role='owner', username='owner' WHERE role='admin'", (err) => {
  if (err) console.error(err);
  else console.log('Successfully migrated admin to owner');
  db.close();
});
