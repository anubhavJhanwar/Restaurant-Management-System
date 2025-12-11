import React, { useState, useEffect } from 'react';
import { Plus, Receipt, DollarSign, Clock, Hash, CheckCircle, XCircle, Edit3, Trash2 } from 'lucide-react';
import io from 'socket.io-client';

const TodaysOrders = () => {
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [showEditOrderModal, setShowEditOrderModal] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [socket, setSocket] = useState(null);
  const [newOrder, setNewOrder] = useState({
    items: [],
    total_amount: 0
  });
  const [selectedMenuItem, setSelectedMenuItem] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Fetch initial data
    fetchTodaysOrders();
    fetchMenuItems();

    // Listen for real-time updates
    newSocket.on('new_order', () => {
      fetchTodaysOrders();
    });

    newSocket.on('order_updated', () => {
      fetchTodaysOrders();
    });

    return () => newSocket.close();
  }, []);

  const fetchTodaysOrders = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/orders/today');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching today\'s orders:', error);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/menu');
      const data = await response.json();
      setMenuItems(data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  const addItemToOrder = () => {
    if (!selectedMenuItem || quantity <= 0) return;

    const menuItem = menuItems.find(item => item.id === selectedMenuItem);
    if (!menuItem) return;

    const existingItemIndex = newOrder.items.findIndex(item => item.menu_item_id === selectedMenuItem);
    
    let updatedItems;
    if (existingItemIndex >= 0) {
      updatedItems = [...newOrder.items];
      updatedItems[existingItemIndex].quantity += quantity;
    } else {
      updatedItems = [...newOrder.items, {
        menu_item_id: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: quantity
      }];
    }

    const total = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    setNewOrder({
      ...newOrder,
      items: updatedItems,
      total_amount: total
    });

    setSelectedMenuItem('');
    setQuantity(1);
  };

  const removeItemFromOrder = (index) => {
    const updatedItems = newOrder.items.filter((_, i) => i !== index);
    const total = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    setNewOrder({
      ...newOrder,
      items: updatedItems,
      total_amount: total
    });
  };

  const submitOrder = async () => {
    if (newOrder.items.length === 0) {
      alert('Please add items to the order');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newOrder),
      });

      if (response.ok) {
        setShowNewOrderModal(false);
        setNewOrder({
          items: [],
          total_amount: 0
        });
        fetchTodaysOrders();
      }
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  const updatePaymentStatus = async (orderId, status) => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/payment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ payment_status: status }),
      });

      if (response.ok) {
        fetchTodaysOrders();
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(value);
  };

  const generateBill = (order) => {
    setSelectedOrder(order);
    setShowBillModal(true);
  };

  const printBill = () => {
    window.print();
  };

  const editOrder = (order) => {
    setEditingOrder(order);
    setNewOrder({
      items: [...order.items],
      total_amount: order.total_amount
    });
    setShowEditOrderModal(true);
  };

  const updateOrder = async () => {
    if (newOrder.items.length === 0) {
      alert('Please add items to the order');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/orders/${editingOrder.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newOrder),
      });

      if (response.ok) {
        setShowEditOrderModal(false);
        setEditingOrder(null);
        setNewOrder({
          items: [],
          total_amount: 0
        });
        fetchTodaysOrders();
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const deleteOrder = async (orderId) => {
    try {
        const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchTodaysOrders();
        }
      } catch (error) {
        console.error('Error deleting order:', error);
      }
  };

  const todaysStats = {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + order.total_amount, 0),
    paidOrders: orders.filter(order => order.payment_status === 'paid').length,
    unpaidOrders: orders.filter(order => order.payment_status === 'unpaid').length
  };

  return (
    <div className="orders-container" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#33312E' }}>Today's Orders</h1>
        <button 
          onClick={() => setShowNewOrderModal(true)}
          style={{
            backgroundColor: '#ff8c42',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '16px',
            boxShadow: '0 4px 12px rgba(255, 140, 66, 0.3)'
          }}
        >
          <Plus size={20} />
          New Order
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px', 
        marginBottom: '30px' 
      }}>
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          borderLeft: '4px solid #ff8c42'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Receipt size={24} style={{ color: '#ff8c42' }} />
            <span style={{ fontSize: '14px', color: '#666' }}>Total Orders</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#33312E' }}>
            {todaysStats.totalOrders}
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          borderLeft: '4px solid #22c55e'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <DollarSign size={24} style={{ color: '#22c55e' }} />
            <span style={{ fontSize: '14px', color: '#666' }}>Total Revenue</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#33312E' }}>
            {formatCurrency(todaysStats.totalRevenue)}
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          borderLeft: '4px solid #3b82f6'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <CheckCircle size={24} style={{ color: '#3b82f6' }} />
            <span style={{ fontSize: '14px', color: '#666' }}>Paid Orders</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#33312E' }}>
            {todaysStats.paidOrders}
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          borderLeft: '4px solid #ef4444'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <XCircle size={24} style={{ color: '#ef4444' }} />
            <span style={{ fontSize: '14px', color: '#666' }}>Unpaid Orders</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#33312E' }}>
            {todaysStats.unpaidOrders}
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #f3f4f6' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#33312E' }}>Orders List</h3>
        </div>
        
        <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
          {orders.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
              No orders today yet
            </div>
          ) : (
            orders.map((order, index) => (
              <div key={order.id} style={{
                padding: '20px 24px',
                borderBottom: index < orders.length - 1 ? '1px solid #f3f4f6' : 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                    <div style={{
                      backgroundColor: '#ff8c42',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      #{order.id}
                    </div>
                    <span style={{ fontWeight: '600', fontSize: '16px' }}>
                      Order Transaction
                    </span>
                  </div>
                  
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                    {order.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                  </div>
                  
                  <div style={{ fontSize: '12px', color: '#999' }}>
                    {new Date(order.created_at).toLocaleString()}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#22c55e' }}>
                      {formatCurrency(order.total_amount)}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: order.payment_status === 'paid' ? '#22c55e' : '#ef4444',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: '4px'
                    }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: order.payment_status === 'paid' ? '#22c55e' : '#ef4444',
                        borderRadius: '50%'
                      }}></div>
                      {order.payment_status}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => generateBill(order)}
                      style={{
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      Bill
                    </button>

                    <button
                      onClick={() => editOrder(order)}
                      style={{
                        backgroundColor: '#f59e0b',
                        color: 'white',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Edit3 size={14} />
                      Edit
                    </button>

                    <button
                      onClick={() => deleteOrder(order.id)}
                      style={{
                        backgroundColor: '#6b7280',
                        color: 'white',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                    
                    {order.payment_status === 'unpaid' ? (
                      <button
                        onClick={() => updatePaymentStatus(order.id, 'paid')}
                        style={{
                          backgroundColor: '#22c55e',
                          color: 'white',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Mark Paid
                      </button>
                    ) : (
                      <button
                        onClick={() => updatePaymentStatus(order.id, 'unpaid')}
                        style={{
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Mark Unpaid
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* New Order Modal */}
      {showNewOrderModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '600px' }}>
            <h2 className="modal-title">Create New Order</h2>
            


            <div className="form-group">
              <label className="form-label">Add Items</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <select
                  value={selectedMenuItem}
                  onChange={(e) => setSelectedMenuItem(e.target.value)}
                  className="form-input"
                  style={{ flex: 2 }}
                >
                  <option value="">Select menu item</option>
                  {menuItems.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} - {formatCurrency(item.price)}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="form-input"
                  style={{ flex: 1 }}
                  placeholder="Qty"
                />
                <button
                  type="button"
                  onClick={addItemToOrder}
                  style={{
                    backgroundColor: '#ff8c42',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Add
                </button>
              </div>
            </div>

            {/* Order Items */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Order Items:</h4>
              {newOrder.items.length === 0 ? (
                <p style={{ color: '#666', fontStyle: 'italic' }}>No items added yet</p>
              ) : (
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {newOrder.items.map((item, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      marginBottom: '8px'
                    }}>
                      <div>
                        <span style={{ fontWeight: '600' }}>{item.name}</span>
                        <span style={{ color: '#666', marginLeft: '8px' }}>
                          {item.quantity}x {formatCurrency(item.price)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontWeight: '600' }}>
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                        <button
                          onClick={() => removeItemFromOrder(index)}
                          style={{
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Total */}
            <div style={{
              padding: '16px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              marginBottom: '20px',
              textAlign: 'right'
            }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#33312E' }}>
                Total: {formatCurrency(newOrder.total_amount)}
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => setShowNewOrderModal(false)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn-primary"
                onClick={submitOrder}
                style={{ backgroundColor: '#ff8c42' }}
              >
                Create Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bill Modal */}
      {showBillModal && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '500px' }}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <img 
                src="/Logo Main.png" 
                alt="BurgerBoss Logo" 
                style={{
                  width: '80px',
                  height: 'auto',
                  marginBottom: '12px',
                  borderRadius: '8px'
                }}
              />
              <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>BurgerBoss</h2>
              <p style={{ color: '#666' }}>Restaurant Bill</p>
            </div>

            <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Order #:</span>
                <span style={{ fontWeight: '600' }}>{selectedOrder.id.slice(-8)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Date:</span>
                <span>{new Date(selectedOrder.created_at).toLocaleString()}</span>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ marginBottom: '12px' }}>Items:</h4>
              {selectedOrder.items.map((item, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px'
                }}>
                  <span>{item.quantity}x {item.name}</span>
                  <span>{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div style={{
              padding: '16px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: '700' }}>
                <span>Total:</span>
                <span>{formatCurrency(selectedOrder.total_amount)}</span>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginTop: '8px',
                fontSize: '14px',
                color: selectedOrder.payment_status === 'paid' ? '#22c55e' : '#ef4444'
              }}>
                <span>Payment Status:</span>
                <span style={{ fontWeight: '600', textTransform: 'uppercase' }}>
                  {selectedOrder.payment_status}
                </span>
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => setShowBillModal(false)}
              >
                Close
              </button>
              <button 
                type="button" 
                className="btn-primary"
                onClick={printBill}
                style={{ backgroundColor: '#ff8c42' }}
              >
                Print Bill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {showEditOrderModal && editingOrder && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '600px' }}>
            <h2 className="modal-title">Edit Order #{editingOrder.id}</h2>
            
            <div className="form-group">
              <label className="form-label">Add Items</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <select
                  value={selectedMenuItem}
                  onChange={(e) => setSelectedMenuItem(e.target.value)}
                  className="form-input"
                  style={{ flex: 2 }}
                >
                  <option value="">Select menu item</option>
                  {menuItems.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} - {formatCurrency(item.price)}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="form-input"
                  style={{ flex: 1 }}
                  placeholder="Qty"
                />
                <button
                  type="button"
                  onClick={addItemToOrder}
                  style={{
                    backgroundColor: '#ff8c42',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Add
                </button>
              </div>
            </div>

            {/* Order Items */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Order Items:</h4>
              {newOrder.items.length === 0 ? (
                <p style={{ color: '#666', fontStyle: 'italic' }}>No items in order</p>
              ) : (
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {newOrder.items.map((item, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      marginBottom: '8px'
                    }}>
                      <div>
                        <span style={{ fontWeight: '600' }}>{item.name}</span>
                        <span style={{ color: '#666', marginLeft: '8px' }}>
                          {item.quantity}x {formatCurrency(item.price)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontWeight: '600' }}>
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                        <button
                          onClick={() => removeItemFromOrder(index)}
                          style={{
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Total */}
            <div style={{
              padding: '16px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              marginBottom: '20px',
              textAlign: 'right'
            }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#33312E' }}>
                Total: {formatCurrency(newOrder.total_amount)}
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => {
                  setShowEditOrderModal(false);
                  setEditingOrder(null);
                  setNewOrder({ items: [], total_amount: 0 });
                }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn-primary"
                onClick={updateOrder}
                style={{ backgroundColor: '#ff8c42' }}
              >
                Update Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodaysOrders;