// Menu API endpoint for Vercel - with persistent storage
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// In-memory storage that persists during function lifetime
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
    return res.json(menuItems);
  }

  if (req.method === 'POST') {
    const { name, price, category, ingredients, items } = req.body;
    
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
  }

  if (req.method === 'PUT') {
    const { id, name, price, category, ingredients } = req.body;
    
    const itemIndex = menuItems.findIndex(item => item.id === id);
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    menuItems[itemIndex] = {
      ...menuItems[itemIndex],
      name: name || menuItems[itemIndex].name,
      price: price ? parseFloat(price) : menuItems[itemIndex].price,
      category: category || menuItems[itemIndex].category,
      ingredients: ingredients || menuItems[itemIndex].ingredients
    };
    
    return res.json({ 
      message: 'Menu item updated successfully',
      item: menuItems[itemIndex]
    });
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    
    const itemIndex = menuItems.findIndex(item => item.id === id);
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    menuItems.splice(itemIndex, 1);
    
    return res.json({ message: 'Menu item deleted successfully' });
  }

  res.status(405).json({ error: 'Method not allowed' });
}