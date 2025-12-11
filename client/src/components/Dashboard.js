import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { TrendingUp, Edit3, Trash2 } from 'lucide-react';
import io from 'socket.io-client';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_sales: 0,
    total_orders: 0
  });
  const [hourlyData, setHourlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Fetch initial data
    fetchDashboardStats();
    fetchHourlyData();
    fetchCategoryData();
    fetchRecentOrders();

    // Listen for real-time updates
    newSocket.on('new_order', () => {
      fetchDashboardStats();
      fetchHourlyData();
      fetchCategoryData();
      fetchRecentOrders();
    });

    newSocket.on('sales_updated', () => {
      fetchDashboardStats();
      fetchHourlyData();
      fetchCategoryData();
      fetchRecentOrders();
    });

    newSocket.on('order_updated', () => {
      fetchRecentOrders();
    });

    return () => newSocket.close();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/dashboard/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const fetchHourlyData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/dashboard/hourly-sales');
      const data = await response.json();
      setHourlyData(data);
    } catch (error) {
      console.error('Error fetching hourly data:', error);
    }
  };

  const fetchCategoryData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/dashboard/category-sales');
      const data = await response.json();
      
      // Add colors to category data
      const colors = ['#ff8c42', '#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6'];
      const categoryWithColors = data.map((item, index) => ({
        ...item,
        color: colors[index % colors.length],
        value: item.sales || 0
      }));
      
      setCategoryData(categoryWithColors);
    } catch (error) {
      console.error('Error fetching category data:', error);
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/dashboard/recent-orders');
      const data = await response.json();
      setRecentOrders(data);
    } catch (error) {
      console.error('Error fetching recent orders:', error);
    }
  };





  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(value);
  };

  const deleteOrder = async (orderId) => {
    try {
        const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchRecentOrders();
          fetchDashboardStats();
        }
      } catch (error) {
        console.error('Error deleting order:', error);
      }
  };

  const editOrder = (orderId) => {
    // Redirect to Today's Orders page for editing
    window.location.hash = '#orders';
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Hello, Manager 👋</h1>
          <p style={{ color: '#666', marginTop: '4px' }}>
            Manage your restaurant with precision.
          </p>
        </div>
        <div className="user-info">
          <div className="user-avatar">M</div>
          <div>
            <div style={{ fontWeight: '600' }}>Manager</div>
            <div style={{ fontSize: '12px', color: '#666' }}>Admin</div>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Sales</div>
          <div className="stat-value">{formatCurrency(stats.total_sales || 0)}</div>
          <div className="stat-change">
            <TrendingUp size={16} />
            Today's Revenue
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">Total Orders</div>
          <div className="stat-value">{stats.total_orders || 0}</div>
          <div className="stat-change">
            <TrendingUp size={16} />
            Orders Completed
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3 className="chart-title">Hourly Transaction Amount</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="hour" 
                tickFormatter={(hour) => {
                  const h = parseInt(hour);
                  if (h === 0) return '12 AM';
                  if (h < 12) return `${h} AM`;
                  if (h === 12) return '12 PM';
                  return `${h-12} PM`;
                }}
                interval={1}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(hour) => {
                  const h = parseInt(hour);
                  const time = h === 0 ? '12:00 AM' : 
                               h < 12 ? `${h}:00 AM` : 
                               h === 12 ? '12:00 PM' : 
                               `${h-12}:00 PM`;
                  return `Time: ${time}`;
                }}
                formatter={(value) => [value, 'Transactions']}
              />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff8c42" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ff8c42" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <Line 
                type="monotone" 
                dataKey="transactions" 
                stroke="#ff8c42" 
                strokeWidth={3}
                dot={{ fill: '#ff8c42', strokeWidth: 2, r: 4 }}
                fill="url(#colorGradient)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Sales by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis tickFormatter={(value) => `₹${value}`} />
              <Tooltip formatter={(value) => [formatCurrency(value), 'Sales']} />
              <defs>
                <linearGradient id="categoryGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff8c42" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ff8c42" stopOpacity={0.3}/>
                </linearGradient>
              </defs>
              <Bar 
                dataKey="sales" 
                fill="url(#categoryGradient)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {categoryData.map((item, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#ff8c42',
                      borderRadius: '50%'
                    }}></div>
                    {item.category}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '600' }}>{formatCurrency(item.sales || 0)}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>{item.quantity || 0} items</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="chart-card">
        <h3 className="chart-title">Recent Orders & Payments</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {recentOrders.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
              No recent orders
            </div>
          ) : (
            recentOrders.map((order, index) => (
              <div key={order.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 0',
                borderBottom: index < recentOrders.length - 1 ? '1px solid #f3f4f6' : 'none'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: order.payment_status === 'paid' 
                    ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                    : 'linear-gradient(135deg, #ff8c42 0%, #ff7b25 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '12px'
                }}>
                  #{order.id.slice(-4)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>
                    Order #{order.id.slice(-8)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {order.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '600', fontSize: '14px' }}>
                      {formatCurrency(order.total_amount)}
                    </div>
                    <div style={{ 
                      fontSize: '11px', 
                      color: order.payment_status === 'paid' ? '#22c55e' : '#ff8c42',
                      fontWeight: '600',
                      textTransform: 'uppercase'
                    }}>
                      {order.payment_status}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={() => editOrder(order.id)}
                      style={{
                        backgroundColor: '#f59e0b',
                        color: 'white',
                        border: 'none',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px'
                      }}
                    >
                      <Edit3 size={12} />
                    </button>

                    <button
                      onClick={() => deleteOrder(order.id)}
                      style={{
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px'
                      }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>


    </div>
  );
};

export default Dashboard;