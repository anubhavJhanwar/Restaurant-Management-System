const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
// app.use(express.static(path.join(__dirname, 'client/build')));

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'burgerboss_secret_key_2024';

// Restore menu items endpoint
app.post('/api/restore-menu', (req, res) => {
  const defaultMenuItems = [
    {
      id: '1',
      name: 'Aloo Tikki Burger',
      price: 89,
      category: 'Burgers',
      ingredients: JSON.stringify(['Aloo Tikki Patty', 'Bun', 'Lettuce', 'Tomato', 'Onion', 'Mayo']),
      active: 1
    },
    {
      id: '2', 
      name: 'Paneer Burger',
      price: 109,
      category: 'Burgers',
      ingredients: JSON.stringify(['Paneer Patty', 'Bun', 'Lettuce', 'Tomato', 'Onion', 'Mayo']),
      active: 1
    },
    {
      id: '3',
      name: 'Veg Burger',
      price: 79,
      category: 'Burgers', 
      ingredients: JSON.stringify(['Veg Patty', 'Bun', 'Lettuce', 'Tomato', 'Onion', 'Mayo']),
      active: 1
    },
    {
      id: '4',
      name: 'Cheese Burger',
      price: 99,
      category: 'Burgers',
      ingredients: JSON.stringify(['Veg Patty', 'Cheese Slice', 'Bun', 'Lettuce', 'Tomato', 'Mayo']),
      active: 1
    },
    {
      id: '5',
      name: 'Double Cheese Burger',
      price: 129,
      category: 'Burgers',
      ingredients: JSON.stringify(['Veg Patty', 'Double Cheese Slice', 'Bun', 'Lettuce', 'Tomato', 'Mayo']),
      active: 1
    },
    {
      id: '6',
      name: 'French Fries',
      price: 59,
      category: 'Sides',
      ingredients: JSON.stringify(['Potato Fries', 'Salt', 'Oil']),
      active: 1
    },
    {
      id: '7',
      name: 'Peri Peri Fries',
      price: 79,
      category: 'Sides',
      ingredients: JSON.stringify(['Potato Fries', 'Peri Peri Seasoning', 'Salt', 'Oil']),
      active: 1
    },
    {
      id: '8',
      name: 'Cold Coffee',
      price: 69,
      category: 'Beverages',
      ingredients: JSON.stringify(['Coffee', 'Milk', 'Sugar', 'Ice']),
      active: 1
    },
    {
      id: '9',
      name: 'Masala Chai',
      price: 29,
      category: 'Beverages',
      ingredients: JSON.stringify(['Tea Leaves', 'Milk', 'Sugar', 'Spices']),
      active: 1
    },
    {
      id: '10',
      name: 'Coke',
      price: 39,
      category: 'Beverages',
      ingredients: JSON.stringify(['Coca Cola']),
      active: 1
    }
  ];

  // Insert menu items
  const insertPromises = defaultMenuItems.map(item => {
    return new Promise((resolve, reject) => {
      db.run(`INSERT OR REPLACE INTO menu_items (id, name, price, category, ingredients, active, created_at) 
              VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
              [item.id, item.name, item.price, item.category, item.ingredients, item.active], 
              function(err) {
                if (err) reject(err);
                else resolve();
              });
    });
  });

  Promise.all(insertPromises)
    .then(() => {
      console.log('Menu items restored successfully');
      res.json({ message: 'Menu items restored successfully' });
    })
    .catch(err => {
      console.error('Error restoring menu items:', err);
      res.status(500).json({ error: 'Failed to restore menu items' });
    });
});

// Restore inventory endpoint
app.post('/api/restore-inventory', (req, res) => {
  const defaultInventory = [
    { id: '1', name: 'Aloo Patty', quantity: 50, unit: 'pieces' },
    { id: '2', name: 'Paneer Patty', quantity: 30, unit: 'pieces' },
    { id: '3', name: 'Veg Patty', quantity: 40, unit: 'pieces' },
    { id: '4', name: 'Cheese Slices', quantity: 100, unit: 'pieces' },
    { id: '5', name: 'Buns', quantity: 80, unit: 'pieces' },
    { id: '6', name: 'Lettuce', quantity: 5, unit: 'kg' },
    { id: '7', name: 'Tomato', quantity: 8, unit: 'kg' },
    { id: '8', name: 'Onion', quantity: 10, unit: 'kg' },
    { id: '9', name: 'Mayo', quantity: 3, unit: 'bottles' },
    { id: '10', name: 'Potato Fries', quantity: 15, unit: 'kg' },
    { id: '11', name: 'Peri Peri Seasoning', quantity: 2, unit: 'packets' },
    { id: '12', name: 'Coffee', quantity: 1, unit: 'kg' },
    { id: '13', name: 'Milk', quantity: 10, unit: 'liters' },
    { id: '14', name: 'Sugar', quantity: 5, unit: 'kg' },
    { id: '15', name: 'Tea Leaves', quantity: 500, unit: 'grams' },
    { id: '16', name: 'Coca Cola', quantity: 24, unit: 'bottles' }
  ];

  // Insert inventory items
  const insertPromises = defaultInventory.map(item => {
    return new Promise((resolve, reject) => {
      db.run(`INSERT OR REPLACE INTO inventory (id, name, quantity, unit, created_at) 
              VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
              [item.id, item.name, item.quantity, item.unit], 
              function(err) {
                if (err) reject(err);
                else resolve();
              });
    });
  });

  Promise.all(insertPromises)
    .then(() => {
      console.log('Inventory restored successfully');
      res.json({ message: 'Inventory restored successfully' });
    })
    .catch(err => {
      console.error('Error restoring inventory:', err);
      res.status(500).json({ error: 'Failed to restore inventory' });
    });
});

// Debug endpoint to check users
app.get('/api/debug/check-users', (req, res) => {
  db.all(`SELECT id, username, role, email FROM users ORDER BY created_at DESC`, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ users: rows });
  });
});

// Test default login endpoint
app.post('/api/debug/test-default-login', (req, res) => {
  const { username, password } = req.body;
  
  db.get("SELECT * FROM users WHERE username = ? AND role = 'Default'", [username], (err, user) => {
    if (err) {
      return res.json({ error: 'Database error', details: err.message });
    }
    
    if (!user) {
      return res.json({ error: 'User not found', username: username });
    }
    
    const passwordMatch = bcrypt.compareSync(password, user.password);
    
    res.json({
      userFound: true,
      username: user.username,
      role: user.role,
      passwordMatch: passwordMatch,
      providedPassword: password
    });
  });
});

// Debug endpoint to check user PINs
app.get('/api/debug/check-pins', (req, res) => {
  db.all(`SELECT username, role, pin FROM users WHERE role = 'Owner'`, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    const users = rows.map(user => ({
      username: user.username,
      role: user.role,
      hasPin: user.pin ? true : false,
      pinLength: user.pin ? user.pin.length : 0
    }));
    
    res.json({ users });
  });
});

// Fix database constraint to allow Default role
function fixDatabaseConstraint() {
  // Check if we need to migrate by trying to insert a test Default user
  db.run(`CREATE TABLE IF NOT EXISTS users_fixed (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('Owner', 'Default')),
    full_name TEXT NOT NULL,
    pin TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Error creating fixed users table:', err);
      return;
    }
    
    // Copy existing data to new table
    db.run(`INSERT INTO users_fixed (id, username, email, password, role, full_name, pin, created_at)
            SELECT id, username, email, password, role, full_name, pin, created_at 
            FROM users WHERE role IN ('Owner', 'Default')`, (err) => {
      if (err) {
        console.log('No existing users to migrate or migration not needed');
      }
      
      // Drop old table and rename new one
      db.run(`DROP TABLE IF EXISTS users`, (err) => {
        if (err) {
          console.error('Error dropping old users table:', err);
          return;
        }
        
        db.run(`ALTER TABLE users_fixed RENAME TO users`, (err) => {
          if (err) {
            console.error('Error renaming table:', err);
          } else {
            console.log('Database constraint fixed - Default role now allowed');
          }
        });
      });
    });
  });
}

// Rate limiting for auth endpoints (increased limits for development)
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: 'Too many authentication attempts, please try again later.'
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Serve uploaded images
app.use('/uploads', express.static(uploadsDir));

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Initialize SQLite Database
const db = new sqlite3.Database('./restaurant.db');

// Create tables
db.serialize(() => {
  // Users table for authentication
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('Owner', 'Default')),
    full_name TEXT NOT NULL,
    pin TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME
  )`);

  // Add pin column if it doesn't exist (for existing databases)
  db.run(`ALTER TABLE users ADD COLUMN pin TEXT`, (err) => {
    // Ignore error if column already exists
  });

  // Fix database constraint to allow Default role
  fixDatabaseConstraint();

  // Restaurant settings table
  db.run(`CREATE TABLE IF NOT EXISTS restaurant_settings (
    id INTEGER PRIMARY KEY,
    owner_pin TEXT NOT NULL,
    restaurant_name TEXT DEFAULT 'BurgerBoss',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
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

  // Check if image_url column exists, add if it doesn't
  db.all("PRAGMA table_info(menu_items)", (err, columns) => {
    if (err) {
      console.error('Error checking table schema:', err.message);
      return;
    }
    
    const hasImageUrl = columns.some(col => col.name === 'image_url');
    if (!hasImageUrl) {
      db.run(`ALTER TABLE menu_items ADD COLUMN image_url TEXT`, (alterErr) => {
        if (alterErr) {
          console.error('Error adding image_url column:', alterErr.message);
        } else {
          console.log('✅ Added image_url column to menu_items table');
        }
      });
    } else {
      console.log('✅ image_url column already exists in menu_items table');
    }
  });

  // Inventory table
  db.run(`CREATE TABLE IF NOT EXISTS inventory (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    quantity REAL NOT NULL,
    unit TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Orders table
  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    items TEXT NOT NULL,
    extras TEXT DEFAULT '[]',
    total_amount REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    payment_status TEXT DEFAULT 'unpaid',
    payment_method TEXT DEFAULT 'cash' CHECK(payment_method IN ('cash', 'online', 'cash+online')),
    is_locked BOOLEAN DEFAULT 0,
    locked_by TEXT,
    locked_at DATETIME,
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Add extras column if it doesn't exist (for existing databases)
  db.run(`ALTER TABLE orders ADD COLUMN extras TEXT DEFAULT '[]'`, (err) => {
    // Ignore error if column already exists
  });

  // Add payment_method column if it doesn't exist (for existing databases)
  db.run(`ALTER TABLE orders ADD COLUMN payment_method TEXT DEFAULT 'cash'`, (err) => {
    // Ignore error if column already exists
  });

  // Add other missing columns
  db.run(`ALTER TABLE orders ADD COLUMN status TEXT DEFAULT 'pending'`, (err) => {});
  db.run(`ALTER TABLE orders ADD COLUMN payment_status TEXT DEFAULT 'unpaid'`, (err) => {});
  db.run(`ALTER TABLE orders ADD COLUMN is_locked BOOLEAN DEFAULT 0`, (err) => {});
  db.run(`ALTER TABLE orders ADD COLUMN locked_by TEXT`, (err) => {});
  db.run(`ALTER TABLE orders ADD COLUMN locked_at DATETIME`, (err) => {});
  db.run(`ALTER TABLE orders ADD COLUMN created_by TEXT`, (err) => {});

  // Sales analytics table
  db.run(`CREATE TABLE IF NOT EXISTS sales_analytics (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    hour INTEGER NOT NULL,
    gross_sales REAL DEFAULT 0,
    net_sales REAL DEFAULT 0,
    profit REAL DEFAULT 0,
    transactions INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Expenditures table
  db.run(`CREATE TABLE IF NOT EXISTS expenditures (
    id TEXT PRIMARY KEY,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    payment_status TEXT DEFAULT 'unpaid',
    payment_method TEXT DEFAULT 'cash' CHECK(payment_method IN ('cash', 'online', 'cash+online')),
    supplier TEXT,
    is_locked BOOLEAN DEFAULT 0,
    locked_by TEXT,
    locked_at DATETIME,
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Menu extras table (for add-ons like extra cheese, extra patty)
  db.run(`CREATE TABLE IF NOT EXISTS menu_extras (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    category TEXT NOT NULL,
    active BOOLEAN DEFAULT 1,
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

  // PIN operations log table
  db.run(`CREATE TABLE IF NOT EXISTS pin_operations_log (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    operation_type TEXT NOT NULL,
    target_id TEXT,
    target_type TEXT,
    details TEXT,
    ip_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // No default accounts - users must create their own accounts

  // Initialize default menu extras
  db.get("SELECT COUNT(*) as count FROM menu_extras", (err, row) => {
    if (!err && row.count === 0) {
      const defaultExtras = [
        { id: uuidv4(), name: 'Extra Cheese Slice', price: 15, category: 'Cheese' },
        { id: uuidv4(), name: 'Extra Beef Patty', price: 50, category: 'Patty' },
        { id: uuidv4(), name: 'Extra Chicken Patty', price: 45, category: 'Patty' },
        { id: uuidv4(), name: 'Extra Bacon', price: 25, category: 'Meat' },
        { id: uuidv4(), name: 'Extra Lettuce', price: 5, category: 'Vegetable' },
        { id: uuidv4(), name: 'Extra Tomato', price: 8, category: 'Vegetable' },
        { id: uuidv4(), name: 'Extra Onion', price: 5, category: 'Vegetable' }
      ];
      
      defaultExtras.forEach(extra => {
        db.run(`INSERT INTO menu_extras (id, name, price, category) VALUES (?, ?, ?, ?)`,
               [extra.id, extra.name, extra.price, extra.category]);
      });
      
      console.log('Default menu extras initialized');
    }
  });
  

});



// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  // Handle JWT tokens for both staff and owners
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Role-based authorization middleware
const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// PIN verification middleware with logging
const verifyOwnerPin = async (req, res, next) => {
  const { pin } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;
  
  console.log('PIN Verification Request:', {
    userId: req.user?.id,
    username: req.user?.username,
    role: req.user?.role,
    pinReceived: pin,
    pinLength: pin?.length
  });
  
  if (!pin) {
    return res.status(400).json({ error: 'PIN required' });
  }

  // For Staff users (id 999), only Owner PINs work
  if (req.user && req.user.role === 'Staff') {
    db.all("SELECT id, pin FROM users WHERE role = 'Owner'", (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to verify PIN' });
      }
      
      let pinMatched = false;
      for (const row of rows) {
        if (bcrypt.compareSync(pin, row.pin)) {
          pinMatched = true;
          logPinOperation(req.user.id, 'PIN_VERIFICATION_SUCCESS', null, null, 
                        `Staff used Owner PIN from ${ipAddress}`, ipAddress);
          break;
        }
      }
      
      if (pinMatched) {
        console.log('Staff PIN verification SUCCESS using Owner PIN');
        return next();
      } else {
        console.log('Staff PIN verification FAILED - invalid Owner PIN');
        logPinOperation(req.user.id, 'PIN_VERIFICATION_FAILED', null, null, 
                      `Staff failed PIN attempt from ${ipAddress}`, ipAddress);
        return res.status(403).json({ error: 'Invalid PIN. Only Owner PIN works for staff operations.' });
      }
    });
  }
  // For Owner users, check their own PIN
  else if (req.user && req.user.role === 'Owner') {
    db.get("SELECT pin FROM users WHERE id = ?", [req.user.id], (err, userRow) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to verify PIN' });
      }
      
      if (userRow && bcrypt.compareSync(pin, userRow.pin)) {
        console.log('Owner PIN verification SUCCESS');
        logPinOperation(req.user.id, 'PIN_VERIFICATION_SUCCESS', null, null, 
                      `Owner PIN verification from ${ipAddress}`, ipAddress);
        return next();
      } else {
        console.log('Owner PIN verification FAILED');
        logPinOperation(req.user.id, 'PIN_VERIFICATION_FAILED', null, null, 
                      `Owner failed PIN attempt from ${ipAddress}`, ipAddress);
        return res.status(403).json({ error: 'Invalid Owner PIN.' });
      }
    });
  } else {
    return res.status(403).json({ error: 'Access denied' });
  }
};

// Generate custom order ID
function generateOrderId() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  
  // Get today's order count
  const today = now.toLocaleDateString('en-CA'); // YYYY-MM-DD format in local time
  
  return new Promise((resolve, reject) => {
    db.get(`SELECT COUNT(*) as count FROM orders WHERE DATE(datetime(created_at, 'localtime')) = ?`, [today], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      
      const orderNumber = String((row.count || 0) + 1).padStart(2, '0');
      const orderId = `BB${day}${month}${orderNumber}`;
      resolve(orderId);
    });
  });
}

// Helper function to log user activity
const logUserActivity = (userId, action, details = null, ipAddress = null) => {
  const logId = uuidv4();
  db.run(`INSERT INTO user_activity_logs (id, user_id, action, details, ip_address) 
          VALUES (?, ?, ?, ?, ?)`,
          [logId, userId, action, details, ipAddress]);
};

// Helper function to log PIN operations
const logPinOperation = (userId, operationType, targetId = null, targetType = null, details = null, ipAddress = null) => {
  const logId = uuidv4();
  db.run(`INSERT INTO pin_operations_log (id, user_id, operation_type, target_id, target_type, details, ip_address) 
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [logId, userId, operationType, targetId, targetType, details, ipAddress]);
};

// Authentication Routes
// Default account login endpoint
app.post('/api/auth/default-login', authLimiter, (req, res) => {
  const { username, password } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;

  console.log('Default account login attempt:', { username, ipAddress });

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  // Default account login - check database for default accounts
  db.get("SELECT * FROM users WHERE username = ? AND role = 'Default'", [username], (err, user) => {
    if (err) {
      console.error('Database error during default login:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    console.log('Debug - User found:', user ? 'Yes' : 'No');
    if (user) {
      console.log('Debug - Username match:', user.username === username);
      console.log('Debug - Password check:', bcrypt.compareSync(password, user.password));
    }

    if (!user || !bcrypt.compareSync(password, user.password)) {
      console.log('Invalid default account login attempt:', username);
      return res.status(401).json({ error: 'Invalid default account credentials' });
    }

    // Log activity
    logUserActivity(user.id, 'LOGIN', `Default account logged in from ${ipAddress}`, ipAddress);

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

    console.log('Successful default account login:', user.username);
    res.json({
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

// Owner login endpoint
app.post('/api/auth/owner-login', authLimiter, (req, res) => {
  const { username, password } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;

  console.log('Owner login attempt:', { username, ipAddress });

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  // Owner logini - check database
  db.get("SELECT * FROM users WHERE username = ? AND role = 'Owner'", [username], (err, user) => {
    if (err) {
      console.error('Database error during owner login:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user || !bcrypt.compareSync(password, user.password)) {
      console.log('Invalid owner login attempt:', username);
      return res.status(401).json({ error: 'Invalid owner credentials' });
    }

    // Log activity
    logUserActivity(user.id, 'LOGIN', `Owner logged in from ${ipAddress}`, ipAddress);

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

    console.log('Successful owner login:', user.username);
    res.json({
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

// Owner signup endpoint
app.post('/api/auth/signup-owner', (req, res) => {
  const { username, email, password, pin } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;

  console.log('Owner signup attempt:', { username, email });

  if (!username || !email || !password || !pin) {
    return res.status(400).json({ error: 'All fields required' });
  }

  if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
    return res.status(400).json({ error: 'PIN must be exactly 4 digits' });
  }

  // Check current owner count limit (max 3)
  db.get(`SELECT COUNT(*) as count FROM users WHERE role = 'Owner'`, (err, row) => {
    if (err) {
      console.error('Error checking owner count:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (row.count >= 3) {
      return res.status(400).json({ error: 'Maximum 3 owner accounts allowed. Limit reached.' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const hashedPin = bcrypt.hashSync(pin, 10);
    const userId = uuidv4();

    db.run(`INSERT INTO users (id, username, email, password, role, full_name, pin) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [userId, username, email, hashedPassword, 'Owner', username, hashedPin], function(err) {
      if (err) {
        console.error('Error creating owner:', err);
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Username or email already exists' });
        }
        return res.status(500).json({ error: 'Failed to create owner account' });
      }

      // Log the signup
      logUserActivity(userId, 'SIGNUP', `Owner signed up from ${ipAddress}`, ipAddress);

      // Auto-login after signup
      const token = jwt.sign(
        { 
          id: userId, 
          username: username, 
          role: 'Owner',
          full_name: username 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      console.log('Owner created successfully:', username);
      res.json({ 
        message: 'Owner account created successfully',
        token,
        user: {
          id: userId,
          username: username,
          email: email,
          role: 'Owner',
          full_name: username
        }
      });
    });
  });
});

// Default account signup endpoint
app.post('/api/auth/signup-default', (req, res) => {
  const { username, password } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;

  console.log('Default account signup attempt:', { username });

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  // Check current default account count limit (max 2)
  db.get(`SELECT COUNT(*) as count FROM users WHERE role = 'Default'`, (err, row) => {
    if (err) {
      console.error('Error checking default account count:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (row.count >= 2) {
      return res.status(400).json({ error: 'Maximum 2 default accounts allowed. Limit reached.' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const userId = uuidv4();

    db.run(`INSERT INTO users (id, username, email, password, role, full_name, pin) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [userId, username, `${username}@restaurant.com`, hashedPassword, 'Default', username, null], function(err) {
      if (err) {
        console.error('Error creating default account:', err);
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Username already exists' });
        }
        return res.status(500).json({ error: 'Failed to create default account' });
      }

      // Log the signup
      logUserActivity(userId, 'SIGNUP', `Default account signed up from ${ipAddress}`, ipAddress);

      // Auto-login after signup
      const token = jwt.sign(
        { 
          id: userId, 
          username: username, 
          role: 'Default',
          full_name: username 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      console.log('Default account created successfully:', username);
      res.json({ 
        message: 'Default account created successfully',
        token,
        user: {
          id: userId,
          username: username,
          email: `${username}@restaurant.com`,
          role: 'Default',
          full_name: username
        }
      });
    });
  });
});



// Removed create-staff endpoint - users can signup directly

app.get('/api/auth/me', authenticateToken, (req, res) => {
  db.get("SELECT id, username, email, role, full_name FROM users WHERE id = ?", 
         [req.user.id], (err, user) => {
    if (err || !user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  });
});

app.get('/api/auth/users', authenticateToken, authorizeRole(['Owner', 'Default']), (req, res) => {
  db.all("SELECT id, username, email, role, full_name, created_at FROM users ORDER BY created_at DESC", 
         (err, users) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
    res.json(users);
  });
});

// User management endpoints for Owner
app.get('/api/admin/users', authenticateToken, authorizeRole(['Owner']), (req, res) => {
  db.all(`SELECT id, username, email, role, full_name, created_at FROM users ORDER BY created_at DESC`, (err, rows) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Count users by role
    const ownerCount = rows.filter(user => user.role === 'Owner').length;
    const defaultCount = rows.filter(user => user.role === 'Default').length;
    
    res.json({ 
      users: rows,
      counts: {
        owner: ownerCount,
        default: defaultCount,
        total: rows.length
      }
    });
  });
});

// Delete user endpoint (Owner only)
app.delete('/api/admin/users/:userId', authenticateToken, authorizeRole(['Owner']), (req, res) => {
  const { userId } = req.params;
  const ipAddress = req.ip || req.connection.remoteAddress;

  // Prevent owner from deleting themselves
  if (userId === req.user.id) {
    return res.status(400).json({ error: 'Cannot delete your own account' });
  }

  // Get user info before deletion for logging
  db.get(`SELECT username, role FROM users WHERE id = ?`, [userId], (err, user) => {
    if (err) {
      console.error('Error fetching user for deletion:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete the user
    db.run(`DELETE FROM users WHERE id = ?`, [userId], function(err) {
      if (err) {
        console.error('Error deleting user:', err);
        return res.status(500).json({ error: 'Failed to delete user' });
      }

      // Log the deletion
      logUserActivity(req.user.id, 'DELETE_USER', `Deleted user ${user.username} (${user.role}) from ${ipAddress}`, ipAddress);

      console.log(`User ${user.username} (${user.role}) deleted by ${req.user.username}`);
      res.json({ 
        message: 'User deleted successfully',
        deletedUser: {
          username: user.username,
          role: user.role
        }
      });
    });
  });
});

// Clear transactions endpoint (Owner only with password)
app.post('/api/admin/clear-transactions', authenticateToken, authorizeRole(['Owner']), (req, res) => {
  const { password } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;
  
  if (!password) {
    return res.status(400).json({ error: 'Password is required to clear transactions' });
  }
  
  // Verify password
  db.get("SELECT password FROM users WHERE id = ?", [req.user.id], (err, userRow) => {
    if (err) {
      console.error('Error fetching user for password verification:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!userRow || !bcrypt.compareSync(password, userRow.password)) {
      logUserActivity(req.user.id, 'CLEAR_TRANSACTIONS_FAILED', `Failed attempt to clear transactions from ${ipAddress}`, ipAddress);
      return res.status(401).json({ error: 'Invalid password' });
    }
    
    // Clear all orders and transactions
    db.run("DELETE FROM orders", (err) => {
      if (err) {
        console.error('Error clearing transactions:', err);
        return res.status(500).json({ error: 'Failed to clear transactions' });
      }
      
      logUserActivity(req.user.id, 'CLEAR_TRANSACTIONS', `All transactions cleared from ${ipAddress}`, ipAddress);
      console.log(`All transactions cleared by ${req.user.username}`);
      
      // Emit socket event to refresh all dashboards
      io.emit('transactions_cleared');
      
      res.json({ message: 'All transactions cleared successfully' });
    });
  });
});

// Reset entire database endpoint (Owner only with password)
app.post('/api/admin/reset-database', authenticateToken, authorizeRole(['Owner']), (req, res) => {
  const { password } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;
  
  if (!password) {
    return res.status(400).json({ error: 'Password is required to reset database' });
  }
  
  // Verify password
  db.get("SELECT password FROM users WHERE id = ?", [req.user.id], (err, userRow) => {
    if (err) {
      console.error('Error fetching user for password verification:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!userRow || !bcrypt.compareSync(password, userRow.password)) {
      logUserActivity(req.user.id, 'RESET_DB_FAILED', `Failed attempt to reset database from ${ipAddress}`, ipAddress);
      return res.status(401).json({ error: 'Invalid password' });
    }
    
    // Clear all data except current user
    const currentUserId = req.user.id;
    
    db.serialize(() => {
      db.run("DELETE FROM orders", (err) => {
        if (err) console.error('Error clearing orders:', err);
      });
      
      db.run("DELETE FROM expenditures", (err) => {
        if (err) console.error('Error clearing expenditures:', err);
      });
      
      db.run("DELETE FROM menu_items", (err) => {
        if (err) console.error('Error clearing menu items:', err);
      });
      
      db.run("DELETE FROM inventory", (err) => {
        if (err) console.error('Error clearing inventory:', err);
      });
      
      db.run("DELETE FROM users WHERE id != ?", [currentUserId], (err) => {
        if (err) {
          console.error('Error clearing other users:', err);
          return res.status(500).json({ error: 'Failed to reset database' });
        }
        
        logUserActivity(currentUserId, 'RESET_DATABASE', `Database reset from ${ipAddress}`, ipAddress);
        console.log(`Database reset by ${req.user.username}`);
        
        // Emit socket event to refresh all clients
        io.emit('database_reset');
        
        res.json({ message: 'Database reset successfully. Only your account remains.' });
      });
    });
  });
});

// Delete own account endpoint (Owner only with password)
app.delete('/api/admin/delete-own-account', authenticateToken, authorizeRole(['Owner']), (req, res) => {
  const { password } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;
  
  if (!password) {
    return res.status(400).json({ error: 'Password is required to delete account' });
  }
  
  // Verify password
  db.get("SELECT password, username FROM users WHERE id = ?", [req.user.id], (err, userRow) => {
    if (err) {
      console.error('Error fetching user for password verification:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!userRow || !bcrypt.compareSync(password, userRow.password)) {
      logUserActivity(req.user.id, 'DELETE_ACCOUNT_FAILED', `Failed attempt to delete own account from ${ipAddress}`, ipAddress);
      return res.status(401).json({ error: 'Invalid password' });
    }
    
    // Delete the user account
    db.run("DELETE FROM users WHERE id = ?", [req.user.id], (err) => {
      if (err) {
        console.error('Error deleting own account:', err);
        return res.status(500).json({ error: 'Failed to delete account' });
      }
      
      console.log(`Account ${userRow.username} deleted by owner`);
      
      res.json({ message: 'Account deleted successfully' });
    });
  });
});

// PIN Management Routes
app.post('/api/auth/verify-pin', authenticateToken, verifyOwnerPin, (req, res) => {
  res.json({ message: 'PIN verified successfully' });
});

app.post('/api/auth/change-pin', authenticateToken, authorizeRole(['Owner']), (req, res) => {
  const { currentPin, newPin } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;
  
  if (!currentPin || !newPin) {
    return res.status(400).json({ error: 'Current PIN and new PIN are required' });
  }
  
  if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
    return res.status(400).json({ error: 'New PIN must be exactly 4 digits' });
  }

  // Verify current PIN first
  db.get("SELECT pin FROM users WHERE id = ?", [req.user.id], (err, userRow) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to verify current PIN' });
    }
    
    if (!userRow || !bcrypt.compareSync(currentPin, userRow.pin)) {
      logPinOperation(req.user.id, 'PIN_CHANGE_FAILED', null, null, 
                    `Failed PIN change attempt from ${ipAddress}`, ipAddress);
      return res.status(403).json({ error: 'Current PIN is incorrect' });
    }
    
    // Update to new PIN
    const hashedNewPin = bcrypt.hashSync(newPin, 10);
    
    db.run("UPDATE users SET pin = ? WHERE id = ?", [hashedNewPin, req.user.id], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update PIN' });
      }
      
      logPinOperation(req.user.id, 'PIN_CHANGED', null, null, 
                    `PIN changed successfully from ${ipAddress}`, ipAddress);
      res.json({ message: 'PIN updated successfully' });
    });
  });
});

// Menu Extras Routes
app.get('/api/menu-extras', (req, res) => {
  db.all('SELECT * FROM menu_extras WHERE active = 1 ORDER BY category, name', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/menu-extras', authenticateToken, authorizeRole(['Owner', 'Default']), (req, res) => {
  const { name, price, category } = req.body;
  const id = uuidv4();
  
  db.run(`INSERT INTO menu_extras (id, name, price, category) VALUES (?, ?, ?, ?)`,
         [id, name, price, category], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id, message: 'Menu extra added successfully' });
  });
});

app.put('/api/menu-extras/:id', authenticateToken, authorizeRole(['Owner', 'Default']), (req, res) => {
  const { id } = req.params;
  const { name, price, category } = req.body;
  
  db.run(`UPDATE menu_extras SET name = ?, price = ?, category = ? WHERE id = ?`,
         [name, price, category, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Menu extra updated successfully' });
  });
});

// API Routes
app.get('/api/dashboard/stats', authenticateToken, (req, res) => {
  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format in local time
  
  // Get total stats (all time) and today's stats
  db.all(`SELECT 
    SUM(total_amount) as total_sales,
    COUNT(*) as total_orders
    FROM orders WHERE payment_status = 'paid'`, [], (err, totalRows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Get today's stats separately
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
      
      // Ensure numbers are not null
      totalStats.total_sales = totalStats.total_sales || 0;
      totalStats.total_orders = totalStats.total_orders || 0;
      todayStats.today_sales = todayStats.today_sales || 0;
      todayStats.today_orders = todayStats.today_orders || 0;
      
      // Combine both stats
      const stats = {
        total_sales: totalStats.total_sales,
        total_orders: totalStats.total_orders,
        today_sales: todayStats.today_sales,
        today_orders: todayStats.today_orders
      };
      
      res.json(stats);
    });
  });
});

// Get sales by category for pie chart
// Get top selling products
app.get('/api/dashboard/top-products', authenticateToken, (req, res) => {
  // Get top selling products from all orders (overall data)
  db.all(`SELECT items, id FROM orders 
          WHERE payment_status = 'paid'`, [], async (err, orders) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    const productStats = {};
    
    // Process each order
    for (const order of orders) {
      try {
        const items = JSON.parse(order.items);
        
        // Process each item in the order
        for (const item of items) {
          // Get the menu item details
          const menuItem = await new Promise((resolve, reject) => {
            db.get(`SELECT name, category, price FROM menu_items WHERE id = ?`, [item.menu_item_id], (err, row) => {
              if (err) reject(err);
              else resolve(row);
            });
          });
          
          if (menuItem) {
            const key = `${menuItem.name}`;
            if (!productStats[key]) {
              productStats[key] = { 
                name: menuItem.name,
                category: menuItem.category || 'Other',
                price: menuItem.price,
                quantity: 0, 
                sales: 0,
                orders: new Set()
              };
            }
            productStats[key].quantity += item.quantity;
            productStats[key].sales += item.price * item.quantity;
            productStats[key].orders.add(order.id);
          }
        }
      } catch (e) {
        console.error('Error parsing order items:', e);
      }
    }
    
    // Convert to array and sort by quantity
    const result = Object.values(productStats)
      .map(item => ({
        ...item,
        orders: item.orders.size
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5); // Top 5 products
    
    res.json(result);
  });
});

app.get('/api/dashboard/hourly-sales', authenticateToken, (req, res) => {
  // Get overall sales data by hour (all time)
  db.all(`SELECT 
    strftime('%H', datetime(created_at, 'localtime')) as hour,
    COUNT(*) as transactions,
    SUM(total_amount) as sales
    FROM orders 
    WHERE payment_status = 'paid'
    GROUP BY strftime('%H', datetime(created_at, 'localtime'))
    ORDER BY hour`, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Fill in missing hours with 0 transactions
    const hourlyData = Array.from({length: 24}, (_, i) => ({
      hour: i,
      transactions: 0,
      sales: 0
    }));
    
    rows.forEach(row => {
      const hour = parseInt(row.hour);
      hourlyData[hour] = {
        hour,
        transactions: row.transactions,
        sales: row.sales || 0
      };
    });
    
    res.json(hourlyData);
  });
});

// Get recent orders for dashboard
app.get('/api/dashboard/recent-orders', authenticateToken, (req, res) => {
  db.all(`SELECT * FROM orders 
          ORDER BY created_at DESC 
          LIMIT 5`, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    const orders = rows.map(order => ({
      ...order,
      items: JSON.parse(order.items)
    }));
    
    res.json(orders);
  });
});

// Get today's top selling products
app.get('/api/dashboard/today-top-products', authenticateToken, (req, res) => {
  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format in local time
  
  // Get top selling products from today's orders
  db.all(`SELECT items, id FROM orders 
          WHERE DATE(datetime(created_at, 'localtime')) = ? AND payment_status = 'paid'`, [today], async (err, orders) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    const productStats = {};
    
    // Process each order
    for (const order of orders) {
      try {
        const items = JSON.parse(order.items);
        
        // Process each item in the order
        for (const item of items) {
          // Get the menu item details
          const menuItem = await new Promise((resolve, reject) => {
            db.get(`SELECT name, category, price FROM menu_items WHERE id = ?`, [item.menu_item_id], (err, row) => {
              if (err) reject(err);
              else resolve(row);
            });
          });
          
          if (menuItem) {
            const key = `${menuItem.name}`;
            if (!productStats[key]) {
              productStats[key] = { 
                name: menuItem.name,
                category: menuItem.category || 'Other',
                price: menuItem.price,
                quantity: 0, 
                sales: 0,
                orders: new Set()
              };
            }
            productStats[key].quantity += item.quantity;
            productStats[key].sales += item.price * item.quantity;
            productStats[key].orders.add(order.id);
          }
        }
      } catch (e) {
        console.error('Error parsing order items:', e);
      }
    }
    
    // Convert to array and sort by quantity
    const result = Object.values(productStats)
      .map(item => ({
        ...item,
        orders: item.orders.size
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 3); // Top 3 products for today
    
    res.json(result);
  });
});

// Get ingredient consumption statistics
app.get('/api/dashboard/ingredient-consumption', authenticateToken, (req, res) => {
  // Get all paid orders
  db.all(`SELECT items FROM orders WHERE payment_status = 'paid'`, [], async (err, orders) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    const ingredientConsumption = {};
    
    // Process each order
    for (const order of orders) {
      try {
        const items = JSON.parse(order.items);
        
        // Process each item in the order
        for (const item of items) {
          // Get the menu item details and ingredients
          const menuItem = await new Promise((resolve, reject) => {
            db.get(`SELECT ingredients FROM menu_items WHERE id = ?`, [item.menu_item_id], (err, row) => {
              if (err) reject(err);
              else resolve(row);
            });
          });
          
          if (menuItem && menuItem.ingredients) {
            const ingredients = JSON.parse(menuItem.ingredients);
            
            // Calculate consumption for each ingredient
            for (const ingredient of ingredients) {
              const key = ingredient.name;
              if (!ingredientConsumption[key]) {
                ingredientConsumption[key] = {
                  name: ingredient.name,
                  totalConsumed: 0,
                  unit: 'units' // Default unit
                };
              }
              ingredientConsumption[key].totalConsumed += ingredient.quantity * item.quantity;
            }
          }
        }
      } catch (e) {
        console.error('Error parsing order items:', e);
      }
    }
    
    // Get inventory units for better display
    db.all(`SELECT name, unit FROM inventory`, [], (err, inventoryItems) => {
      if (!err) {
        inventoryItems.forEach(invItem => {
          if (ingredientConsumption[invItem.name]) {
            ingredientConsumption[invItem.name].unit = invItem.unit || 'units';
          }
        });
      }
      
      // Convert to array and sort by consumption
      const result = Object.values(ingredientConsumption)
        .sort((a, b) => b.totalConsumed - a.totalConsumed)
        .slice(0, 8); // Top 8 consumed ingredients
      
      res.json(result);
    });
  });
});

app.get('/api/inventory', (req, res) => {
  db.all('SELECT * FROM inventory ORDER BY name', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/menu', (req, res) => {
  db.all('SELECT * FROM menu_items WHERE active = 1 ORDER BY category, name', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows.map(item => ({
      ...item,
      ingredients: JSON.parse(item.ingredients)
    })));
  });
});

app.post('/api/inventory', (req, res) => {
  const { name, quantity, unit } = req.body;
  const id = uuidv4();
  
  db.run(`INSERT INTO inventory (id, name, quantity, unit) 
          VALUES (?, ?, ?, ?)`, 
          [id, name, quantity, unit], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    io.emit('inventory_updated');
    res.json({ id, message: 'Inventory item added successfully' });
  });
});

app.put('/api/inventory/:id', (req, res) => {
  const { id } = req.params;
  const { name, quantity, unit } = req.body;
  
  db.run(`UPDATE inventory 
          SET name = ?, quantity = ?, unit = ?
          WHERE id = ?`, 
          [name, quantity, unit, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    io.emit('inventory_updated');
    res.json({ message: 'Inventory item updated successfully' });
  });
});

app.delete('/api/inventory/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM inventory WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    io.emit('inventory_updated');
    res.json({ message: 'Inventory item deleted successfully' });
  });
});

// Get today's orders
app.get('/api/orders/today', (req, res) => {
  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format in local time
  
  db.all(`SELECT * FROM orders 
          WHERE DATE(datetime(created_at, 'localtime')) = ? 
          ORDER BY created_at DESC`, [today], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    const orders = rows.map(order => ({
      ...order,
      items: JSON.parse(order.items),
      extras: order.extras ? JSON.parse(order.extras) : []
    }));
    
    res.json(orders);
  });
});

// Get transaction history
app.get('/api/orders/history', (req, res) => {
  const { limit = 50, offset = 0 } = req.query;
  
  db.all(`SELECT * FROM orders 
          ORDER BY created_at DESC 
          LIMIT ? OFFSET ?`, [parseInt(limit), parseInt(offset)], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    const orders = rows.map(order => ({
      ...order,
      items: JSON.parse(order.items)
    }));
    
    res.json(orders);
  });
});

// Add menu item
app.post('/api/menu', authenticateToken, upload.single('image'), (req, res) => {
  const { name, price, category, ingredients } = req.body;
  const id = uuidv4();
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
  
  // Try with image_url first, fallback without it if column doesn't exist
  db.run(`INSERT INTO menu_items (id, name, price, category, ingredients, image_url) 
          VALUES (?, ?, ?, ?, ?, ?)`, 
          [id, name, price, category, ingredients, imageUrl], function(err) {
    if (err && err.message.includes('no column named image_url')) {
      // Fallback: insert without image_url column
      db.run(`INSERT INTO menu_items (id, name, price, category, ingredients) 
              VALUES (?, ?, ?, ?, ?)`, 
              [id, name, price, category, ingredients], function(fallbackErr) {
        if (fallbackErr) {
          res.status(500).json({ error: fallbackErr.message });
          return;
        }
        
        io.emit('menu_updated');
        res.json({ id, message: 'Menu item added successfully (without image)' });
      });
      return;
    }
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    io.emit('menu_updated');
    res.json({ id, message: 'Menu item added successfully' });
  });
});

// Update menu item (with optional image)
app.put('/api/menu/:id', authenticateToken, (req, res) => {
  // Check if request has multipart data (image upload)
  const contentType = req.headers['content-type'];
  
  if (contentType && contentType.includes('multipart/form-data')) {
    // Handle FormData with image
    upload.single('image')(req, res, (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      const { id } = req.params;
      const { name, price, category, ingredients } = req.body;
      const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
      
      console.log('FormData update - name:', name, 'price:', price, 'category:', category);
      
      if (!name || !price || !category) {
        return res.status(400).json({ error: 'Missing required fields: name, price, or category' });
      }
      
      let query, params;
      
      if (imageUrl) {
        query = `UPDATE menu_items 
                 SET name = ?, price = ?, category = ?, ingredients = ?, image_url = ?
                 WHERE id = ?`;
        params = [name, price, category, ingredients, imageUrl, id];
      } else {
        query = `UPDATE menu_items 
                 SET name = ?, price = ?, category = ?, ingredients = ?
                 WHERE id = ?`;
        params = [name, price, category, ingredients, id];
      }
      
      db.run(query, params, function(err) {
        if (err) {
          console.error('Database error:', err);
          res.status(500).json({ error: err.message });
          return;
        }
        
        io.emit('menu_updated');
        res.json({ message: 'Menu item updated successfully' });
      });
    });
  } else {
    // Handle JSON data (no image)
    const { id } = req.params;
    const { name, price, category, ingredients } = req.body;
    
    console.log('JSON update - name:', name, 'price:', price, 'category:', category);
    
    if (!name || !price || !category) {
      return res.status(400).json({ error: 'Missing required fields: name, price, or category' });
    }
    
    const query = `UPDATE menu_items 
                   SET name = ?, price = ?, category = ?, ingredients = ?
                   WHERE id = ?`;
    const params = [name, price, category, JSON.stringify(ingredients), id];
    
    db.run(query, params, function(err) {
      if (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: err.message });
        return;
      }
      
      io.emit('menu_updated');
      res.json({ message: 'Menu item updated successfully' });
    });
  }
});

// Delete menu item
app.delete('/api/menu/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM menu_items WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    io.emit('menu_updated');
    res.json({ message: 'Menu item deleted successfully' });
  });
});

// Bulk add menu items from Excel
app.post('/api/menu/bulk', authenticateToken, (req, res) => {
  const { items } = req.body;
  
  const insertPromises = items.map(item => {
    return new Promise((resolve, reject) => {
      const id = uuidv4();
      db.run(`INSERT INTO menu_items (id, name, price, category, ingredients) 
              VALUES (?, ?, ?, ?, ?)`, 
              [id, item.name, item.price, item.category, JSON.stringify(item.ingredients)], 
              function(err) {
        if (err) reject(err);
        else resolve(id);
      });
    });
  });
  
  Promise.all(insertPromises)
    .then(() => {
      io.emit('menu_updated');
      res.json({ message: `${items.length} menu items added successfully` });
    })
    .catch(err => {
      res.status(500).json({ error: err.message });
    });
});

// Update order payment status
app.put('/api/orders/:id/payment', (req, res) => {
  const { id } = req.params;
  const { payment_status } = req.body;
  
  db.run(`UPDATE orders SET payment_status = ? WHERE id = ?`, 
         [payment_status, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    io.emit('order_updated');
    io.emit('sales_updated');
    res.json({ message: 'Payment status updated successfully' });
  });
});

// Update order items and amount
app.put('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const { items, total_amount } = req.body;
  
  db.run(`UPDATE orders SET items = ?, total_amount = ? WHERE id = ?`, 
         [JSON.stringify(items), total_amount, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    io.emit('order_updated');
    io.emit('sales_updated');
    res.json({ message: 'Order updated successfully' });
  });
});

// Lock order (no PIN required)
app.post('/api/orders/:id/lock', authenticateToken, (req, res) => {
  const { id } = req.params;
  const ipAddress = req.ip || req.connection.remoteAddress;
  
  db.run(`UPDATE orders SET is_locked = 1, locked_by = ?, locked_at = CURRENT_TIMESTAMP WHERE id = ?`,
         [req.user.id, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    logPinOperation(req.user.id, 'ORDER_LOCKED', id, 'ORDER', 
                   `Order ${id} locked`, ipAddress);
    
    io.emit('order_updated');
    res.json({ message: 'Order locked successfully' });
  });
});

app.post('/api/orders/:id/unlock', authenticateToken, verifyOwnerPin, (req, res) => {
  const { id } = req.params;
  const ipAddress = req.ip || req.connection.remoteAddress;
  
  db.run(`UPDATE orders SET is_locked = 0, locked_by = NULL, locked_at = NULL WHERE id = ?`,
         [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    logPinOperation(req.user.id, 'ORDER_UNLOCKED', id, 'ORDER', 
                   `Order ${id} unlocked`, ipAddress);
    
    io.emit('order_updated');
    res.json({ message: 'Order unlocked successfully' });
  });
});

// Delete order (requires PIN)
app.delete('/api/orders/:id', authenticateToken, verifyOwnerPin, (req, res) => {
  const { id } = req.params;
  
  // First get the order to restore inventory
  db.get('SELECT items FROM orders WHERE id = ?', [id], async (err, order) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    
    try {
      // Restore inventory for deleted order
      const items = JSON.parse(order.items);
      
      for (const orderItem of items) {
        // Get menu item ingredients
        const menuItem = await new Promise((resolve, reject) => {
          db.get('SELECT ingredients FROM menu_items WHERE id = ?', [orderItem.menu_item_id], (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
        });
        
        if (menuItem) {
          const ingredients = JSON.parse(menuItem.ingredients);
          
          // Restore ingredients to inventory
          for (const ingredient of ingredients) {
            const totalToRestore = ingredient.quantity * orderItem.quantity;
            
            await new Promise((resolve, reject) => {
              db.run(`UPDATE inventory 
                      SET quantity = quantity + ? 
                      WHERE name = ?`, 
                      [totalToRestore, ingredient.name], function(err) {
                if (err) reject(err);
                else resolve();
              });
            });
          }
        }
      }
      
      // Delete the order
      db.run('DELETE FROM orders WHERE id = ?', [id], function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        
        io.emit('order_updated');
        io.emit('sales_updated');
        io.emit('inventory_updated');
        res.json({ message: 'Order deleted successfully and inventory restored' });
      });
      
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete order: ' + error.message });
    }
  });
});

// Get paid transactions (for transaction management)
app.get('/api/transactions', (req, res) => {
  db.all(`SELECT * FROM orders 
          WHERE payment_status = 'paid' 
          ORDER BY created_at DESC`, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    const transactions = rows.map(order => ({
      ...order,
      items: JSON.parse(order.items)
    }));
    
    res.json(transactions);
  });
});

// Expenditure management endpoints
app.get('/api/expenditures', (req, res) => {
  db.all('SELECT * FROM expenditures ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/expenditures', (req, res) => {
  const { description, amount, category, supplier } = req.body;
  const id = uuidv4();
  
  db.run(`INSERT INTO expenditures (id, description, amount, category, supplier) 
          VALUES (?, ?, ?, ?, ?)`, 
          [id, description, amount, category, supplier || ''], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    io.emit('expenditure_updated');
    res.json({ id, message: 'Expenditure added successfully' });
  });
});

app.put('/api/expenditures/:id/payment', (req, res) => {
  const { id } = req.params;
  const { payment_status } = req.body;
  
  db.run(`UPDATE expenditures SET payment_status = ? WHERE id = ?`, 
         [payment_status, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    io.emit('expenditure_updated');
    res.json({ message: 'Payment status updated successfully' });
  });
});

// Lock/Unlock expenditure (requires PIN)
app.post('/api/expenditures/:id/lock', authenticateToken, verifyOwnerPin, (req, res) => {
  const { id } = req.params;
  const ipAddress = req.ip || req.connection.remoteAddress;
  
  db.run(`UPDATE expenditures SET is_locked = 1, locked_by = ?, locked_at = CURRENT_TIMESTAMP WHERE id = ?`,
         [req.user.id, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    logPinOperation(req.user.id, 'EXPENDITURE_LOCKED', id, 'EXPENDITURE', 
                   `Expenditure ${id} locked`, ipAddress);
    
    io.emit('expenditure_updated');
    res.json({ message: 'Expenditure locked successfully' });
  });
});

app.post('/api/expenditures/:id/unlock', authenticateToken, verifyOwnerPin, (req, res) => {
  const { id } = req.params;
  const ipAddress = req.ip || req.connection.remoteAddress;
  
  db.run(`UPDATE expenditures SET is_locked = 0, locked_by = NULL, locked_at = NULL WHERE id = ?`,
         [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    logPinOperation(req.user.id, 'EXPENDITURE_UNLOCKED', id, 'EXPENDITURE', 
                   `Expenditure ${id} unlocked`, ipAddress);
    
    io.emit('expenditure_updated');
    res.json({ message: 'Expenditure unlocked successfully' });
  });
});

app.delete('/api/expenditures/:id', authenticateToken, verifyOwnerPin, (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM expenditures WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    io.emit('expenditure_updated');
    res.json({ message: 'Expenditure deleted successfully' });
  });
});

app.post('/api/orders', authenticateToken, async (req, res) => {
  const { items, extras = [], total_amount, payment_method = 'cash' } = req.body;
  
  try {
    const orderId = await generateOrderId();
  
    // TODO: Process inventory deduction (temporarily disabled for testing)
    // for (const orderItem of items) {
    //   // Get menu item ingredients
    //   const menuItem = await new Promise((resolve, reject) => {
    //     db.get('SELECT ingredients FROM menu_items WHERE id = ?', [orderItem.menu_item_id], (err, row) => {
    //       if (err) reject(err);
    //       else resolve(row);
    //     });
    //   });
      
    //   if (menuItem) {
    //     const ingredients = JSON.parse(menuItem.ingredients);
        
    //     // Deduct ingredients from inventory
    //     for (const ingredient of ingredients) {
    //       const totalNeeded = ingredient.quantity * orderItem.quantity;
          
    //       await new Promise((resolve, reject) => {
    //         db.run(`UPDATE inventory 
    //                 SET quantity = quantity - ? 
    //                 WHERE name = ? AND quantity >= ?`, 
    //                 [totalNeeded, ingredient.name, totalNeeded], function(err) {
    //           if (err) reject(err);
    //           else resolve();
    //         });
    //       });
    //     }
    //   }
    // }
    
    // Save order
    db.run(`INSERT INTO orders (id, items, extras, total_amount, payment_method, created_by) VALUES (?, ?, ?, ?, ?, ?)`, 
           [orderId, JSON.stringify(items), JSON.stringify(extras), total_amount, payment_method, req.user.id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      io.emit('inventory_updated');
      io.emit('new_order', { id: orderId, items, extras, total_amount });
      io.emit('sales_updated');
      res.json({ id: orderId, message: 'Order processed successfully' });
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to process order: ' + error.message });
  }
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('Client connected');
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Serve React app
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
// });

// Debug endpoint to check user data
app.get('/api/admin/debug-users', (req, res) => {
  db.all("SELECT id, username, role, pin FROM users", (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
    res.json(rows);
  });
});

// Admin endpoint to keep only cheese extras
app.post('/api/admin/keep-only-cheese', (req, res) => {
  db.run("UPDATE menu_extras SET active = 0 WHERE name != 'Extra Cheese Slice'", (err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to update extras' });
    }
    res.json({ message: 'Updated extras successfully' });
  });
});

// Debug PIN verification endpoint
app.post('/api/admin/debug-pin', authenticateToken, (req, res) => {
  const { pin } = req.body;
  console.log('Debug PIN request:', {
    userId: req.user.id,
    username: req.user.username,
    role: req.user.role,
    pinReceived: pin,
    pinLength: pin ? pin.length : 0
  });
  
  db.get("SELECT pin FROM users WHERE id = ?", [req.user.id], (err, userRow) => {
    if (err) {
      console.log('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    console.log('User PIN from DB:', userRow ? 'Found' : 'Not found');
    
    if (userRow && bcrypt.compareSync(pin, userRow.pin)) {
      console.log('PIN match: SUCCESS');
      res.json({ success: true, message: 'PIN verified' });
    } else {
      console.log('PIN match: FAILED');
      res.json({ success: false, message: 'Invalid PIN' });
    }
  });
});

// Reset database endpoint (for development)
app.post('/api/admin/reset-database', (req, res) => {
  try {
    // Delete all users
    db.run("DELETE FROM users", (err) => {
      if (err) {
        console.error('Error deleting users:', err);
        return res.status(500).json({ error: 'Failed to reset users' });
      }
      
      // Reset restaurant settings
      db.run("DELETE FROM restaurant_settings", (err) => {
        if (err) {
          console.error('Error deleting restaurant settings:', err);
          return res.status(500).json({ error: 'Failed to reset settings' });
        }
        
        // Delete all orders
        db.run("DELETE FROM orders", (err) => {
          if (err) {
            console.error('Error deleting orders:', err);
            return res.status(500).json({ error: 'Failed to reset orders' });
          }
          
          // Delete all expenditures
          db.run("DELETE FROM expenditures", (err) => {
            if (err) {
              console.error('Error deleting expenditures:', err);
              return res.status(500).json({ error: 'Failed to reset expenditures' });
            }
            
            // Delete all activity logs
            db.run("DELETE FROM user_activity_logs", (err) => {
              if (err) {
                console.error('Error deleting activity logs:', err);
                return res.status(500).json({ error: 'Failed to reset activity logs' });
              }
              
              res.json({ message: 'Database reset successfully' });
            });
          });
        });
      });
    });
  } catch (error) {
    console.error('Error resetting database:', error);
    res.status(500).json({ error: 'Failed to reset database' });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});