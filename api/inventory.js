// Inventory API endpoint for Vercel
export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', 'https://restaurant-management-system-sepla.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Simple in-memory inventory store for demo
  const inventory = [
    { id: '1', name: 'Aloo Patty', quantity: 50, unit: 'pieces', low_stock_threshold: 10 },
    { id: '2', name: 'Buns', quantity: 100, unit: 'pieces', low_stock_threshold: 20 },
    { id: '3', name: 'Cheese Slices', quantity: 80, unit: 'pieces', low_stock_threshold: 15 }
  ];

  if (req.method === 'GET') {
    return res.json(inventory);
  }

  if (req.method === 'POST') {
    return res.json({ message: 'Inventory item added successfully' });
  }

  res.status(405).json({ error: 'Method not allowed' });
}