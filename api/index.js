// Vercel serverless function for BurgerBoss API
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();

// CORS configuration for Vercel
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-app-name.vercel.app'] // Replace with your actual Vercel URL
    : ['http://localhost:3000'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secure-jwt-secret-key-for-production';

// Rate limiting
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/auth', limiter);

// Database setup for Vercel (using in-memory for demo, you'll need a proper DB service)
let db;

// Initialize database
function initDatabase() {
  // For Vercel, you should use a cloud database like PlanetScale, Supabase, or Railway
  // This is a temporary in-memory solution for demo purposes
  db = new sqlite3.Database(':memory:');
  
  // Create tables
  db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('Owner', 'Default')),
      full_name TEXT NOT NULL,
      pin TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Orders table
    db.run(`CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      items TEXT NOT NULL,
      total_amount REAL NOT NULL,
      payment_status TEXT DEFAULT 'paid',
      payment_method TEXT DEFAULT 'cash',
      status TEXT DEFAULT 'completed',
      extras TEXT,
      locked BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Menu items table
    db.run(`CREATE TABLE IF NOT EXISTS menu_items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      category TEXT NOT NULL,
      ingredients TEXT NOT NULL,
      image_url TEXT,
      active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Inventory table
    db.run(`CREATE TABLE IF NOT EXISTS inventory (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit TEXT NOT NULL,
      low_stock_threshold REAL DEFAULT 10,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Expenditures table
    db.run(`CREATE TABLE IF NOT EXISTS expenditures (
      id TEXT PRIMARY KEY,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      supplier TEXT,
      payment_status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // User activity logs table
    db.run(`CREATE TABLE IF NOT EXISTS user_activity_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      action TEXT NOT NULL,
      details TEXT,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    console.log('Database initialized successfully');
  });
}

// Initialize database on startup
initDatabase();

// Middleware functions
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// Basic API routes for testing
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'BurgerBoss API is running on Vercel!',
    timestamp: new Date().toISOString()
  });
});

// Authentication routes
app.post('/api/auth/owner-login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  db.get("SELECT * FROM users WHERE username = ? AND role = 'Owner'", [username], (err, user) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        role: user.role,
        full_name: user.full_name 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        full_name: user.full_name
      }
    });
  });
});

// Dashboard stats
app.get('/api/dashboard/stats', authenticateToken, (req, res) => {
  const today = new Date().toLocaleDateString('en-CA');
  
  db.all(`SELECT 
    SUM(total_amount) as total_sales,
    COUNT(*) as total_orders
    FROM orders WHERE payment_status = 'paid'`, [], (err, totalRows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    db.all(`SELECT 
      SUM(total_amount) as today_sales,
      COUNT(*) as today_orders
      FROM orders WHERE DATE(datetime(created_at, 'localtime')) = ? AND payment_status = 'paid'`, [today], (err, todayRows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      const totalStats = totalRows[0] || { total_sales: 0, total_orders: 0 };
      const todayStats = todayRows[0] || { today_sales: 0, today_orders: 0 };
      
      const stats = {
        total_sales: totalStats.total_sales || 0,
        total_orders: totalStats.total_orders || 0,
        today_sales: todayStats.today_sales || 0,
        today_orders: todayStats.today_orders || 0
      };
      
      res.json(stats);
    });
  });
});

// Export the Express app for Vercel
module.exports = app;