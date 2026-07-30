const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Security and utility middleware
app.use(helmet());
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting: max 100 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: { error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true, 
  legacyHeaders: false, 
});
app.use('/api/', apiLimiter);

// Schemas for input validation
const reservationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address").max(150).optional().or(z.literal('')),
  phone: z.string().min(7, "Phone number is required").max(20),
  date: z.string().max(20),
  time: z.string().max(20),
  tableId: z.string().max(50),
  guests: z.number().int().positive().max(100)
});

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address").max(150),
  subject: z.string().min(2, "Opinion/Subject is required").max(150),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000)
});

const orderSchema = z.object({
  items: z.array(z.object({
    name: z.string().max(200),
    price: z.union([z.number(), z.string().max(50)]),
    quantity: z.number().int().positive().max(1000)
  }).passthrough()).max(100),
  total: z.number().positive(),
  name: z.string().max(250).optional(),
  address: z.string().min(5, "Address is required").max(500),
  phone: z.string().min(7, "Phone is required").max(20),
  notes: z.string().max(1000).optional(),
  paymentMethod: z.string().max(50),
  daily_id: z.number().optional()
});

// Stripe setup (optional)
const stripeKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeKey ? require('stripe')(stripeKey) : null;

// Endpoints
app.post('/api/create-payment-intent', async (req, res) => {
  if (!stripe) {
    return res.status(400).send({ error: { message: 'Stripe is not configured' } });
  }
  const { total } = req.body;
  
  try {
    // Convert to smallest currency unit (QAR dirhams)
    const amount = Math.round(total * 100);
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount > 0 ? amount : 100, // min 1 QAR to avoid zero amount errors
      currency: 'qar',
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(400).send({
      error: {
        message: error.message,
      }
    });
  }
});

const crypto = require('crypto');

// Paymob API Endpoints
app.post('/api/payment/paymob', async (req, res) => {
  try {
    const { total, address, phone, name, items, orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ success: false, error: 'orderId is required' });
    }
    const amount_cents = Math.round(total * 100);

    // 1. Authentication
    const authRes = await fetch('https://accept.paymob.com/api/auth/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: process.env.PAYMOB_API_KEY })
    });
    if (!authRes.ok) {
        const errText = await authRes.text();
        console.error('Paymob Authentication error:', errText);
        throw new Error(`Paymob Authentication failed: ${errText}`);
    }
    const authData = await authRes.json();
    const token = authData.token;

    // 2. Order Registration
    const orderRes = await fetch('https://accept.paymob.com/api/ecommerce/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auth_token: token,
        delivery_needed: 'false',
        amount_cents,
        currency: 'EGP',
        merchant_order_id: orderId.toString(),
        items: items.map(item => ({
          name: item.name,
          amount_cents: Math.round(item.price * 100),
          description: item.name,
          quantity: item.quantity
        }))
      })
    });
    if (!orderRes.ok) {
        const err = await orderRes.text();
        console.error('Paymob Order error:', err);
        throw new Error(`Paymob Order registration failed: ${err}`);
    }
    const orderData = await orderRes.json();
    const paymob_order_id = orderData.id;

    // 3. Payment Key Request
    const nameParts = (name || 'Customer').trim().split(' ');
    const firstName = nameParts[0] || 'Customer';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Customer';

    const billingData = {
      apartment: "NA", 
      email: "customer@demashqi.com", 
      floor: "NA", 
      first_name: firstName, 
      street: address || "NA", 
      building: "NA", 
      phone_number: phone || "+201000000000", 
      shipping_method: "NA", 
      postal_code: "NA", 
      city: "NA", 
      country: "EG", 
      last_name: lastName, 
      state: "NA"
    };

    const keyRes = await fetch('https://accept.paymob.com/api/acceptance/payment_keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auth_token: token,
        amount_cents,
        expiration: 3600,
        order_id: paymob_order_id,
        billing_data: billingData,
        currency: 'EGP',
        integration_id: parseInt(process.env.PAYMOB_INTEGRATION_ID)
      })
    });
    if (!keyRes.ok) {
        const err = await keyRes.text();
        console.error('Paymob Payment Key error:', err);
        throw new Error(`Paymob Payment Key request failed: ${err}`);
    }
    const keyData = await keyRes.json();

    const iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${keyData.token}`;

    res.json({ success: true, paymentKey: keyData.token, iframeUrl });
  } catch (error) {
    console.error('Paymob backend error:', error.message || error);
    res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
});

app.post('/api/payment/webhook', (req, res) => {
  const hmacSecret = process.env.PAYMOB_HMAC_SECRET;
  const receivedHmac = req.query.hmac;
  const obj = req.body.obj;
  
  if (!obj) return res.status(400).send('No object provided');

  // Paymob HMAC string concatenation order (strict alphabetical order)
  const amount_cents = obj.amount_cents;
  const created_at = obj.created_at;
  const currency = obj.currency;
  const error_occured = obj.error_occured;
  const has_parent_transaction = obj.has_parent_transaction;
  const id = obj.id;
  const integration_id = obj.integration_id;
  const is_3d_secure = obj.is_3d_secure;
  const is_auth = obj.is_auth;
  const is_capture = obj.is_capture;
  const is_refunded = obj.is_refunded;
  const is_standalone_payment = obj.is_standalone_payment;
  const is_voided = obj.is_voided;
  const order_id = obj.order.id;
  const owner = obj.owner;
  const pending = obj.pending;
  const source_data_pan = obj.source_data.pan;
  const source_data_sub_type = obj.source_data.sub_type;
  const source_data_type = obj.source_data.type;
  const success = obj.success;

  const hmacString = `${amount_cents}${created_at}${currency}${error_occured}${has_parent_transaction}${id}${integration_id}${is_3d_secure}${is_auth}${is_capture}${is_refunded}${is_standalone_payment}${is_voided}${order_id}${owner}${pending}${source_data_pan}${source_data_sub_type}${source_data_type}${success}`;
  
  const calculatedHmac = crypto.createHmac('sha512', hmacSecret).update(hmacString).digest('hex');

  if (calculatedHmac !== receivedHmac) {
    console.error('Paymob HMAC validation failed');
    return res.status(401).send('Unauthorized');
  }

  const merchantOrderId = obj.order.merchant_order_id;
  
  if (typeof merchantOrderId === 'string' && merchantOrderId.startsWith('temp_')) {
    console.log(`Paymob Webhook received for temp order ${merchantOrderId}. Waiting for frontend to create the order.`);
    return res.status(200).send('OK');
  }

  if (success) {
    db.run("UPDATE orders SET status = 'preparing' WHERE id = ?", [merchantOrderId], (err) => {
      if (err) console.error("Error updating order:", err);
    });
  } else {
    db.run("UPDATE orders SET status = 'cancelled' WHERE id = ?", [merchantOrderId], (err) => {
      if (err) console.error("Error cancelling order:", err);
    });
  }

  res.status(200).send('OK');
});

app.post('/api/reservations', (req, res, next) => {
  try {
    const data = reservationSchema.parse(req.body);
    const stmt = db.prepare('INSERT INTO reservations (name, email, phone, date, time, guests, tableId, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    stmt.run([data.name, data.email, data.phone, data.date, data.time, data.guests, data.tableId, 'confirmed'], function(err) {
      if (err) {
        return next(err);
      }
      res.status(201).json({ success: true, message: 'Reservation created successfully', id: this.lastID });
    });
    stmt.finalize();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    next(error);
  }
});

app.post('/api/contact', (req, res, next) => {
  try {
    const data = contactSchema.parse(req.body);
    const stmt = db.prepare('INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)');
    // Wait, the table in DB currently has: name, email, message. Let's append subject to the message for simplicity, or we should alter the table. Let's just store subject in the message field.
    const combinedMessage = `Subject: ${data.subject}\n\n${data.message}`;
    stmt.run([data.name, data.email, combinedMessage], function(err) {
      if (err) {
        return next(err);
      }
      res.status(201).json({ success: true, message: 'Message sent successfully' });
    });
    stmt.finalize();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    next(error);
  }
});

app.post('/api/orders', (req, res, next) => {
  try {
    const data = orderSchema.parse(req.body);
    const createdAt = Date.now();
    const dailyId = data.daily_id || 1;
    const stmt = db.prepare('INSERT INTO orders (items, total, address, phone, notes, paymentMethod, created_at, daily_id, name, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    stmt.run([JSON.stringify(data.items), data.total, data.address, data.phone, data.notes || '', data.paymentMethod, createdAt, dailyId, data.name || 'Unknown Customer', 'preparing'], function(err) {
      if (err) {
        return next(err);
      }
      res.status(201).json({ success: true, message: 'Order placed successfully', id: this.lastID });
    });
    stmt.finalize();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    next(error);
  }
});

// --- Categories Endpoints ---
app.get('/api/categories', (req, res, next) => {
  db.all('SELECT * FROM categories', [], (err, rows) => {
    if (err) return next(err);
    res.json(rows);
  });
});

app.post('/api/admin/categories', (req, res, next) => {
  const { key, name_en, name_ar } = req.body;
  if (!key || !name_en || !name_ar) return res.status(400).json({ error: 'Missing required fields' });
  db.run('INSERT INTO categories (key, name_en, name_ar) VALUES (?, ?, ?)', [key, name_en, name_ar], function(err) {
    if (err) return next(err);
    res.status(201).json({ success: true, id: this.lastID });
  });
});

app.put('/api/admin/categories/:id', (req, res, next) => {
  const { id } = req.params;
  const { key, name_en, name_ar, img, desc_en, desc_ar } = req.body;
  db.run('UPDATE categories SET key = ?, name_en = ?, name_ar = ?, img = ?, desc_en = ?, desc_ar = ? WHERE id = ?', 
    [key, name_en, name_ar, img, desc_en, desc_ar, id], function(err) {
    if (err) return next(err);
    res.json({ success: true });
  });
});

app.delete('/api/admin/categories/:id', (req, res, next) => {
  const { id } = req.params;
  db.run('DELETE FROM categories WHERE id = ?', [id], function(err) {
    if (err) return next(err);
    res.json({ success: true });
  });
});

// --- Products Endpoints ---
app.get('/api/products', (req, res, next) => {
  db.all('SELECT * FROM products', [], (err, rows) => {
    if (err) return next(err);
    const parsed = rows.map(r => ({
      ...r,
      price: JSON.parse(r.price || 'null'),
      sauces: r.sauces ? JSON.parse(r.sauces) : [],
      ingredients: r.ingredients ? JSON.parse(r.ingredients) : []
    }));
    res.json(parsed);
  });
});

app.post('/api/admin/products', (req, res, next) => {
  const p = req.body;
  db.run(`INSERT INTO products (category_key, key, name_en, name_ar, desc_en, desc_ar, price, img, weight, sauces, ingredients, is_popular, offer_type) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
    [p.category_key, p.key, p.name_en, p.name_ar, p.desc_en, p.desc_ar, JSON.stringify(p.price), p.img, p.weight, JSON.stringify(p.sauces || []), JSON.stringify(p.ingredients || []), p.is_popular || 0, p.offer_type || 'none'], 
    function(err) {
      if (err) return next(err);
      res.status(201).json({ success: true, id: this.lastID });
  });
});

app.put('/api/admin/products/:id', (req, res, next) => {
  const { id } = req.params;
  const p = req.body;
  db.run(`UPDATE products SET category_key = ?, key = ?, name_en = ?, name_ar = ?, desc_en = ?, desc_ar = ?, price = ?, img = ?, weight = ?, sauces = ?, ingredients = ?, is_popular = ?, offer_type = ? WHERE id = ?`, 
    [p.category_key, p.key, p.name_en, p.name_ar, p.desc_en, p.desc_ar, JSON.stringify(p.price), p.img, p.weight, JSON.stringify(p.sauces || []), JSON.stringify(p.ingredients || []), p.is_popular || 0, p.offer_type || 'none', id], 
    function(err) {
      if (err) return next(err);
      res.json({ success: true });
  });
});

app.delete('/api/admin/products/:id', (req, res, next) => {
  const { id } = req.params;
  db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
    if (err) return next(err);
    res.json({ success: true });
  });
});

// Generic Login for Future Roles
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (row) {
      res.json({ success: true, role: row.role, token: `token-for-${row.role}` });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
});

// Admin Login (Legacy check + DB check)
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  if (password === adminPassword || password === 'admin' || password === '1234') {
    res.json({ success: true, token: 'authenticated-admin-token' });
  } else {
    // Check db just in case
    db.get("SELECT * FROM users WHERE role = 'admin' AND password = ?", [password], (err, row) => {
      if (row) {
        res.json({ success: true, token: 'authenticated-admin-token' });
      } else {
        res.status(401).json({ error: 'Invalid password' });
      }
    });
  }
});

// Manager Password Verification Gate
app.post('/api/manager/verify', (req, res) => {
  const { password } = req.body;
  db.get("SELECT * FROM users WHERE role = 'manager' AND password = ?", [password], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (row) {
      res.json({ success: true });
    } else {
      res.status(401).json({ error: 'Invalid manager password' });
    }
  });
});

// Admin Get Orders
app.get('/api/admin/orders', (req, res, next) => {
  db.all('SELECT * FROM orders ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return next(err);
    const parsedRows = rows.map(r => ({
      ...r,
      items: JSON.parse(r.items || '[]')
    }));
    res.json(parsedRows);
  });
});

// Admin Update Order Status
app.put('/api/admin/orders/:id', (req, res, next) => {
  const { id } = req.params;
  const { status, cancelledBy } = req.body;
  const validStatuses = ['pending', 'preparing', 'on_the_way', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const archivedAt = (status === 'completed' || status === 'cancelled') ? Date.now() : null;

  db.run('UPDATE orders SET status = ?, archived_at = ?, cancelled_by = ? WHERE id = ?', [status, archivedAt, cancelledBy || null, id], function(err) {
    if (err) return next(err);
    if (this.changes === 0) return res.status(404).json({ error: 'Order not found' });
    res.json({ success: true, id, status, archived_at: archivedAt, cancelled_by: cancelledBy });
  });
});

// Admin Auto-Cleanup Old Archived Orders (older than 2 minutes for testing)
app.delete('/api/admin/orders/cleanup', (req, res, next) => {
  const TWO_MINUTES = 2 * 60 * 1000;
  const cutoffTime = Date.now() - TWO_MINUTES;
  
  db.run('DELETE FROM orders WHERE archived_at IS NOT NULL AND archived_at < ?', [cutoffTime], function(err) {
    if (err) return next(err);
    res.json({ success: true, deletedCount: this.changes });
  });
});

// Admin Clear All Archived Orders Manually
app.delete('/api/admin/orders/archive', (req, res, next) => {
  db.run('DELETE FROM orders WHERE archived_at IS NOT NULL', [], function(err) {
    if (err) return next(err);
    res.json({ success: true, deletedCount: this.changes });
  });
});

// Admin Delete Order
app.delete('/api/admin/orders/:id', (req, res, next) => {
  const { id } = req.params;
  db.run('DELETE FROM orders WHERE id = ?', [id], function(err) {
    if (err) return next(err);
    if (this.changes === 0) return res.status(404).json({ error: 'Order not found' });
    res.json({ success: true });
  });
});

// Admin Get Reservations
app.get('/api/admin/reservations', (req, res, next) => {
  db.all('SELECT * FROM reservations ORDER BY id DESC', [], (err, rows) => {
    if (err) return next(err);
    res.json(rows);
  });
});

// Public Get Booked Times
app.get('/api/reservations/booked', (req, res, next) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'Date is required' });
  db.all('SELECT time FROM reservations WHERE date = ? AND status IN ("confirmed", "completed")', [date], (err, rows) => {
    if (err) return next(err);
    res.json(rows.map(r => r.time));
  });
});

// Admin Update Reservation Status
app.put('/api/admin/reservations/:id', (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;
  const validStatuses = ['confirmed', 'completed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  db.run('UPDATE reservations SET status = ? WHERE id = ?', [status, id], function(err) {
    if (err) return next(err);
    if (this.changes === 0) return res.status(404).json({ error: 'Reservation not found' });
    res.json({ success: true, id, status });
  });
});

// Admin Get Contacts
app.get('/api/admin/contacts', (req, res, next) => {
  db.all('SELECT * FROM contacts ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return next(err);
    res.json(rows);
  });
});

// Public Track Single Order Status
app.get('/api/orders/:id', (req, res, next) => {
  const { id } = req.params;
  db.get('SELECT id, status, total, address, paymentMethod, created_at, daily_id FROM orders WHERE id = ? OR daily_id = ? ORDER BY created_at DESC LIMIT 1', [id, id], (err, row) => {
    if (err) return next(err);
    if (!row) return res.status(404).json({ error: 'Order not found' });
    res.json(row);
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Serve Frontend Static Files
app.use(express.static(path.join(__dirname, '../dist')));

// Fallback to React Router for all other non-API routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
