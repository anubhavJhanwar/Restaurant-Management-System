const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const path = require('path');

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
app.use(express.static(path.join(__dirname, 'client/build')));

// Initialize SQLite Database
const db = new sqlite3.Database('./restaurant.db');

// Create tables
db.serialize(() => {
  // Menu items table
  db.run(`CREATE TABLE IF NOT EXISTS menu_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    category TEXT NOT NULL,
    ingredients TEXT NOT NULL,
    active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

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
    total_amount REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    payment_status TEXT DEFAULT 'unpaid',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

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
    supplier TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// Database is now empty - ready for fresh data

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

// API Routes
app.get('/api/dashboard/stats', (req, res) => {
  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format in local time
  
  // Get real-time stats from orders table
  db.all(`SELECT 
    SUM(total_amount) as total_sales,
    COUNT(*) as total_orders
    FROM orders WHERE DATE(datetime(created_at, 'localtime')) = ? AND payment_status = 'paid'`, [today], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    const stats = rows[0] || { total_sales: 0, total_orders: 0 };
    // Ensure numbers are not null
    stats.total_sales = stats.total_sales || 0;
    stats.total_orders = stats.total_orders || 0;
    
    res.json(stats);
  });
});

// Get sales by category for pie chart
app.get('/api/dashboard/category-sales', (req, res) => {
  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format in local time
  
  // Get all paid orders for today
  db.all(`SELECT items FROM orders 
          WHERE DATE(datetime(created_at, 'localtime')) = ? AND payment_status = 'paid'`, [today], async (err, orders) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    const categoryStats = {};
    
    // Process each order
    for (const order of orders) {
      try {
        const items = JSON.parse(order.items);
        
        // Process each item in the order
        for (const item of items) {
          // Get the menu item to find its category
          const menuItem = await new Promise((resolve, reject) => {
            db.get(`SELECT category FROM menu_items WHERE id = ?`, [item.menu_item_id], (err, row) => {
              if (err) reject(err);
              else resolve(row);
            });
          });
          
          if (menuItem) {
            const category = menuItem.category;
            if (!categoryStats[category]) {
              categoryStats[category] = { category, quantity: 0, sales: 0 };
            }
            categoryStats[category].quantity += item.quantity;
            categoryStats[category].sales += item.price * item.quantity;
          }
        }
      } catch (e) {
        console.error('Error parsing order items:', e);
      }
    }
    
    const result = Object.values(categoryStats);
    
    // If no data, return default categories with 0 values
    if (result.length === 0) {
      const defaultCategories = [
        { category: 'Burgers', quantity: 0, sales: 0 },
        { category: 'Sides', quantity: 0, sales: 0 },
        { category: 'Drinks', quantity: 0, sales: 0 },
        { category: 'Desserts', quantity: 0, sales: 0 }
      ];
      res.json(defaultCategories);
    } else {
      res.json(result);
    }
  });
});

app.get('/api/dashboard/hourly-sales', (req, res) => {
  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format in local time
  
  db.all(`SELECT 
    strftime('%H', datetime(created_at, 'localtime')) as hour,
    COUNT(*) as transactions,
    SUM(total_amount) as sales
    FROM orders 
    WHERE DATE(datetime(created_at, 'localtime')) = ? AND payment_status = 'paid'
    GROUP BY strftime('%H', datetime(created_at, 'localtime'))
    ORDER BY hour`, [today], (err, rows) => {
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
app.get('/api/dashboard/recent-orders', (req, res) => {
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
      items: JSON.parse(order.items)
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
app.post('/api/menu', (req, res) => {
  const { name, price, category, ingredients } = req.body;
  const id = uuidv4();
  
  db.run(`INSERT INTO menu_items (id, name, price, category, ingredients) 
          VALUES (?, ?, ?, ?, ?)`, 
          [id, name, price, category, JSON.stringify(ingredients)], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    io.emit('menu_updated');
    res.json({ id, message: 'Menu item added successfully' });
  });
});

// Update menu item
app.put('/api/menu/:id', (req, res) => {
  const { id } = req.params;
  const { name, price, category, ingredients } = req.body;
  
  db.run(`UPDATE menu_items 
          SET name = ?, price = ?, category = ?, ingredients = ?
          WHERE id = ?`, 
          [name, price, category, JSON.stringify(ingredients), id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    io.emit('menu_updated');
    res.json({ message: 'Menu item updated successfully' });
  });
});

// Delete menu item
app.delete('/api/menu/:id', (req, res) => {
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
app.post('/api/menu/bulk', (req, res) => {
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

// Delete order
app.delete('/api/orders/:id', (req, res) => {
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

app.delete('/api/expenditures/:id', (req, res) => {
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

app.post('/api/orders', async (req, res) => {
  const { items, total_amount } = req.body;
  
  try {
    const orderId = await generateOrderId();
  
    // Process inventory deduction
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
        
        // Deduct ingredients from inventory
        for (const ingredient of ingredients) {
          const totalNeeded = ingredient.quantity * orderItem.quantity;
          
          await new Promise((resolve, reject) => {
            db.run(`UPDATE inventory 
                    SET quantity = quantity - ? 
                    WHERE name = ? AND quantity >= ?`, 
                    [totalNeeded, ingredient.name, totalNeeded], function(err) {
              if (err) reject(err);
              else resolve();
            });
          });
        }
      }
    }
    
    // Save order
    db.run(`INSERT INTO orders (id, items, total_amount) VALUES (?, ?, ?)`, 
           [orderId, JSON.stringify(items), total_amount], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      io.emit('inventory_updated');
      io.emit('new_order', { id: orderId, items, total_amount });
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
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});