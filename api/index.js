// Clean BurgerBoss API - Complete Firebase Integration
const FirebaseService = require('./firebase-service');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'burgerboss-secret-key';

// Helper function to verify JWT token
function verifyToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  
  const token = authHeader.split(' ')[1];
  if (!token) return null;
  
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url, method } = req;
  const body = req.body || {};

  try {
    
    // ==================== HEALTH CHECK ====================
    if (url === '/api/test' || url === '/api') {
      return res.json({ 
        message: 'BurgerBoss API - Firebase Ready!', 
        timestamp: new Date().toISOString(),
        firebase_connected: require('./firebase-config').isConnected(),
        environment: process.env.NODE_ENV || 'development'
      });
    }

    // ==================== AUTHENTICATION ====================
    if (url === '/api/auth/login' && method === 'POST') {
      const { username, password } = body;
      
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
      }
      
      try {
        const user = await FirebaseService.authenticateUser(username, password);
        
        const token = jwt.sign(
          { userId: user.id, username: user.username, role: user.role },
          JWT_SECRET,
          { expiresIn: '24h' }
        );
        
        return res.json({
          message: 'Login successful',
          token,
          user: {
            id: user.id,
            username: user.username,
            role: user.role,
            full_name: user.full_name
          }
        });
        
      } catch (error) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    }

    if (url === '/api/auth/signup' && method === 'POST') {
      const { username, password, full_name, pin } = body;
      
      if (!username || !password || !pin) {
        return res.status(400).json({ error: 'Username, password, and PIN required' });
      }
      
      try {
        const user = await FirebaseService.createUser({
          username,
          password,
          full_name: full_name || username,
          pin,
          role: 'Owner'
        });
        
        return res.json({
          message: 'Account created successfully',
          user: {
            id: user.id,
            username: user.username,
            role: user.role,
            full_name: user.full_name
          }
        });
        
      } catch (error) {
        return res.status(400).json({ error: error.message });
      }
    }

    if (url === '/api/auth/verify-pin' && method === 'POST') {
      const { pin } = body;
      const user = verifyToken(req);
      
      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const isValid = await FirebaseService.verifyPin(user.userId, pin);
      return res.json({ valid: isValid });
    }

    // ==================== PROTECTED ROUTES ====================
    // Verify authentication for all other routes
    const user = verifyToken(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // ==================== MENU MANAGEMENT ====================
    if (url === '/api/menu') {
      if (method === 'GET') {
        const menuItems = await FirebaseService.getAllMenuItems();
        return res.json(menuItems);
      }
      
      if (method === 'POST') {
        const { name, price, category, ingredients, items, buns, patties, additionalIngredients } = body;
        
        // Handle bulk upload (Excel)
        if (items && Array.isArray(items)) {
          const results = [];
          for (const item of items) {
            const newItem = {
              name: item.name,
              price: parseFloat(item.price) || 0,
              category: item.category || 'Burgers',
              ingredients: [
                { name: 'Bun', quantity: 1, unit: 'pieces' },
                { name: item.name + ' Patty', quantity: 1, unit: 'pieces' }
              ]
            };
            
            const result = await FirebaseService.addMenuItem(newItem);
            results.push(result);
          }
          return res.json({ 
            message: `${results.length} items added successfully`, 
            items: results 
          });
        }
        
        // Handle single item
        if (name && price) {
          const newIngredients = [];
          
          // Add buns
          if (buns && parseInt(buns) > 0) {
            newIngredients.push({ name: 'Bun', quantity: parseInt(buns), unit: 'pieces' });
          }
          
          // Add patties
          if (patties && patties.type && parseInt(patties.quantity) > 0) {
            newIngredients.push({ 
              name: patties.type, 
              quantity: parseInt(patties.quantity), 
              unit: 'pieces' 
            });
          }
          
          // Add additional ingredients
          if (additionalIngredients && Array.isArray(additionalIngredients)) {
            additionalIngredients.forEach(ing => {
              if (ing.name && ing.quantity) {
                newIngredients.push({
                  name: ing.name,
                  quantity: parseFloat(ing.quantity),
                  unit: ing.unit || 'pieces'
                });
              }
            });
          }
          
          // Default ingredients if none provided
          if (newIngredients.length === 0) {
            newIngredients.push(
              { name: 'Bun', quantity: 1, unit: 'pieces' },
              { name: name + ' Patty', quantity: 1, unit: 'pieces' }
            );
          }
          
          const result = await FirebaseService.addMenuItem({
            name,
            price: parseFloat(price),
            category: category || 'Burgers',
            ingredients: newIngredients
          });
          
          return res.json({ 
            message: 'Menu item added successfully', 
            item: result 
          });
        }
        
        return res.status(400).json({ error: 'Name and price required' });
      }
    }

    if (url.startsWith('/api/menu/') && method === 'DELETE') {
      const itemId = url.split('/').pop();
      await FirebaseService.deleteMenuItem(itemId);
      return res.json({ message: 'Menu item deleted successfully' });
    }

    // ==================== INVENTORY MANAGEMENT ====================
    if (url === '/api/inventory') {
      if (method === 'GET') {
        const inventory = await FirebaseService.getAllInventory();
        return res.json(inventory);
      }
      
      if (method === 'POST') {
        const { name, quantity, unit, low_stock_threshold } = body;
        
        if (!name || !quantity || !unit) {
          return res.status(400).json({ error: 'Name, quantity, and unit required' });
        }
        
        const result = await FirebaseService.addInventoryItem({
          name,
          quantity: parseFloat(quantity),
          unit,
          low_stock_threshold: parseFloat(low_stock_threshold) || 10
        });
        
        return res.json({ 
          message: 'Inventory item added successfully', 
          item: result 
        });
      }
    }

    // ==================== EXPENDITURE MANAGEMENT ====================
    if (url === '/api/expenditures') {
      if (method === 'GET') {
        const expenditures = await FirebaseService.getAllExpenditures();
        return res.json(expenditures);
      }
      
      if (method === 'POST') {
        const { description, amount, category, supplier } = body;
        
        if (!description || !amount || !category) {
          return res.status(400).json({ error: 'Description, amount, and category required' });
        }
        
        const result = await FirebaseService.addExpenditure({
          description,
          amount: parseFloat(amount),
          category,
          supplier: supplier || ''
        });
        
        return res.json({ 
          message: 'Expenditure added successfully',
          expenditure: result
        });
      }
    }

    if (url.startsWith('/api/expenditures/') && method === 'DELETE') {
      const expenditureId = url.split('/').pop();
      await FirebaseService.deleteExpenditure(expenditureId);
      return res.json({ message: 'Expenditure deleted successfully' });
    }

    // ==================== ORDER MANAGEMENT ====================
    if (url === '/api/orders') {
      if (method === 'GET') {
        const orders = await FirebaseService.getAllOrders();
        return res.json(orders);
      }
      
      if (method === 'POST') {
        const result = await FirebaseService.addOrder(body);
        return res.json({ 
          message: 'Order created successfully', 
          order: result 
        });
      }
    }

    if (url === '/api/orders/today') {
      const todaysOrders = await FirebaseService.getTodaysOrders();
      return res.json(todaysOrders);
    }

    // ==================== MENU EXTRAS ====================
    if (url === '/api/menu-extras') {
      return res.json([
        { id: '1', name: 'Extra Cheese Slice', price: 15, category: 'Add-ons', active: true }
      ]);
    }

    // ==================== DASHBOARD ANALYTICS ====================
    if (url === '/api/dashboard/stats') {
      const stats = await FirebaseService.getDashboardStats();
      return res.json(stats);
    }

    if (url === '/api/dashboard/hourly-sales') {
      // Generate sample hourly data - you can enhance this with real Firebase queries
      const hourlySales = Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        sales: Math.floor(Math.random() * 1000)
      }));
      return res.json(hourlySales);
    }

    if (url === '/api/dashboard/top-products') {
      // You can implement this with Firebase aggregation queries
      return res.json([]);
    }

    // ==================== ADMIN FUNCTIONS ====================
    if (url === '/api/admin/clear-data' && method === 'POST') {
      if (user.role !== 'Owner') {
        return res.status(403).json({ error: 'Owner access required' });
      }
      
      const result = await FirebaseService.clearAllData();
      return res.json(result);
    }

    return res.status(404).json({ error: 'Endpoint not found' });
    
  } catch (error) {
    console.error('❌ API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
};