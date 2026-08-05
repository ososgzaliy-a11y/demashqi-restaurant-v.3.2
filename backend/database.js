const path = require('path');
let sqlite3;
try {
  sqlite3 = require('sqlite3').verbose();
} catch (e) {
  // Ignored in Cloudflare Workers
}

let dbInstance = null;
let localDb = null;

const db = {
  serialize: (cb) => { if (cb) cb(); },
  run: function(sql, params, callback) {
    if (typeof params === 'function') { callback = params; params = []; }
    if (dbInstance) {
      // Cloudflare D1 flow
      dbInstance.prepare(sql).bind(...(params || [])).run().then(res => {
        if (callback) callback.call({ changes: res.meta?.changes, lastID: res.meta?.last_row_id }, null);
      }).catch(err => { if (callback) callback(err); });
    } else if (localDb) {
      // Local SQLite flow
      localDb.run(sql, params, function(err) {
        if (callback) callback.call(this, err);
      });
    }
    return this;
  },
  all: function(sql, params, callback) {
    if (typeof params === 'function') { callback = params; params = []; }
    if (dbInstance) {
      dbInstance.prepare(sql).bind(...(params || [])).all().then(res => {
        if (callback) callback(null, res.results);
      }).catch(err => { if (callback) callback(err, []); });
    } else if (localDb) {
      localDb.all(sql, params, callback);
    }
    return this;
  },
  get: function(sql, params, callback) {
    if (typeof params === 'function') { callback = params; params = []; }
    if (dbInstance) {
      dbInstance.prepare(sql).bind(...(params || [])).first().then(res => {
        if (callback) callback(null, res);
      }).catch(err => { if (callback) callback(err, null); });
    } else if (localDb) {
      localDb.get(sql, params, callback);
    }
    return this;
  },
  prepare: function(sql) {
    if (dbInstance) {
      return {
        run: (params, cb) => db.run(sql, params, cb),
        get: (params, cb) => db.get(sql, params, cb),
        all: (params, cb) => db.all(sql, params, cb),
        finalize: () => {}
      };
    } else if (localDb) {
      return localDb.prepare(sql);
    }
    return { run:()=>{}, get:()=>{}, all:()=>{}, finalize:()=>{} };
  },
  bindD1: (envDb) => { dbInstance = envDb; }
};

if (sqlite3 && process.env.NODE_ENV !== 'cloudflare') {
  const dbPath = typeof __dirname !== 'undefined' ? path.resolve(__dirname, 'demashqi.db') : 'demashqi.db';
  localDb = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Error opening local database', err);
    else {
      console.log('Local SQLite Database connected');
      // Initialize local tables...
      localDb.serialize(() => {
        localDb.run("PRAGMA journal_mode = WAL;");
        localDb.run("PRAGMA busy_timeout = 5000;");
      });
    }
  });
}

module.exports = db;
