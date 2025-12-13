// Inventory API endpoint for Vercel - with persistent storage
const { v4: uuidv4 } = require('uuid');

// In-memory storage that persists during function lifetime
let inventory = [
  { id: '1', name: 'Aloo Patty', quantity: 50, unit: 'pieces', low_stock_threshold: 10, created_at: new Date().toISOString() },
  { id: '2', name: 'Buns', quantity: 100, unit: 'pieces', low_stock_threshold: 20, created_at: new Date().toISOString() },
  { id: '3', name: 'Cheese Slices', quantity: 80, unit: 'pieces', low_stock_threshold: 15, created_at: new Date().toISOString() },
  { id: '4', name: 'Veg Patty', quantity: 30, unit: 'pieces', low_stock_threshold: 10, created_at: new Date().toISOString() },
  { id: '5', name: 'Paneer Patty', quantity: 25, unit: 'pieces', low_stock_threshold: 10, created_at: new Date().toISOString() }
];

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    return res.json(inventory);
  }

  if (req.method === 'POST') {
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
  }

  if (req.method === 'PUT') {
    const { id } = req.query;
    const { name, quantity, unit, low_stock_threshold } = req.body;
    
    const itemIndex = inventory.findIndex(item => item.id === id);
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    
    inventory[itemIndex] = {
      ...inventory[itemIndex],
      name: name || inventory[itemIndex].name,
      quantity: quantity !== undefined ? parseFloat(quantity) : inventory[itemIndex].quantity,
      unit: unit || inventory[itemIndex].unit,
      low_stock_threshold: low_stock_threshold !== undefined ? parseFloat(low_stock_threshold) : inventory[itemIndex].low_stock_threshold,
      updated_at: new Date().toISOString()
    };
    
    return res.json({ 
      message: 'Inventory item updated successfully',
      item: inventory[itemIndex]
    });
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    
    const itemIndex = inventory.findIndex(item => item.id === id);
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    
    inventory.splice(itemIndex, 1);
    
    return res.json({ message: 'Inventory item deleted successfully' });
  }

  res.status(405).json({ error: 'Method not allowed' });
}