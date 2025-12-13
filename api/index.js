// Simple working API for BurgerBoss
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// In-memory data store
let menuItems = [
  {
    id: '1',
    name: 'Aloo Tikki Burger',
    price: 80,
    category: 'Burgers',
    ingredients: ['Aloo Patty', 'Bun', 'Cheese Slice'],
    active: true
  },
  {
    id: '2',
    name: 'Veg Burger',
    price: 90,
    category: 'Burgers', 
    ingredients: ['Veg Patty', 'Bun', 'Cheese Slice'],
    active: true
  }
];

let inventory = [
  { id: '1', name: 'Aloo Patty', quantity: 50, unit: 'pieces' },
  { id: '2', name: 'Buns', quantity: 100, unit: 'pieces' },
  { id: '3', name: 'Cheese Slices', quantity: 80, unit: 'pieces' }
];

let expenditures = [];

module.exports = (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url, method } = req;

  try {
    // Test endpoint
    if (url === '/api/test') {
      return res.json({ message: 'API Working!' });
    }

    // Auth endpoint
    if (url === '/api/auth' && method === 'POST') {
      const { username, password } = req.body;
      
      if (username === 'demo' && password === 'demo123') {
        const token = jwt.sign(
          { id: '1', username: 'demo', role: 'Owner' },
          'secret',
          { expiresIn: '24h' }
        );
        
        return res.json({
          message: 'Login successful',
          token,
          user: { id: '1', username: 'demo', role: 'Owner', full_name: 'Demo User' }
        });
      }
      
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Menu endpoints
    if (url === '/api/menu') {
      if (method === 'GET') {
        return res.json(menuItems);
      }
      
      if (method === 'POST') {
        const { name, price, category, ingredients, items } = req.body;
        
        // Handle bulk upload
        if (items && Array.isArray(items)) {
          items.forEach(item => {
            menuItems.push({
              id: uuidv4(),
              name: item.name,
              price: parseFloat(item.price),
              category: item.category || 'Burgers',
              ingredients: Array.isArray(item.ingredients) ? item.ingredients : [],
              active: true
            });
          });
          return res.json({ message: `${items.length} items added` });
        }
        
        // Handle single item
        if (name && price) {
          menuItems.push({
            id: uuidv4(),
            name,
            price: parseFloat(price),
            category: category || 'Burgers',
            ingredients: Array.isArray(ingredients) ? ingredients : [],
            active: true
          });
          return res.json({ message: 'Item added successfully' });
        }
        
        return res.status(400).json({ error: 'Invalid data' });
      }
    }

    // Inventory endpoints
    if (url === '/api/inventory') {
      if (method === 'GET') {
        return res.json(inventory);
      }
      
      if (method === 'POST') {
        const { name, quantity, unit } = req.body;
        
        if (name && quantity && unit) {
          inventory.push({
            id: uuidv4(),
            name,
            quantity: parseFloat(quantity),
            unit
          });
          return res.json({ message: 'Inventory item added' });
        }
        
        return res.status(400).json({ error: 'Invalid data' });
      }
    }

    // Expenditures endpoints
    if (url === '/api/expenditures') {
      if (method === 'GET') {
        return res.json(expenditures);
      }
      
      if (method === 'POST') {
        const { description, amount, category, supplier } = req.body;
        
        if (description && amount && category) {
          expenditures.push({
            id: uuidv4(),
            description,
            amount: parseFloat(amount),
            category,
            supplier: supplier || '',
            payment_status: 'pending',
            created_at: new Date().toISOString()
          });
          return res.json({ message: 'Expenditure added successfully' });
        }
        
        return res.status(400).json({ error: 'Description, amount, and category required' });
      }
    }

    // Orders endpoints
    if (url === '/api/orders' || url === '/api/orders/today') {
      if (method === 'GET') {
        const orders = []; // Empty for now, will be populated when orders are created
        return res.json(orders);
      }
      
      if (method === 'POST') {
        const newOrder = {
          id: uuidv4(),
          ...req.body,
          created_at: new Date().toISOString()
        };
        return res.json({ message: 'Order created successfully', order: newOrder });
      }
    }

    // Menu extras endpoint (for cheese slice add-on)
    if (url === '/api/menu-extras') {
      if (method === 'GET') {
        const extras = [
          {
            id: '1',
            name: 'Extra Cheese Slice',
            price: 15,
            category: 'Add-ons',
            active: true
          }
        ];
        return res.json(extras);
      }
    }

    // Dashboard stats endpoint
    if (url === '/api/dashboard/stats') {
      if (method === 'GET') {
        const stats = {
          total_sales: 0,
          total_orders: 0,
          today_sales: 0,
          today_orders: 0
        };
        return res.json(stats);
      }
    }

    // Dashboard hourly sales
    if (url === '/api/dashboard/hourly-sales') {
      if (method === 'GET') {
        const hourlySales = [];
        for (let i = 0; i < 24; i++) {
          hourlySales.push({
            hour: i,
            sales: Math.floor(Math.random() * 1000) // Demo data
          });
        }
        return res.json(hourlySales);
      }
    }

    // Dashboard top products
    if (url === '/api/dashboard/top-products') {
      if (method === 'GET') {
        const topProducts = menuItems.slice(0, 5).map((item, index) => ({
          name: item.name,
          quantity: Math.floor(Math.random() * 50) + 10,
          revenue: item.price * (Math.floor(Math.random() * 50) + 10)
        }));
        return res.json(topProducts);
      }
    }

    return res.status(404).json({ error: 'Not found' });
    
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};