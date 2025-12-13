import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Edit3, Trash2 } from 'lucide-react';
import io from 'socket.io-client';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_sales: 0,
    total_orders: 0,
    today_sales: 0,
    today_orders: 0
  });
  const [hourlyData, setHourlyData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [todayTopProducts, setTodayTopProducts] = useState([]);
  const [ingredientConsumption, setIngredientConsumption] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Fetch initial data
    fetchDashboardStats();
    fetchHourlyData();
    fetchTopProducts();
    fetchTodayTopProducts();
    fetchIngredientConsumption();
    fetchRecentOrders();

    // Listen for real-time updates
    newSocket.on('new_order', () => {
      fetchDashboardStats();
      fetchHourlyData();
      fetchTopProducts();
      fetchTodayTopProducts();
      fetchIngredientConsumption();
      fetchRecentOrders();
    });

    newSocket.on('sales_updated', () => {
      fetchDashboardStats();
      fetchHourlyData();
      fetchTopProducts();
      fetchTodayTopProducts();
      fetchIngredientConsumption();
      fetchRecentOrders();
    });

    newSocket.on('order_updated', () => {
      fetchRecentOrders();
    });

    return () => newSocket.close();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setStats(data || { total_sales: 0, total_orders: 0, today_sales: 0, today_orders: 0 });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setStats({ total_sales: 0, total_orders: 0, today_sales: 0, today_orders: 0 });
    }
  };

  const fetchHourlyData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/dashboard/hourly-sales', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setHourlyData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching hourly data:', error);
      setHourlyData([]);
    }
  };

  const fetchTopProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/dashboard/top-products', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setTopProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching top products:', error);
      setTopProducts([]);
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/dashboard/recent-orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      // Ensure data is always an array
      setRecentOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching recent orders:', error);
      setRecentOrders([]); // Set empty array on error
    }
  };

  const fetchTodayTopProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/dashboard/today-top-products', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setTodayTopProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching today top products:', error);
      setTodayTopProducts([]);
    }
  };

  const fetchIngredientConsumption = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/dashboard/ingredient-consumption', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setIngredientConsumption(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching ingredient consumption:', error);
      setIngredientConsumption([]);
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img 
            src="/Logo Main.png" 
            alt="BurgerBoss Logo" 
            style={{
              width: '60px',
              height: 'auto',
              borderRadius: '8px'
            }}
          />
          <div>
            <h1 className="dashboard-title">Hello, Burger Boss 👋</h1>
            <p style={{ color: '#666', marginTop: '4px' }}>
              Manage your restaurant with precision.
            </p>
          </div>
        </div>

      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Sales</div>
          <div className="stat-value">{formatCurrency(stats.total_sales || 0)}</div>
          <div className="stat-change">
            <TrendingUp size={16} />
            All Time Revenue
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">Total Orders</div>
          <div className="stat-value">{stats.total_orders || 0}</div>
          <div className="stat-change">
            <TrendingUp size={16} />
            All Time Orders
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">Today's Sales</div>
          <div className="stat-value">{formatCurrency(stats.today_sales || 0)}</div>
          <div className="stat-change">
            <TrendingUp size={16} />
            Today's Revenue
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">Today's Orders</div>
          <div className="stat-value">{stats.today_orders || 0}</div>
          <div className="stat-change">
            <TrendingUp size={16} />
            Today's Count
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3 className="chart-title">Overall Sales by Hour (All Time)</h3>
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
          <h3 className="chart-title">🏆 Top Selling Products (All Time)</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
            {topProducts.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                color: '#666', 
                padding: '40px 20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '12px',
                border: '2px dashed #e9ecef'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
                <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>No Sales Data Yet</div>
                <div style={{ fontSize: '14px' }}>Start taking orders to see your top products!</div>
              </div>
            ) : (
              topProducts.map((product, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  backgroundColor: index === 0 ? '#fff5f0' : '#f8f9fa',
                  borderRadius: '12px',
                  border: index === 0 ? '2px solid #ff8c42' : '1px solid #e9ecef',
                  position: 'relative',
                  transition: 'all 0.3s ease'
                }}>
                  {/* Rank Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '-8px',
                    left: '16px',
                    backgroundColor: index === 0 ? '#ff8c42' : index === 1 ? '#22c55e' : index === 2 ? '#3b82f6' : '#6b7280',
                    color: 'white',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '700'
                  }}>
                    {index + 1}
                  </div>
                  
                  <div style={{ flex: 1, marginLeft: '16px' }}>
                    <div style={{ 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      color: '#333',
                      marginBottom: '4px'
                    }}>
                      {product.name}
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#666',
                      backgroundColor: '#e9ecef',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      display: 'inline-block'
                    }}>
                      {product.category}
                    </div>
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '24px',
                    textAlign: 'center'
                  }}>
                    <div>
                      <div style={{ 
                        fontSize: '20px', 
                        fontWeight: '700', 
                        color: '#ff8c42'
                      }}>
                        {product.quantity}
                      </div>
                      <div style={{ 
                        fontSize: '11px', 
                        color: '#666',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Sold
                      </div>
                    </div>
                    
                    <div>
                      <div style={{ 
                        fontSize: '16px', 
                        fontWeight: '600', 
                        color: '#22c55e'
                      }}>
                        {formatCurrency(product.sales)}
                      </div>
                      <div style={{ 
                        fontSize: '11px', 
                        color: '#666',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Revenue
                      </div>
                    </div>
                    
                    <div>
                      <div style={{ 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: '#3b82f6'
                      }}>
                        {product.orders}
                      </div>
                      <div style={{ 
                        fontSize: '11px', 
                        color: '#666',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Orders
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* New sections grid */}
      <div className="charts-grid">
        {/* Today's Top Products */}
        <div className="chart-card">
          <h3 className="chart-title">🔥 Today's Top Sellers</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
            {todayTopProducts.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                color: '#666', 
                padding: '30px 20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '12px',
                border: '2px dashed #e9ecef'
              }}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>🌅</div>
                <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>No Sales Today Yet</div>
                <div style={{ fontSize: '12px' }}>Start taking orders to see today's top products!</div>
              </div>
            ) : (
              todayTopProducts.map((product, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  backgroundColor: '#f0fdf4',
                  borderRadius: '10px',
                  border: '1px solid #bbf7d0',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{
                      backgroundColor: '#22c55e',
                      color: 'white',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: '700'
                    }}>
                      {index + 1}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>
                        {product.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#666' }}>
                        {product.category}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#22c55e' }}>
                      {product.quantity} sold
                    </div>
                    <div style={{ fontSize: '11px', color: '#666' }}>
                      {formatCurrency(product.sales)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Ingredient Consumption */}
        <div className="chart-card">
          <h3 className="chart-title">📊 Ingredient Consumption</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
            {ingredientConsumption.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                color: '#666', 
                padding: '30px 20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '12px',
                border: '2px dashed #e9ecef'
              }}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>🥘</div>
                <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>No Consumption Data</div>
                <div style={{ fontSize: '12px' }}>Process orders to see ingredient usage!</div>
              </div>
            ) : (
              ingredientConsumption.map((ingredient, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  backgroundColor: '#fff7ed',
                  borderRadius: '8px',
                  border: '1px solid #fed7aa',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <div style={{
                      backgroundColor: '#ff8c42',
                      color: 'white',
                      width: '18px',
                      height: '18px',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '9px',
                      fontWeight: '700'
                    }}>
                      {index + 1}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#333' }}>
                        {ingredient.name}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#ff8c42' }}>
                      {ingredient.totalConsumed.toFixed(2)}
                    </div>
                    <div style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase' }}>
                      {ingredient.unit}
                    </div>
                  </div>
                </div>
              ))
            )}
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