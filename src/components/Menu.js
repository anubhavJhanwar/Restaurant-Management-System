import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Upload, Download, Edit3, Trash2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import io from 'socket.io-client';

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [newMenuItem, setNewMenuItem] = useState({
    name: '',
    price: '',
    category: '',
    ingredients: [],
    image: null,
    imagePreview: null,
    buns: 0,
    patties: 0,
    selectedPattyType: ''
  });
  const [newIngredient, setNewIngredient] = useState({ name: '', quantity: '' });

  useEffect(() => {
    fetchMenuItems();
    fetchInventory();

    // Listen for real-time updates
    const socket = io('http://localhost:5000');
    
    socket.on('menu_updated', () => {
      fetchMenuItems();
    });

    socket.on('inventory_updated', () => {
      fetchInventory();
    });

    return () => socket.close();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('/api/menu');
      const data = await response.json();
      setMenuItems(data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  const fetchInventory = async () => {
    try {
      const response = await fetch('/api/inventory');
      const data = await response.json();
      setInventory(data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  const checkAvailability = (menuItem) => {
    const ingredients = menuItem.ingredients;
    
    for (const ingredient of ingredients) {
      const inventoryItem = inventory.find(inv => inv.name === ingredient.name);
      if (!inventoryItem || inventoryItem.quantity < ingredient.quantity) {
        return false;
      }
    }
    return true;
  };

  const getMaxQuantity = (menuItem) => {
    const ingredients = menuItem.ingredients;
    let maxQuantity = Infinity;
    
    for (const ingredient of ingredients) {
      const inventoryItem = inventory.find(inv => inv.name === ingredient.name);
      if (inventoryItem) {
        const possibleQuantity = Math.floor(inventoryItem.quantity / ingredient.quantity);
        maxQuantity = Math.min(maxQuantity, possibleQuantity);
      }
    }
    
    return maxQuantity === Infinity ? 0 : maxQuantity;
  };

  const handleOrder = (menuItem) => {
    setSelectedItem(menuItem);
    setOrderQuantity(1);
    setShowOrderModal(true);
  };

  const processOrder = async () => {
    if (!selectedItem) return;

    try {
      const orderData = {
        items: [{
          menu_item_id: selectedItem.id,
          name: selectedItem.name,
          price: selectedItem.price,
          quantity: orderQuantity
        }],
        total_amount: selectedItem.price * orderQuantity
      };

      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        setShowOrderModal(false);
        fetchInventory(); // Refresh inventory to show updated quantities
      }
    } catch (error) {
      console.error('Error processing order:', error);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(value);
  };

  // Auto-add buns and patties when burger category is selected
  const addBurgerIngredients = () => {
    const updatedIngredients = [...newMenuItem.ingredients];
    
    // Remove existing buns and patties
    const filteredIngredients = updatedIngredients.filter(
      ing => !ing.name.toLowerCase().includes('bun') && !ing.name.toLowerCase().includes('patty')
    );
    
    // Add new buns if quantity > 0
    if (newMenuItem.buns > 0) {
      filteredIngredients.push({
        name: 'Burger Buns',
        quantity: newMenuItem.buns
      });
    }
    
    // Add selected patty type if both type and quantity are specified
    if (newMenuItem.patties > 0 && newMenuItem.selectedPattyType) {
      filteredIngredients.push({
        name: newMenuItem.selectedPattyType,
        quantity: newMenuItem.patties
      });
    }
    
    setNewMenuItem({
      ...newMenuItem,
      ingredients: filteredIngredients
    });
  };

  // Update ingredients when buns/patties change
  useEffect(() => {
    if (newMenuItem.category === 'Burger') {
      addBurgerIngredients();
    }
  }, [newMenuItem.buns, newMenuItem.patties, newMenuItem.selectedPattyType]);

  const handleAddMenuItem = async (e) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      formData.append('name', newMenuItem.name);
      formData.append('price', parseFloat(newMenuItem.price));
      formData.append('category', newMenuItem.category);
      formData.append('ingredients', JSON.stringify(newMenuItem.ingredients));
      
      if (newMenuItem.image) {
        formData.append('image', newMenuItem.image);
      }

      const token = localStorage.getItem('token');
      const response = await fetch('/api/menu', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (response.ok) {
        setShowAddModal(false);
        resetForm();
        fetchMenuItems();
        alert('Recipe added successfully!');
      } else {
        const errorData = await response.json();
        console.error('Add failed:', errorData);
        alert('Failed to add recipe: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error adding menu item:', error);
      alert('Error adding recipe: ' + error.message);
    }
  };

  const resetForm = () => {
    setNewMenuItem({
      name: '',
      price: '',
      category: '',
      ingredients: [],
      image: null,
      imagePreview: null,
      buns: 0,
      patties: 0,
      selectedPattyType: ''
    });
  };

  const addIngredient = () => {
    if (newIngredient.name && newIngredient.quantity) {
      setNewMenuItem({
        ...newMenuItem,
        ingredients: [...newMenuItem.ingredients, {
          name: newIngredient.name,
          quantity: parseFloat(newIngredient.quantity)
        }]
      });
      setNewIngredient({ name: '', quantity: '' });
    }
  };

  const removeIngredient = (index) => {
    setNewMenuItem({
      ...newMenuItem,
      ingredients: newMenuItem.ingredients.filter((_, i) => i !== index)
    });
  };

  const downloadTemplate = () => {
    const template = [
      {
        name: 'Sample Burger',
        price: 9.99,
        category: 'Burgers',
        ingredient_1_name: 'Beef Patty',
        ingredient_1_quantity: 1,
        ingredient_2_name: 'Burger Bun',
        ingredient_2_quantity: 1,
        ingredient_3_name: 'Cheese Slice',
        ingredient_3_quantity: 1
      }
    ];
    
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Menu Template');
    XLSX.writeFile(wb, 'menu_template.xlsx');
  };

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          // Process Excel data
          const menuItems = jsonData.map(row => {
            const ingredients = [];
            
            // Extract ingredients (assuming columns like ingredient_1_name, ingredient_1_quantity, etc.)
            for (let i = 1; i <= 10; i++) {
              const nameKey = `ingredient_${i}_name`;
              const quantityKey = `ingredient_${i}_quantity`;
              
              if (row[nameKey] && row[quantityKey]) {
                ingredients.push({
                  name: row[nameKey],
                  quantity: parseFloat(row[quantityKey])
                });
              }
            }
            
            return {
              name: row.name,
              price: parseFloat(row.price),
              category: row.category,
              ingredients: ingredients
            };
          });
          
          // Send to backend
          uploadMenuItems(menuItems);
          
        } catch (error) {
          console.error('Error processing Excel file:', error);
          alert('Error processing Excel file. Please check the format.');
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const uploadMenuItems = async (items) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ items }),
      });

      if (response.ok) {
        fetchMenuItems();
        alert('Recipes uploaded successfully!');
      } else {
        const errorData = await response.json();
        console.error('Upload failed:', errorData);
        alert('Failed to upload recipes: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error uploading menu items:', error);
      alert('Error uploading recipes: ' + error.message);
    }
  };

  const editMenuItem = (item) => {
    setEditingItem(item);
    
    // Extract buns and patty info from existing ingredients
    let extractedBuns = 0;
    let extractedPatties = 0;
    let extractedPattyType = '';
    
    const otherIngredients = item.ingredients.filter(ing => {
      if (ing.name.toLowerCase().includes('bun')) {
        extractedBuns = ing.quantity;
        return false;
      }
      if (ing.name.toLowerCase().includes('patty')) {
        extractedPatties = ing.quantity;
        extractedPattyType = ing.name;
        return false;
      }
      return true;
    });
    
    setNewMenuItem({
      name: item.name,
      price: item.price.toString(),
      category: item.category,
      ingredients: [...otherIngredients],
      image: null,
      imagePreview: item.image_url || null,
      buns: extractedBuns,
      patties: extractedPatties,
      selectedPattyType: extractedPattyType
    });
    setShowEditModal(true);
  };

  const updateMenuItem = async (e) => {
    e.preventDefault();
    
    try {
      console.log('Updating menu item:', editingItem.id);
      console.log('New data:', newMenuItem);
      
      // Validate required fields
      if (!newMenuItem.name || !newMenuItem.price || !newMenuItem.category) {
        alert('Please fill in all required fields (name, price, category)');
        return;
      }
      
      if (newMenuItem.image) {
        // If there's an image, use FormData
        const formData = new FormData();
        formData.append('name', newMenuItem.name.trim());
        formData.append('price', parseFloat(newMenuItem.price));
        formData.append('category', newMenuItem.category);
        formData.append('ingredients', JSON.stringify(newMenuItem.ingredients));
        formData.append('image', newMenuItem.image);

        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/menu/${editingItem.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData,
        });

        if (response.ok) {
          console.log('Update successful');
          setShowEditModal(false);
          setEditingItem(null);
          resetForm();
          fetchMenuItems();
        } else {
          const errorData = await response.json();
          console.error('Update failed:', errorData);
          alert('Failed to update recipe: ' + (errorData.error || 'Unknown error'));
        }
      } else {
        // If no image, use JSON
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/menu/${editingItem.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: newMenuItem.name.trim(),
            price: parseFloat(newMenuItem.price),
            category: newMenuItem.category,
            ingredients: newMenuItem.ingredients
          }),
        });

        if (response.ok) {
          console.log('Update successful');
          setShowEditModal(false);
          setEditingItem(null);
          resetForm();
          fetchMenuItems();
        } else {
          const errorData = await response.json();
          console.error('Update failed:', errorData);
          alert('Failed to update recipe: ' + (errorData.error || 'Unknown error'));
        }
      }
    } catch (error) {
      console.error('Error updating menu item:', error);
      alert('Error updating recipe: ' + error.message);
    }
  };

  const deleteMenuItem = async (itemId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/menu/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchMenuItems();
        alert('Recipe deleted successfully!');
      } else {
        const errorData = await response.json();
        console.error('Delete failed:', errorData);
        alert('Failed to delete recipe: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
      alert('Error deleting recipe: ' + error.message);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false
  });

  return (
    <div className="menu-container">
      <div className="menu-header">
        <h1 className="menu-title">Menu & Recipe Management</h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ fontSize: '14px', color: '#666', textAlign: 'right' }}>
            Upload photos and define recipes with exact ingredient quantities
            <br />
            <span style={{ fontSize: '12px' }}>Inventory will auto-sync when orders are placed</span>
          </div>
          <button 
            onClick={downloadTemplate}
            style={{
              background: 'linear-gradient(135deg, #ff8c42 0%, #ff6b1a 100%)',
              color: 'white',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '600',
              boxShadow: '0 4px 12px rgba(255, 140, 66, 0.3)',
              transition: 'all 0.3s ease',
              transform: 'translateY(0)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 16px rgba(255, 140, 66, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(255, 140, 66, 0.3)';
            }}
          >
            <Download size={16} />
            Template
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            style={{
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              color: 'white',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '600',
              boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
              transition: 'all 0.3s ease',
              transform: 'translateY(0)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 16px rgba(34, 197, 94, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.3)';
            }}
          >
            <Plus size={20} />
            Add Recipe
          </button>
        </div>
      </div>

      {/* Excel Upload Section */}
      <div style={{ 
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#33312E' }}>
          Bulk Upload Recipes
        </h3>
        <div style={{ 
          backgroundColor: '#f0fdf4', 
          padding: '12px', 
          borderRadius: '8px', 
          marginBottom: '16px',
          border: '1px solid #bbf7d0'
        }}>
          <div style={{ fontSize: '14px', color: '#16a34a', fontWeight: '500', marginBottom: '8px' }}>
            📋 Example Recipe Format:
          </div>
          <div style={{ fontSize: '12px', color: '#16a34a', fontFamily: 'monospace' }}>
            Classic Burger: 2 Beef Patty (pieces), 1 Burger Buns (pieces), 1 Cheese Slices (pieces), 0.05 Lettuce (kg)
          </div>
        </div>
        <div 
          {...getRootProps()} 
          style={{
            background: isDragActive 
              ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' 
              : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            border: 'none',
            borderRadius: '12px',
            padding: '40px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: isDragActive 
              ? '0 8px 20px rgba(34, 197, 94, 0.4)' 
              : '0 4px 12px rgba(34, 197, 94, 0.3)',
            transform: isDragActive ? 'translateY(-2px)' : 'translateY(0)'
          }}
        >
          <input {...getInputProps()} />
          <Upload size={48} style={{ color: 'white', marginBottom: '16px' }} />
          {isDragActive ? (
            <p style={{ color: 'white', fontSize: '16px', fontWeight: '600' }}>Drop the Excel file here...</p>
          ) : (
            <div>
              <p style={{ color: 'white', fontSize: '16px', marginBottom: '8px', fontWeight: '600' }}>
                Drag & drop an Excel file here, or click to select
              </p>
              <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px' }}>
                Supports .xlsx and .xls files. Download template for correct format.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="menu-grid">
        {menuItems.map((item) => {
          const isAvailable = checkAvailability(item);
          const maxQuantity = getMaxQuantity(item);
          
          return (
            <div key={item.id} className="menu-card">
              {/* Menu Item Image */}
              {item.image_url && (
                <div style={{
                  width: '100%',
                  height: '200px',
                  marginBottom: '15px',
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}>
                  <img 
                    src={item.image_url} 
                    alt={item.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div className="menu-item-name">{item.name}</div>
                  <div className="menu-item-price">{formatCurrency(item.price)}</div>
                  <div className="menu-item-category">{item.category}</div>
                </div>
                
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handleOrder(item)}
                    disabled={!isAvailable}
                    style={{
                      backgroundColor: isAvailable ? '#22c55e' : '#ccc',
                      color: 'white',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      cursor: isAvailable ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px'
                    }}
                  >
                    <ShoppingCart size={14} />
                    {isAvailable ? 'Order' : 'Unavailable'}
                  </button>

                  <button
                    onClick={() => editMenuItem(item)}
                    style={{
                      backgroundColor: '#f59e0b',
                      color: 'white',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px'
                    }}
                  >
                    <Edit3 size={14} />
                    Edit
                  </button>

                  <button
                    onClick={() => deleteMenuItem(item.id)}
                    style={{
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px'
                    }}
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>

              <div className="ingredients-list">
                <div className="ingredients-title">Recipe Details:</div>
                {item.ingredients.map((ingredient, index) => {
                  const inventoryItem = inventory.find(inv => inv.name === ingredient.name);
                  const available = inventoryItem ? inventoryItem.quantity : 0;
                  const isIngredientAvailable = available >= ingredient.quantity;
                  
                  return (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      backgroundColor: isIngredientAvailable ? '#f0f9ff' : '#fef2f2',
                      borderRadius: '6px',
                      marginBottom: '6px',
                      border: `1px solid ${isIngredientAvailable ? '#bfdbfe' : '#fecaca'}`
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: isIngredientAvailable ? '#22c55e' : '#ef4444'
                        }}></div>
                        <span style={{ 
                          color: isIngredientAvailable ? '#1e40af' : '#dc2626',
                          fontWeight: '500'
                        }}>
                          {ingredient.name}
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ 
                          fontSize: '12px',
                          fontWeight: '600',
                          color: isIngredientAvailable ? '#1e40af' : '#dc2626'
                        }}>
                          Uses: {ingredient.quantity} {inventoryItem?.unit || 'units'}
                        </div>
                        <div style={{ 
                          fontSize: '10px',
                          color: '#666'
                        }}>
                          Stock: {available} {inventoryItem?.unit || 'units'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {isAvailable && (
                <div style={{
                  marginTop: '12px',
                  fontSize: '12px',
                  color: '#22c55e',
                  fontWeight: '600'
                }}>
                  Max available: {maxQuantity} servings
                </div>
              )}

              {!isAvailable && (
                <div style={{
                  marginTop: '12px',
                  fontSize: '12px',
                  color: '#ef4444',
                  fontWeight: '600'
                }}>
                  Insufficient ingredients
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Menu Item Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 className="modal-title">Add New Recipe</h2>
            <div style={{ 
              backgroundColor: '#f0f9ff', 
              padding: '12px', 
              borderRadius: '8px', 
              marginBottom: '20px',
              border: '1px solid #bfdbfe'
            }}>
              <div style={{ fontSize: '14px', color: '#1e40af', fontWeight: '500', marginBottom: '4px' }}>
                📸 Enhanced Recipe System
              </div>
              <div style={{ fontSize: '12px', color: '#1e40af' }}>
                Upload photos and define exact ingredient quantities. For burgers, specify buns and patties for quick setup.
              </div>
            </div>
            
            <form onSubmit={handleAddMenuItem}>
              <div className="form-group">
                <label className="form-label">Item Name</label>
                <input
                  type="text"
                  value={newMenuItem.name}
                  onChange={(e) => setNewMenuItem({...newMenuItem, name: e.target.value})}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newMenuItem.price}
                  onChange={(e) => setNewMenuItem({...newMenuItem, price: e.target.value})}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  value={newMenuItem.category}
                  onChange={(e) => setNewMenuItem({...newMenuItem, category: e.target.value})}
                  className="form-input"
                  required
                >
                  <option value="">Select category</option>
                  <option value="Burger">Burger</option>
                  <option value="Fries">Fries</option>
                  <option value="Wrap">Wrap</option>
                  <option value="Shakes">Shakes</option>
                  <option value="Pizza">Pizza</option>
                  <option value="Sides">Sides</option>
                  <option value="Momos">Momos</option>
                  <option value="Mocktails">Mocktails</option>
                  <option value="Sandwiches">Sandwiches</option>
                  <option value="Subs">Subs</option>
                </select>
              </div>



              {/* Burger Specific Ingredients */}
              {newMenuItem.category === 'Burger' && (
                <div className="form-group">
                  <label className="form-label">🍔 Burger Components</label>
                  <div style={{
                    backgroundColor: '#fff5f0',
                    padding: '15px',
                    borderRadius: '8px',
                    border: '1px solid #ff8c42',
                    marginBottom: '15px'
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500', color: '#333' }}>
                          🍞 Number of Buns
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={newMenuItem.buns}
                          onChange={(e) => setNewMenuItem({...newMenuItem, buns: parseInt(e.target.value) || 0})}
                          className="form-input"
                          placeholder="e.g., 1 for regular, 2 for double"
                        />
                      </div>
                      
                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500', color: '#333' }}>
                          🥩 Patty Type & Quantity
                        </label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <select
                            value={newMenuItem.selectedPattyType || ''}
                            onChange={(e) => setNewMenuItem({...newMenuItem, selectedPattyType: e.target.value})}
                            className="form-input"
                            style={{ flex: 2 }}
                          >
                            <option value="">Select Patty Type</option>
                            {inventory
                              .filter(item => item.name.toLowerCase().includes('patty'))
                              .map(patty => (
                                <option key={patty.id} value={patty.name}>{patty.name}</option>
                              ))
                            }
                          </select>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={newMenuItem.patties}
                            onChange={(e) => setNewMenuItem({...newMenuItem, patties: parseInt(e.target.value) || 0})}
                            className="form-input"
                            style={{ flex: 1 }}
                            placeholder="Qty"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ 
                      marginTop: '10px', 
                      fontSize: '12px', 
                      color: '#666',
                      backgroundColor: 'white',
                      padding: '8px',
                      borderRadius: '4px'
                    }}>
                      💡 <strong>Smart Patty Selection:</strong> Choose from your inventory patty types. Buns and selected patties will be automatically added to ingredients.
                    </div>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Additional Recipe Ingredients</label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <select
                    value={newIngredient.name}
                    onChange={(e) => setNewIngredient({...newIngredient, name: e.target.value})}
                    className="form-input"
                    style={{ flex: 2 }}
                  >
                    <option value="">Select ingredient</option>
                    {inventory.map(item => (
                      <option key={item.id} value={item.name}>{item.name}</option>
                    ))}
                  </select>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Qty"
                      value={newIngredient.quantity}
                      onChange={(e) => setNewIngredient({...newIngredient, quantity: e.target.value})}
                      className="form-input"
                      style={{ flex: 1 }}
                    />
                    <span style={{ fontSize: '12px', color: '#666', minWidth: '40px' }}>
                      {newIngredient.name ? 
                        inventory.find(item => item.name === newIngredient.name)?.unit || 'units' 
                        : 'units'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={addIngredient}
                    style={{
                      background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      boxShadow: '0 2px 8px rgba(34, 197, 94, 0.3)',
                      transition: 'all 0.3s ease',
                      transform: 'translateY(0)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 2px 8px rgba(34, 197, 94, 0.3)';
                    }}
                  >
                    Add
                  </button>
                </div>
                
                <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                  {newMenuItem.ingredients.map((ingredient, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px',
                      backgroundColor: '#f0f9ff',
                      borderRadius: '8px',
                      marginBottom: '8px',
                      border: '1px solid #bfdbfe'
                    }}>
                      <div>
                        <div style={{ fontWeight: '600', color: '#1e40af' }}>{ingredient.name}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          Uses: {ingredient.quantity} {inventory.find(item => item.name === ingredient.name)?.unit || 'units'}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeIngredient(index)}
                        style={{
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={{
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
                    transition: 'all 0.3s ease',
                    transform: 'translateY(0)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 16px rgba(34, 197, 94, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.3)';
                  }}
                >
                  Add Recipe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Menu Item Modal */}
      {showEditModal && editingItem && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 className="modal-title">Edit Recipe: {editingItem.name}</h2>
            <div style={{ 
              backgroundColor: '#f0f9ff', 
              padding: '12px', 
              borderRadius: '8px', 
              marginBottom: '20px',
              border: '1px solid #bfdbfe'
            }}>
              <div style={{ fontSize: '14px', color: '#1e40af', fontWeight: '500', marginBottom: '4px' }}>
                ✏️ Edit Recipe & Ingredients
              </div>
              <div style={{ fontSize: '12px', color: '#1e40af' }}>
                Update recipe details, buns, patty types, and ingredient quantities for better inventory management.
              </div>
            </div>
            
            <form onSubmit={(e) => {
              console.log('Form submitted for edit');
              updateMenuItem(e);
            }}>
              <div className="form-group">
                <label className="form-label">Item Name</label>
                <input
                  type="text"
                  value={newMenuItem.name}
                  onChange={(e) => setNewMenuItem({...newMenuItem, name: e.target.value})}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newMenuItem.price}
                  onChange={(e) => setNewMenuItem({...newMenuItem, price: e.target.value})}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  value={newMenuItem.category}
                  onChange={(e) => setNewMenuItem({...newMenuItem, category: e.target.value})}
                  className="form-input"
                  required
                >
                  <option value="">Select category</option>
                  <option value="Burger">Burger</option>
                  <option value="Fries">Fries</option>
                  <option value="Wrap">Wrap</option>
                  <option value="Shakes">Shakes</option>
                  <option value="Pizza">Pizza</option>
                  <option value="Sides">Sides</option>
                  <option value="Momos">Momos</option>
                  <option value="Mocktails">Mocktails</option>
                  <option value="Sandwiches">Sandwiches</option>
                  <option value="Subs">Subs</option>
                </select>
              </div>



              <div className="form-group">
                <label className="form-label">🍽️ Recipe Ingredients</label>
                <div style={{
                  backgroundColor: '#fff5f0',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '2px dashed #ff8c42',
                  marginBottom: '15px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '15px',
                    paddingBottom: '10px',
                    borderBottom: '1px solid #ff8c42'
                  }}>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#ff8c42'
                    }}>
                      Add Ingredients & Quantities
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                    <select
                      value={newIngredient.name}
                      onChange={(e) => setNewIngredient({...newIngredient, name: e.target.value})}
                      style={{ 
                        flex: 2,
                        border: '2px solid #ff8c42',
                        borderRadius: '8px',
                        padding: '12px',
                        fontSize: '14px',
                        outline: 'none',
                        backgroundColor: 'white'
                      }}
                    >
                      <option value="">Select ingredient</option>
                      {inventory.map(item => (
                        <option key={item.id} value={item.name}>{item.name}</option>
                      ))}
                    </select>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Qty"
                        value={newIngredient.quantity}
                        onChange={(e) => setNewIngredient({...newIngredient, quantity: e.target.value})}
                        style={{ 
                          flex: 1,
                          border: '2px solid #ff8c42',
                          borderRadius: '8px',
                          padding: '12px',
                          fontSize: '14px',
                          outline: 'none',
                          backgroundColor: 'white'
                        }}
                      />
                      <span style={{ fontSize: '12px', color: '#ff8c42', fontWeight: '500', minWidth: '40px' }}>
                        {newIngredient.name ? 
                          inventory.find(item => item.name === newIngredient.name)?.unit || 'units' 
                          : 'units'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={addIngredient}
                      style={{
                        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                        color: 'white',
                        border: 'none',
                        padding: '12px 20px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '14px',
                        boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
                        transition: 'all 0.3s ease',
                        transform: 'translateY(0)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-1px)';
                        e.target.style.boxShadow = '0 6px 16px rgba(34, 197, 94, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.3)';
                      }}
                    >
                      Add
                    </button>
                  </div>
                  
                  <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                    {newMenuItem.ingredients.map((ingredient, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        marginBottom: '8px',
                        border: '2px solid #ff8c42'
                      }}>
                        <div>
                          <div style={{ fontWeight: '600', color: '#ff8c42' }}>{ingredient.name}</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            Uses: {ingredient.quantity} {inventory.find(item => item.name === ingredient.name)?.unit || 'units'}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeIngredient(index)}
                          style={{
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingItem(null);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={{
                    backgroundColor: '#22c55e',
                    color: 'white',
                    border: 'none',
                    padding: '12px 25px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'background-color 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#16a34a'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#22c55e'}
                >
                  Update Recipe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Modal */}
      {showOrderModal && selectedItem && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="modal-title">Place Order</h2>
            
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>{selectedItem.name}</h3>
              <p style={{ color: '#666', marginBottom: '12px' }}>
                {formatCurrency(selectedItem.price)} per serving
              </p>
              
              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  max={getMaxQuantity(selectedItem)}
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(parseInt(e.target.value))}
                  className="form-input"
                />
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  Maximum available: {getMaxQuantity(selectedItem)} servings
                </div>
              </div>

              <div style={{
                padding: '16px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                marginTop: '16px'
              }}>
                <div style={{ fontWeight: '600', marginBottom: '8px' }}>Order Summary:</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>{selectedItem.name} x {orderQuantity}</span>
                  <span>{formatCurrency(selectedItem.price * orderQuantity)}</span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  fontWeight: '600',
                  borderTop: '1px solid #ddd',
                  paddingTop: '8px',
                  marginTop: '8px'
                }}>
                  <span>Total:</span>
                  <span>{formatCurrency(selectedItem.price * orderQuantity)}</span>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => setShowOrderModal(false)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn-primary"
                onClick={processOrder}
              >
                Process Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;