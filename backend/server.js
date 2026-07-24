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
app.use(express.json());

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
  address: z.string().min(5, "Address is required").max(500),
  paymentMethod: z.string().max(50)
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

app.post('/api/reservations', (req, res, next) => {
  try {
    const data = reservationSchema.parse(req.body);
    const stmt = db.prepare('INSERT INTO reservations (name, email, phone, date, time, guests, tableId) VALUES (?, ?, ?, ?, ?, ?, ?)');
    stmt.run([data.name, data.email, data.phone, data.date, data.time, data.guests, data.tableId], function(err) {
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
    const stmt = db.prepare('INSERT INTO orders (items, total, address, paymentMethod) VALUES (?, ?, ?, ?)');
    stmt.run([JSON.stringify(data.items), data.total, data.address, data.paymentMethod], function(err) {
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

// Admin Login
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD || 'miralevishipkits';
  if (password === adminPassword) {
    res.json({ success: true, token: 'authenticated-admin-token' });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
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
  const { status } = req.body;
  const validStatuses = ['pending', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  db.run('UPDATE orders SET status = ? WHERE id = ?', [status, id], function(err) {
    if (err) return next(err);
    if (this.changes === 0) return res.status(404).json({ error: 'Order not found' });
    res.json({ success: true, id, status });
  });
});

// Admin Get Reservations
app.get('/api/admin/reservations', (req, res, next) => {
  db.all('SELECT * FROM reservations ORDER BY id DESC', [], (err, rows) => {
    if (err) return next(err);
    res.json(rows);
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
  db.get('SELECT id, status, total, address, paymentMethod, created_at FROM orders WHERE id = ?', [id], (err, row) => {
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

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
