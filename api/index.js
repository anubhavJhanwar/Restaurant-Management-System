// Main API handler for BurgerBoss - handles all endpoints
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const app = express();

// Enable CORS
app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secure-jwt-secret-key-for-production';

// In-memory storage
let users = [
  {
    id: '1',
    username: 'demo',
    email: 'demo@burgerboss.com',
    password: bcrypt.hashSync('demo123', 10),
    role: 'Owner',
    full_name: 'Demo Owner',
    pin: bcrypt.hashSync('1234', 10)
  }
];

let menuItems = [
  {
    id: '1',
    name: 'Aloo Tikki Burger',
    price: 80,
    category: 'Burgers',
    ingredients: ['Aloo Patty', 'Bun', 'Cheese Slice'],
    active: true,
    created_at: new Date().toISOString()
  },
  {
    id: '2', 
    name: 'Veg Burger',
    price: 90,
    category: 'Burgers',
    ingredients: ['Veg Patty', 'Bun', 'Cheese Slice'],
    active: true,
    created_at: new Date().toISOString()
  }
];

let inventory = [
  { id: '1', name: 'Aloo Patty', quantity: 50, unit: 'pieces', low_stock_threshold: 10 },
  { id: '2', name: 'Buns', quantity: 100, unit: 'pieces', low_stock_threshold: 20 },
  { id: '3', name: 'Cheese Slices', quantity: 80, unit: 'pieces', low_stock_threshold: 15 },
  { id: '4', name: 'Veg Patty', quantity: 30, unit: 'pieces', low_stock_threshold: 10 },
  { id: '5', name: 'Paneer Patty', quantity: 25, unit: 'pieces', low_stock_threshold: 10 }
];

let orders = [];
let expenditures = [];

// Middleware
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

// Routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!', timestamp: new Date().toISOString() });
});

// Auth routes
app.post('/api/auth', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const user = users.find(u => u.username === username);
  
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

// Menu routes
app.get('/api/menu', (req, res) => {
  res.json(menuItems);
});

app.post('/api/menu', (req, res) => {
  const { name, price, category, ingredients, items } = req.body;
  
  try {
    // Handle bulk upload
    if (items && Array.isArray(items)) {
      items.forEach(item => {
        const newItem = {
          id: uuidv4(),
          name: item.name,
          price: parseFloat(item.price),
          category: item.category || 'Burgers',
          ingredients: Array.isArray(item.ingredients) ? item.ingredients : item.ingredients.split(',').map(i => i.trim()),
          active: true,
          created_at: new Date().toISOString()
        };
        menuItems.push(newItem);
      });
      
      return res.json({ 
        message: `${items.length} menu items uploaded successfully`,
        count: items.length
      });
    }
    
    // Handle single item
    if (name && price) {
      const newItem = {
        id: uuidv4(),
        name,
        price: parseFloat(price),
        category: category || 'Burgers',
        ingredients: Array.isArray(ingredients) ? ingredients : ingredients.split(',').map(i => i.trim()),
        active: true,
        created_at: new Date().toISOString()
      };
      
      menuItems.push(newItem);
      
      return res.json({ 
        message: 'Menu item added successfully',
        item: newItem
      });
    }
    
    return res.status(400).json({ error: 'Invalid data provided' });
  } catch (error) {
    console.error('Menu error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Inventory routes
app.get('/api/inventory', (req, res) => {
  res.json(inventory);
});

app.post('/api/inventory', (req, res) => {
  const { name, quantity, unit, low_stock_threshold } = req.body;
  
  if (!name || !quantity || !unit) {
    return res.status(400).json({ error: 'Name, quantity, and unit are required' });
  }
  
  const newItem = {
    id: uuidv4(),
    name,
    quantity: parseFloat(quantity),
    unit,
    low_stock_threshold: parseFloat(low_stock_threshold) || 10,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  inventory.push(newItem);
  
  return res.json({ 
    message: 'Inventory item added successfully',
    item: newItem
  });
});

// Orders routes
app.get('/api/orders', (req, res) => {
  res.json(orders);
});

app.get('/api/orders/today', (req, res) => {
  const today = new Date().toDateString();
  const todayOrders = orders.filter(order => 
    new Date(order.created_at).toDateString() === today
  );
  res.json(todayOrders);
});

app.post('/api/orders', (req, res) => {
  const newOrder = {
    id: uuidv4(),
    ...req.body,
    created_at: new Date().toISOString()
  };
  
  orders.push(newOrder);
  
  res.json({ 
    message: 'Order created successfully',
    order: newOrder
  });
});

// Expenditures routes
app.get('/api/expenditures', (req, res) => {
  res.json(expenditures);
});

app.post('/api/expenditures', (req, res) => {
  const newExpenditure = {
    id: uuidv4(),
    ...req.body,
    created_at: new Date().toISOString()
  };
  
  expenditures.push(newExpenditure);
  
  res.json({ 
    message: 'Expenditure added successfully',
    expenditure: newExpenditure
  });
});

// Export for Vercel
module.exports = (req, res) => {
  return app(req, res);
};