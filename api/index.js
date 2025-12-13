// Simple working API for BurgerBoss
const { v4: uuidv4 } = require('uuid');

// Simple in-memory storage (resets on function restart but works during session)
let data = {
  menuItems: [
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
      active: true
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
      active: true
    }
  ],
  inventory: [
    { id: '1', name: 'Aloo Patty', quantity: 50, unit: 'pieces' },
    { id: '2', name: 'Buns', quantity: 100, unit: 'pieces' },
    { id: '3', name: 'Cheese Slices', quantity: 80, unit: 'pieces' },
    { id: '4', name: 'Veg Patty', quantity: 30, unit: 'pieces' },
    { id: '5', name: 'Paneer Patty', quantity: 25, unit: 'pieces' }
  ],
  expenditures: []
};

module.exports = (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url, method, body } = req;
  
  console.log('API Request:', method, url, body); // Debug logging

  try {
    // Test endpoint
    if (url === '/api/test') {
      return res.json({ message: 'API Working!' });
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
        return res.json(data.menuItems);
      }
      
      if (method === 'POST') {
        console.log('Menu POST body:', body); // Debug
        
        const { name, price, category, ingredients, items } = body || {};
        
        // Handle bulk upload
        if (items && Array.isArray(items)) {
          items.forEach(item => {
            data.menuItems.push({
              id: uuidv4(),
              name: item.name,
              price: parseFloat(item.price) || 0,
              category: item.category || 'Burgers',
              ingredients: [
                { name: 'Bun', quantity: 1, unit: 'pieces' },
                { name: item.name + ' Patty', quantity: 1, unit: 'pieces' }
              ],
              active: true
            });
          });
          return res.json({ message: `${items.length} items added successfully` });
        }
        
        // Handle single item
        if (name && price) {
          const newItem = {
            id: uuidv4(),
            name: name,
            price: parseFloat(price),
            category: category || 'Burgers',
            ingredients: [
              { name: 'Bun', quantity: 1, unit: 'pieces' },
              { name: name + ' Patty', quantity: 1, unit: 'pieces' }
            ],
            active: true
          };
          
          data.menuItems.push(newItem);
          return res.json({ message: 'Menu item added successfully', item: newItem });
        }
        
        return res.status(400).json({ error: 'Name and price required' });
      }
    }

    // Inventory endpoints
    if (url === '/api/inventory') {
      if (method === 'GET') {
        return res.json(data.inventory);
      }
      
      if (method === 'POST') {
        const { name, quantity, unit } = body || {};
        
        if (name && quantity && unit) {
          data.inventory.push({
            id: uuidv4(),
            name,
            quantity: parseFloat(quantity),
            unit,
            low_stock_threshold: 10
          });
          return res.json({ message: 'Inventory item added successfully' });
        }
        
        return res.status(400).json({ error: 'Name, quantity, and unit required' });
      }
    }

    // Expenditures endpoints
    if (url === '/api/expenditures') {
      if (method === 'GET') {
        return res.json(data.expenditures);
      }
      
      if (method === 'POST') {
        console.log('Expenditure POST body:', body); // Debug
        
        const { description, amount, category, supplier } = body || {};
        
        if (description && amount && category) {
          const newExpenditure = {
            id: uuidv4(),
            description,
            amount: parseFloat(amount),
            category,
            supplier: supplier || '',
            payment_status: 'pending',
            created_at: new Date().toISOString()
          };
          
          data.expenditures.push(newExpenditure);
          return res.json({ 
            message: 'Expenditure added successfully',
            expenditure: newExpenditure
          });
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