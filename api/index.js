const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const JWT_SECRET = process.env.JWT_SECRET || 'burgerboss-secret-key';

// Clean in-memory database - resets on each function call but works during session
let database = {
  users: [
    {
      id: '1',
      username: 'demo',
      email: 'demo@burgerboss.com',
      password: bcrypt.hashSync('demo123', 10),
      role: 'Owner',
      full_name: 'Demo Owner',
      pin: bcrypt.hashSync('1234', 10),
      created_at: new Date().toISOString()
    }
  ],
  menuItems: [
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
  ],
  inventory: [
    { id: '1', name: 'Aloo Patty', quantity: 50, unit: 'pieces', low_stock_threshold: 10 },
    { id: '2', name: 'Buns', quantity: 100, unit: 'pieces', low_stock_threshold: 20 },
    { id: '3', name: 'Cheese Slices', quantity: 80, unit: 'pieces', low_stock_threshold: 15 },
    { id: '4', name: 'Veg Patty', quantity: 30, unit: 'pieces', low_stock_threshold: 10 },
    { id: '5', name: 'Paneer Patty', quantity: 25, unit: 'pieces', low_stock_threshold: 10 }
  ],
  orders: [],
  expenditures: []
};

export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url, method, body } = req;
  
  try {
    // Route handling
    if (url === '/api/test') {
      return res.json({ message: 'API Working!', timestamp: new Date().toISOString() });
    }

    // AUTH ROUTES
    if (url === '/api/auth' && method === 'POST') {
      const { username, password } = body;
      
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
      }

      const user = database.users.find(u => u.username === username);
      
      if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role, full_name: user.full_name },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.json({
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
    }

    // MENU ROUTES
    if (url === '/api/menu') {
      if (method === 'GET') {
        return res.json(database.menuItems);
      }
      
      if (method === 'POST') {
        const { name, price, category, ingredients, items } = body;
        
        // Bulk upload
        if (items && Array.isArray(items)) {
          const newItems = items.map(item => ({
            id: uuidv4(),
            name: item.name,
            price: parseFloat(item.price) || 0,
            category: item.category || 'Burgers',
            ingredients: Array.isArray(item.ingredients) 
              ? item.ingredients 
              : (item.ingredients || '').split(',').map(i => i.trim()).filter(i => i),
            active: true,
            created_at: new Date().toISOString()
          }));
          
          database.menuItems.push(...newItems);
          return res.json({ message: `${newItems.length} items added successfully`, count: newItems.length });
        }
        
        // Single item
        if (name && price) {
          const newItem = {
            id: uuidv4(),
            name,
            price: parseFloat(price),
            category: category || 'Burgers',
            ingredients: Array.isArray(ingredients) 
              ? ingredients 
              : (ingredients || '').split(',').map(i => i.trim()).filter(i => i),
            active: true,
            created_at: new Date().toISOString()
          };
          
          database.menuItems.push(newItem);
          return res.json({ message: 'Menu item added successfully', item: newItem });
        }
        
        return res.status(400).json({ error: 'Name and price required' });
      }
      
      if (method === 'DELETE') {
        const { id } = req.query;
        const index = database.menuItems.findIndex(item => item.id === id);
        
        if (index === -1) {
          return res.status(404).json({ error: 'Item not found' });
        }
        
        database.menuItems.splice(index, 1);
        return res.json({ message: 'Item deleted successfully' });
      }
    }

    // INVENTORY ROUTES
    if (url === '/api/inventory') {
      if (method === 'GET') {
        return res.json(database.inventory);
      }
      
      if (method === 'POST') {
        const { name, quantity, unit, low_stock_threshold } = body;
        
        if (!name || quantity === undefined || !unit) {
          return res.status(400).json({ error: 'Name, quantity, and unit required' });
        }
        
        const newItem = {
          id: uuidv4(),
          name,
          quantity: parseFloat(quantity),
          unit,
          low_stock_threshold: parseFloat(low_stock_threshold) || 10,
          created_at: new Date().toISOString()
        };
        
        database.inventory.push(newItem);
        return res.json({ message: 'Inventory item added successfully', item: newItem });
      }
      
      if (method === 'DELETE') {
        const { id } = req.query;
        const index = database.inventory.findIndex(item => item.id === id);
        
        if (index === -1) {
          return res.status(404).json({ error: 'Item not found' });
        }
        
        database.inventory.splice(index, 1);
        return res.json({ message: 'Item deleted successfully' });
      }
    }

    // EXPENDITURE ROUTES
    if (url === '/api/expenditures') {
      if (method === 'GET') {
        return res.json(database.expenditures);
      }
      
      if (method === 'POST') {
        const { description, amount, category, supplier } = body;
        
        if (!description || !amount || !category) {
          return res.status(400).json({ error: 'Description, amount, and category required' });
        }
        
        const newExpenditure = {
          id: uuidv4(),
          description,
          amount: parseFloat(amount),
          category,
          supplier: supplier || '',
          payment_status: 'pending',
          created_at: new Date().toISOString()
        };
        
        database.expenditures.push(newExpenditure);
        return res.json({ message: 'Expenditure added successfully', expenditure: newExpenditure });
      }
      
      if (method === 'DELETE') {
        const { id } = req.query;
        const index = database.expenditures.findIndex(item => item.id === id);
        
        if (index === -1) {
          return res.status(404).json({ error: 'Expenditure not found' });
        }
        
        database.expenditures.splice(index, 1);
        return res.json({ message: 'Expenditure deleted successfully' });
      }
    }

    // ORDERS ROUTES
    if (url === '/api/orders' || url === '/api/orders/today') {
      if (method === 'GET') {
        if (url === '/api/orders/today') {
          const today = new Date().toDateString();
          const todayOrders = database.orders.filter(order => 
            new Date(order.created_at).toDateString() === today
          );
          return res.json(todayOrders);
        }
        return res.json(database.orders);
      }
      
      if (method === 'POST') {
        const newOrder = {
          id: uuidv4(),
          ...body,
          created_at: new Date().toISOString()
        };
        
        database.orders.push(newOrder);
        return res.json({ message: 'Order created successfully', order: newOrder });
      }
    }

    // Default response
    return res.status(404).json({ error: 'Endpoint not found' });
    
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}