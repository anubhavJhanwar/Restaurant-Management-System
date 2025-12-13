// Orders API endpoint for Vercel
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

  // Simple demo orders
  const orders = [
    {
      id: '1',
      items: [{ name: 'Aloo Tikki Burger', quantity: 2, price: 80 }],
      total_amount: 160,
      payment_status: 'paid',
      payment_method: 'cash',
      status: 'completed',
      locked: false,
      created_at: new Date().toISOString()
    }
  ];

  if (req.method === 'GET') {
    return res.json(orders);
  }

  if (req.method === 'POST') {
    return res.json({ 
      message: 'Order created successfully',
      order: { id: Date.now().toString(), ...req.body }
    });
  }

  res.status(405).json({ error: 'Method not allowed' });
}