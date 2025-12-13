import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import io from 'socket.io-client';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    unit: ''
  });

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:5000');

    // Fetch initial inventory
    fetchInventory();

    // Listen for real-time updates
    newSocket.on('inventory_updated', () => {
      fetchInventory();
    });

    return () => newSocket.close();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/inventory');
      const data = await response.json();
      setInventory(data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingItem 
        ? `http://localhost:5000/api/inventory/${editingItem.id}`
        : 'http://localhost:5000/api/inventory';
      
      const method = editingItem ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          quantity: parseFloat(formData.quantity)
        }),
      });

      if (response.ok) {
        setShowModal(false);
        setEditingItem(null);
        setFormData({
          name: '',
          quantity: '',
          unit: ''
        });
        fetchInventory();
      }
    } catch (error) {
      console.error('Error saving inventory item:', error);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      quantity: item.quantity.toString(),
      unit: item.unit
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
        const response = await fetch(`http://localhost:5000/api/inventory/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchInventory();
        }
      } catch (error) {
        console.error('Error deleting inventory item:', error);
      }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      quantity: '',
      unit: ''
    });
    setShowModal(true);
  };

  const quickAddItem = (name, unit) => {
    setEditingItem(null);
    setFormData({
      name: name,
      quantity: '',
      unit: unit
    });
    setShowModal(true);
  };

  return (
    <div className="inventory-container">
      <div className="inventory-header">
        <h1 className="inventory-title">Bulk Inventory Management</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '14px', color: '#666' }}>
            Add bulk ingredients that will be used in menu recipes
          </div>
          <button className="add-btn" onClick={openAddModal}>
            <Plus size={20} />
            Add Bulk Item
          </button>
        </div>
      </div>

      {/* Quick Add Common Items */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        marginBottom: '20px'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#33312E' }}>
          Quick Add Common Items
        </h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {[
            { name: 'Aloo Patty', unit: 'pieces' },
            { name: 'Chilli Herb Patty', unit: 'pieces' },
            { name: 'Veg Patty', unit: 'pieces' },
            { name: 'Paneer Patty', unit: 'pieces' },
            { name: 'Cheese Slices', unit: 'pieces' },
            { name: 'Buns', unit: 'pieces' },
            { name: 'Bread', unit: 'pieces' },
            { name: 'Fries', unit: 'kg' }
          ].map((item, index) => (
            <button
              key={index}
              onClick={() => quickAddItem(item.name, item.unit)}
              style={{
                backgroundColor: '#f8f9fa',
                border: '1px solid #e9ecef',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#ff8c42';
                e.target.style.color = 'white';
                e.target.style.borderColor = '#ff8c42';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#f8f9fa';
                e.target.style.color = '#33312E';
                e.target.style.borderColor = '#e9ecef';
              }}
            >
              + {item.name}
            </button>
          ))}
        </div>
      </div>

      <div className="inventory-grid">
        {inventory.map((item) => {
          return (
            <div 
              key={item.id} 
              className="inventory-card normal-stock"
            >
              <div className="inventory-actions">
                <button 
                  className="action-btn edit-btn" 
                  onClick={() => handleEdit(item)}
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  className="action-btn delete-btn" 
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="inventory-name">{item.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
                <div className="inventory-quantity">{item.quantity}</div>
                <div className="inventory-unit">{item.unit}</div>
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: item.quantity > 50 ? '#22c55e' : item.quantity > 20 ? '#f59e0b' : '#ef4444',
                fontWeight: '600',
                textTransform: 'uppercase'
              }}>
                {item.quantity > 50 ? 'Well Stocked' : item.quantity > 20 ? 'Medium Stock' : 'Low Stock'}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="modal-title">
              {editingItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Item Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className="form-input"
                  step="1"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Unit</label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                >
                  <option value="">Select unit</option>
                  <option value="pieces">Pieces</option>
                  <option value="kg">Kilograms</option>
                  <option value="liters">Liters</option>
                  <option value="grams">Grams</option>
                  <option value="ml">Milliliters</option>
                </select>
              </div>



              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingItem ? 'Update' : 'Add'} Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;