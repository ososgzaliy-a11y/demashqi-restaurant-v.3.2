const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');
db.run("UPDATE users SET role='owner', username='owner' WHERE role='admin' OR role='owner'", (err) => {
  if (err) console.error(err);
  else console.log('Updated user role to owner');
  db.close();
});
