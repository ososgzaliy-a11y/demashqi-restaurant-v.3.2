CREATE TABLE IF NOT EXISTS reservations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  guests INTEGER NOT NULL,
  tableId TEXT,
  status TEXT DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  items TEXT NOT NULL,
  total INTEGER NOT NULL,
  address TEXT NOT NULL,
  paymentMethod TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  phone TEXT NOT NULL DEFAULT '',
  notes TEXT DEFAULT '',
  name TEXT DEFAULT '',
  archived_at INTEGER,
  daily_id INTEGER,
  cancelled_by TEXT DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  img TEXT,
  desc_en TEXT,
  desc_ar TEXT
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_key TEXT NOT NULL,
  key TEXT UNIQUE NOT NULL,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  desc_en TEXT NOT NULL,
  desc_ar TEXT NOT NULL,
  price TEXT NOT NULL,
  img TEXT,
  weight TEXT,
  sauces TEXT,
  ingredients TEXT,
  is_popular INTEGER DEFAULT 0,
  offer_type TEXT DEFAULT 'none'
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL
);

INSERT INTO users (username, password, role) VALUES ('owner', 'owner123', 'owner');
INSERT INTO users (username, password, role) VALUES ('manager', 'manager123', 'manager');
INSERT INTO users (username, password, role) VALUES ('delivery', 'delivery123', 'delivery');
INSERT INTO users (username, password, role) VALUES ('client', 'client123', 'client');
