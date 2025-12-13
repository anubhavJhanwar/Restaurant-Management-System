// BurgerBoss API with Firebase Integration
const { v4: uuidv4 } = require('uuid');
const { db } = require('./firebase-config');

// Database service layer
class DatabaseService {
  // Menu Items
  static async getMenuItems() {
    try {
      const snapshot = await db.collection('menuItems').get();
      const items = [];
      snapshot.forEach(doc => {
        items.push({ id: doc.id, ...doc.data() });
      });
      
      // Return default items if empty
      if (items.length === 0) {
        return [
          {
            id: '1',
            name: 'Aloo Tikki Burger',
            price: 80,
            category: 'Burgers',
            ingredients: [
              { name: 'Aloo Patty', quantity: 1, unit: 'pieces' },
              { name: 'Bun', quantity: 1, unit: 'pieces' },
              { name: 'Cheese Slice', quantity: 1, unit: 'pieces' }
            ],
            active: true,
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            name: 'Veg Burger',
            price: 90,
            category: 'Burgers',
            ingredients: [
              { name: 'Veg Patty', quantity: 1, unit: 'pieces' },
              { name: 'Bun', quantity: 1, unit: 'pieces' },
              { name: 'Cheese Slice', quantity: 1, unit: 'pieces' }
            ],
            active: true,
            created_at: new Date().toISOString()
          }
        ];
      }
      
      return items;
    } catch (error) {
      console.error('Error getting menu items:', error);
      return [];
    }
  }

  static async addMenuItem(item) {
    try {
      const docRef = await db.collection('menuItems').add({
        ...item,
        created_at: new Date().toISOString()
      });
      return { id: docRef.id, ...item };
    } catch (error) {
      console.error('Error adding menu item:', error);
      throw error;
    }
  }

  // Inventory
  static async getInventory() {
    try {
      const snapshot = await db.collection('inventory').get();
      const items = [];
      snapshot.forEach(doc => {
        items.push({ id: doc.id, ...doc.data() });
      });
      
      // Return default items if empty
      if (items.length === 0) {
        return [
          { id: '1', name: 'Aloo Patty', quantity: 50, unit: 'pieces', low_stock_threshold: 10 },
          { id: '2', name: 'Buns', quantity: 100, unit: 'pieces', low_stock_threshold: 20 },
          { id: '3', name: 'Cheese Slices', quantity: 80, unit: 'pieces', low_stock_threshold: 15 },
          { id: '4', name: 'Veg Patty', quantity: 30, unit: 'pieces', low_stock_threshold: 10 },
          { id: '5', name: 'Paneer Patty', quantity: 25, unit: 'pieces', low_stock_threshold: 10 }
        ];
      }
      
      return items;
    } catch (error) {
      console.error('Error getting inventory:', error);
      return [];
    }
  }

  static async addInventoryItem(item) {
    try {
      const docRef = await db.collection('inventory').add({
        ...item,
        created_at: new Date().toISOString()
      });
      return { id: docRef.id, ...item };
    } catch (error) {
      console.error('Error adding inventory item:', error);
      throw error;
    }
  }

  // Expenditures
  static async getExpenditures() {
    try {
      const snapshot = await db.collection('expenditures').get();
      const items = [];
      snapshot.forEach(doc => {
        items.push({ id: doc.id, ...doc.data() });
      });
      return items;
    } catch (error) {
      console.error('Error getting expenditures:', error);
      return [];
    }
  }

  static async addExpenditure(item) {
    try {
      const docRef = await db.collection('expenditures').add({
        ...item,
        created_at: new Date().toISOString()
      });
      return { id: docRef.id, ...item };
    } catch (error) {
      console.error('Error adding expenditure:', error);
      throw error;
    }
  }
}

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url, method, body } = req;

  try {
    // Test endpoint
    if (url === '/api/test') {
      return res.json({ message: 'BurgerBoss API with Firebase - Working!', timestamp: new Date().toISOString() });
    }

    // Auth endpoint
    if (url === '/api/auth' && method === 'POST') {
      const { username, password } = body || {};
      
      if (username === 'demo' && password === 'demo123') {
        return res.json({
          message: 'Login successful',
          token: 'demo-token',
          user: { id: '1', username: 'demo', role: 'Owner', full_name: 'Demo User' }
        });
      }
      
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Menu endpoints
    if (url === '/api/menu') {
      if (method === 'GET') {
        const menuItems = await DatabaseService.getMenuItems();
        return res.json(menuItems);
      }
      
      if (method === 'POST') {
        const { name, price, category, ingredients, items } = body || {};
        
        // Handle bulk upload
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
              ],
              active: true
            };
            
            const result = await DatabaseService.addMenuItem(newItem);
            results.push(result);
          }
          return res.json({ message: `${results.length} items added successfully`, items: results });
        }
        
        // Handle single item
        if (name && price) {
          const newItem = {
            name: name,
            price: parseFloat(price),
            category: category || 'Burgers',
            ingredients: [
              { name: 'Bun', quantity: 1, unit: 'pieces' },
              { name: name + ' Patty', quantity: 1, unit: 'pieces' }
            ],
            active: true
          };
          
          const result = await DatabaseService.addMenuItem(newItem);
          return res.json({ message: 'Menu item added successfully', item: result });
        }
        
        return res.status(400).json({ error: 'Name and price required' });
      }
    }

    // Inventory endpoints
    if (url === '/api/inventory') {
      if (method === 'GET') {
        const inventory = await DatabaseService.getInventory();
        return res.json(inventory);
      }
      
      if (method === 'POST') {
        const { name, quantity, unit, low_stock_threshold } = body || {};
        
        if (name && quantity && unit) {
          const newItem = {
            name,
            quantity: parseFloat(quantity),
            unit,
            low_stock_threshold: parseFloat(low_stock_threshold) || 10
          };
          
          const result = await DatabaseService.addInventoryItem(newItem);
          return res.json({ message: 'Inventory item added successfully', item: result });
        }
        
        return res.status(400).json({ error: 'Name, quantity, and unit required' });
      }
    }

    // Expenditures endpoints
    if (url === '/api/expenditures') {
      if (method === 'GET') {
        const expenditures = await DatabaseService.getExpenditures();
        return res.json(expenditures);
      }
      
      if (method === 'POST') {
        const { description, amount, category, supplier } = body || {};
        
        if (description && amount && category) {
          const newExpenditure = {
            description,
            amount: parseFloat(amount),
            category,
            supplier: supplier || '',
            payment_status: 'pending'
          };
          
          const result = await DatabaseService.addExpenditure(newExpenditure);
          return res.json({ 
            message: 'Expenditure added successfully',
            expenditure: result
          });
        }
        
        return res.status(400).json({ error: 'Description, amount, and category required' });
      }
    }

    // Orders endpoints
    if (url === '/api/orders' || url === '/api/orders/today') {
      if (method === 'GET') {
        return res.json([]);
      }
      
      if (method === 'POST') {
        return res.json({ message: 'Order created successfully' });
      }
    }

    // Menu extras endpoint
    if (url === '/api/menu-extras') {
      if (method === 'GET') {
        return res.json([
          { id: '1', name: 'Extra Cheese Slice', price: 15, category: 'Add-ons', active: true }
        ]);
      }
    }

    // Dashboard endpoints
    if (url === '/api/dashboard/stats') {
      return res.json({ total_sales: 0, total_orders: 0, today_sales: 0, today_orders: 0 });
    }

    if (url === '/api/dashboard/hourly-sales') {
      const hourlySales = Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        sales: Math.floor(Math.random() * 1000)
      }));
      return res.json(hourlySales);
    }

    if (url === '/api/dashboard/top-products') {
      return res.json([]);
    }

    return res.status(404).json({ error: 'Endpoint not found' });
    
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};