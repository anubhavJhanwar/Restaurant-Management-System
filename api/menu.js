// Menu API endpoint for Vercel
export default function handler(req, res) {
  // Enable CORS for all origins (for demo)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Simple in-memory menu store for demo
  const menuItems = [
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
    },
    {
      id: '3',
      name: 'Paneer Burger',
      price: 100,
      category: 'Burgers', 
      ingredients: ['Paneer Patty', 'Bun', 'Cheese Slice'],
      active: true,
      created_at: new Date().toISOString()
    }
  ];

  if (req.method === 'GET') {
    return res.json(menuItems);
  }

  if (req.method === 'POST') {
    // For demo, just return success
    return res.json({ 
      message: 'Menu items uploaded successfully',
      count: req.body.items ? req.body.items.length : 1
    });
  }

  res.status(405).json({ error: 'Method not allowed' });
}