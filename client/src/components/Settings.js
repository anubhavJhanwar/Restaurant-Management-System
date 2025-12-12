import React, { useState, useEffect } from 'react';
import { Save, User, Bell, Palette, Database, Shield, ChefHat, Clock, Key, Settings as SettingsIcon, Users, Trash2 } from 'lucide-react';

const PinChangeForm = () => {
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handlePinChange = async (e) => {
    e.preventDefault();
    
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setMessage('PIN must be exactly 4 digits');
      return;
    }
    
    if (newPin !== confirmPin) {
      setMessage('New PIN and confirmation do not match');
      return;
    }
    
    setLoading(true);
    setMessage('');
    
    try {
      const token = localStorage.getItem('token');
      
      // First verify current PIN
      const verifyResponse = await fetch('http://localhost:5000/api/auth/verify-pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ pin: currentPin })
      });
      
      if (!verifyResponse.ok) {
        setMessage('Current PIN is incorrect');
        setLoading(false);
        return;
      }
      
      // Change PIN
      const changeResponse = await fetch('http://localhost:5000/api/auth/change-pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          currentPin: currentPin,
          newPin: newPin 
        })
      });
      
      if (changeResponse.ok) {
        setMessage('PIN changed successfully');
        setCurrentPin('');
        setNewPin('');
        setConfirmPin('');
      } else {
        const data = await changeResponse.json();
        setMessage(data.error || 'Failed to change PIN');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handlePinChange} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#555' }}>
          Current PIN
        </label>
        <input
          type="password"
          value={currentPin}
          onChange={(e) => setCurrentPin(e.target.value)}
          maxLength={4}
          placeholder="Enter current PIN"
          style={{
            width: '200px',
            padding: '12px',
            border: '2px solid #e9ecef',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none'
          }}
          required
        />
      </div>
      
      <div>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#555' }}>
          New PIN
        </label>
        <input
          type="password"
          value={newPin}
          onChange={(e) => setNewPin(e.target.value)}
          maxLength={4}
          placeholder="Enter new 4-digit PIN"
          style={{
            width: '200px',
            padding: '12px',
            border: '2px solid #e9ecef',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none'
          }}
          required
        />
      </div>
      
      <div>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#555' }}>
          Confirm New PIN
        </label>
        <input
          type="password"
          value={confirmPin}
          onChange={(e) => setConfirmPin(e.target.value)}
          maxLength={4}
          placeholder="Confirm new PIN"
          style={{
            width: '200px',
            padding: '12px',
            border: '2px solid #e9ecef',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none'
          }}
          required
        />
      </div>
      
      {message && (
        <div style={{
          padding: '10px',
          borderRadius: '6px',
          fontSize: '14px',
          backgroundColor: message.includes('successfully') ? '#d4edda' : '#f8d7da',
          color: message.includes('successfully') ? '#155724' : '#721c24',
          border: `1px solid ${message.includes('successfully') ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {message}
        </div>
      )}
      
      <button
        type="submit"
        disabled={loading}
        style={{
          width: '200px',
          padding: '12px',
          backgroundColor: loading ? '#ccc' : '#ff8c42',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
      >
        <Key size={16} />
        {loading ? 'Changing...' : 'Change PIN'}
      </button>
    </form>
  );
};

const Settings = () => {
  const [settings, setSettings] = useState({
    // Restaurant Information
    restaurantName: 'BurgerBoss',
    restaurantAddress: '123 Main Street, City, State 12345',
    restaurantPhone: '+1 (555) 123-4567',
    restaurantEmail: 'info@burgerboss.com',
    openingTime: '09:00',
    closingTime: '22:00',
    
    // User Preferences
    theme: 'orange',
    language: 'en',
    currency: 'USD',
    timezone: 'America/New_York',
    
    // Notifications
    orderNotifications: true,
    lowStockAlerts: true,
    dailyReports: true,
    emailNotifications: false,
    
    // Business Settings
    taxRate: 8.5,
    serviceCharge: 0,
    autoBackup: true,
    backupFrequency: 'daily',
    lowStockThreshold: 10,
    orderPrefix: 'BB',
    printReceipts: true,
    
    // Kitchen Settings
    orderSoundAlert: true,
    kitchenDisplay: true,
    preparationTime: 15,
    maxOrdersPerHour: 30,
    
    // Security
    sessionTimeout: 30,
    requirePasswordChange: false,
    twoFactorAuth: false
  });

  const [activeSection, setActiveSection] = useState('restaurant');
  const [saveMessage, setSaveMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [userCounts, setUserCounts] = useState({ owner: 0, default: 0, total: 0 });
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('burgerboss-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleInputChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    localStorage.setItem('burgerboss-settings', JSON.stringify(settings));
    setSaveMessage('Settings saved successfully!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const sections = [
    { id: 'restaurant', label: 'Restaurant Info', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'business', label: 'Business', icon: Database },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'users', label: 'User Management', icon: Users }
  ];

  const renderRestaurantSettings = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h3 style={{ color: '#333', marginBottom: '15px', fontSize: '18px' }}>Restaurant Information</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#555' }}>
            Restaurant Name
          </label>
          <input
            type="text"
            value={settings.restaurantName}
            onChange={(e) => handleInputChange('restaurantName', e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #ff8c42',
              borderRadius: '8px',
              fontSize: '14px',
              transition: 'border-color 0.3s ease',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = '#ff7b25'}
            onBlur={(e) => e.target.style.borderColor = '#ff8c42'}
          />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#555' }}>
            Phone Number
          </label>
          <input
            type="text"
            value={settings.restaurantPhone}
            onChange={(e) => handleInputChange('restaurantPhone', e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #ff8c42',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = '#ff7b25'}
            onBlur={(e) => e.target.style.borderColor = '#ff8c42'}
          />
        </div>
      </div>
      
      <div>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#555' }}>
          Address
        </label>
        <input
          type="text"
          value={settings.restaurantAddress}
          onChange={(e) => handleInputChange('restaurantAddress', e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            border: '2px solid #ff8c42',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none'
          }}
          onFocus={(e) => e.target.style.borderColor = '#ff7b25'}
          onBlur={(e) => e.target.style.borderColor = '#ff8c42'}
        />
      </div>
      
      <div>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#555' }}>
          Email
        </label>
        <input
          type="email"
          value={settings.restaurantEmail}
          onChange={(e) => handleInputChange('restaurantEmail', e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            border: '2px solid #ff8c42',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none'
          }}
          onFocus={(e) => e.target.style.borderColor = '#ff7b25'}
          onBlur={(e) => e.target.style.borderColor = '#ff8c42'}
        />
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#555' }}>
            Opening Time
          </label>
          <input
            type="time"
            value={settings.openingTime}
            onChange={(e) => handleInputChange('openingTime', e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #ff8c42',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = '#ff7b25'}
            onBlur={(e) => e.target.style.borderColor = '#ff8c42'}
          />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#555' }}>
            Closing Time
          </label>
          <input
            type="time"
            value={settings.closingTime}
            onChange={(e) => handleInputChange('closingTime', e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #ff8c42',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = '#ff7b25'}
            onBlur={(e) => e.target.style.borderColor = '#ff8c42'}
          />
        </div>
      </div>
    </div>
  );

  const renderPreferences = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h3 style={{ color: '#333', marginBottom: '15px', fontSize: '18px' }}>User Preferences</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#555' }}>
            Theme Color
          </label>
          <select
            value={settings.theme}
            onChange={(e) => handleInputChange('theme', e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #ff8c42',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = '#ff7b25'}
            onBlur={(e) => e.target.style.borderColor = '#ff8c42'}
          >
            <option value="orange">Orange (Default)</option>
            <option value="blue">Blue</option>
            <option value="green">Green</option>
            <option value="purple">Purple</option>
          </select>
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#555' }}>
            Language
          </label>
          <select
            value={settings.language}
            onChange={(e) => handleInputChange('language', e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #ff8c42',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = '#ff7b25'}
            onBlur={(e) => e.target.style.borderColor = '#ff8c42'}
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#555' }}>
            Currency
          </label>
          <select
            value={settings.currency}
            onChange={(e) => handleInputChange('currency', e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #ff8c42',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = '#ff7b25'}
            onBlur={(e) => e.target.style.borderColor = '#ff8c42'}
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="CAD">CAD (C$)</option>
          </select>
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#555' }}>
            Timezone
          </label>
          <select
            value={settings.timezone}
            onChange={(e) => handleInputChange('timezone', e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #ff8c42',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = '#ff7b25'}
            onBlur={(e) => e.target.style.borderColor = '#ff8c42'}
          >
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h3 style={{ color: '#333', marginBottom: '15px', fontSize: '18px' }}>Notification Settings</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {[
          { key: 'orderNotifications', label: 'New Order Notifications', desc: 'Get notified when new orders are placed' },
          { key: 'lowStockAlerts', label: 'Low Stock Alerts', desc: 'Alert when inventory items are running low' },
          { key: 'dailyReports', label: 'Daily Reports', desc: 'Receive daily sales and performance reports' },
          { key: 'emailNotifications', label: 'Email Notifications', desc: 'Send notifications to your email' }
        ].map(item => (
          <div key={item.key} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '15px',
            backgroundColor: '#fff5f0',
            borderRadius: '8px',
            border: '1px solid #ff8c42'
          }}>
            <div>
              <div style={{ fontWeight: '500', color: '#333', marginBottom: '4px' }}>{item.label}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>{item.desc}</div>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px' }}>
              <input
                type="checkbox"
                checked={settings[item.key]}
                onChange={(e) => handleInputChange(item.key, e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute',
                cursor: 'pointer',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: settings[item.key] ? '#ff8c42' : '#ccc',
                transition: '0.4s',
                borderRadius: '24px'
              }}>
                <span style={{
                  position: 'absolute',
                  content: '',
                  height: '18px',
                  width: '18px',
                  left: settings[item.key] ? '29px' : '3px',
                  bottom: '3px',
                  backgroundColor: 'white',
                  transition: '0.4s',
                  borderRadius: '50%'
                }} />
              </span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBusinessSettings = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h3 style={{ color: '#333', marginBottom: '15px', fontSize: '18px' }}>Business Settings</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#555' }}>
            Service Charge (%)
          </label>
          <input
            type="number"
            step="0.1"
            value={settings.serviceCharge}
            onChange={(e) => handleInputChange('serviceCharge', parseFloat(e.target.value))}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #ff8c42',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = '#ff7b25'}
            onBlur={(e) => e.target.style.borderColor = '#ff8c42'}
          />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#555' }}>
            Low Stock Alert Threshold
          </label>
          <input
            type="number"
            value={settings.lowStockThreshold}
            onChange={(e) => handleInputChange('lowStockThreshold', parseInt(e.target.value))}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #ff8c42',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = '#ff7b25'}
            onBlur={(e) => e.target.style.borderColor = '#ff8c42'}
          />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#555' }}>
            Order Number Prefix
          </label>
          <input
            type="text"
            value={settings.orderPrefix}
            onChange={(e) => handleInputChange('orderPrefix', e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #ff8c42',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = '#ff7b25'}
            onBlur={(e) => e.target.style.borderColor = '#ff8c42'}
          />
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {[
          { key: 'autoBackup', label: 'Auto Backup', desc: 'Automatically backup data daily' },
          { key: 'printReceipts', label: 'Print Receipts', desc: 'Automatically print receipts for orders' }
        ].map(item => (
          <div key={item.key} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '15px',
            backgroundColor: '#fff5f0',
            borderRadius: '8px',
            border: '1px solid #ff8c42'
          }}>
            <div>
              <div style={{ fontWeight: '500', color: '#333', marginBottom: '4px' }}>{item.label}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>{item.desc}</div>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px' }}>
              <input
                type="checkbox"
                checked={settings[item.key]}
                onChange={(e) => handleInputChange(item.key, e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute',
                cursor: 'pointer',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: settings[item.key] ? '#ff8c42' : '#ccc',
                transition: '0.4s',
                borderRadius: '24px'
              }}>
                <span style={{
                  position: 'absolute',
                  content: '',
                  height: '18px',
                  width: '18px',
                  left: settings[item.key] ? '29px' : '3px',
                  bottom: '3px',
                  backgroundColor: 'white',
                  transition: '0.4s',
                  borderRadius: '50%'
                }} />
              </span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h3 style={{ color: '#333', marginBottom: '15px', fontSize: '18px' }}>Security Settings</h3>
      
      {/* PIN Change Section */}
      <div style={{
        padding: '20px',
        backgroundColor: '#fff5f0',
        borderRadius: '8px',
        border: '1px solid #ff8c42'
      }}>
        <h4 style={{ color: '#333', marginBottom: '15px', fontSize: '16px' }}>Change PIN</h4>
        <PinChangeForm />
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {[
          { key: 'requirePasswordChange', label: 'Require Password Change', desc: 'Force password change every 90 days' },
          { key: 'twoFactorAuth', label: 'Two-Factor Authentication', desc: 'Enable 2FA for enhanced security' }
        ].map(item => (
          <div key={item.key} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '15px',
            backgroundColor: '#fff5f0',
            borderRadius: '8px',
            border: '1px solid #ff8c42'
          }}>
            <div>
              <div style={{ fontWeight: '500', color: '#333', marginBottom: '4px' }}>{item.label}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>{item.desc}</div>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px' }}>
              <input
                type="checkbox"
                checked={settings[item.key]}
                onChange={(e) => handleInputChange(item.key, e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute',
                cursor: 'pointer',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: settings[item.key] ? '#ff8c42' : '#ccc',
                transition: '0.4s',
                borderRadius: '24px'
              }}>
                <span style={{
                  position: 'absolute',
                  content: '',
                  height: '18px',
                  width: '18px',
                  left: settings[item.key] ? '29px' : '3px',
                  bottom: '3px',
                  backgroundColor: 'white',
                  transition: '0.4s',
                  borderRadius: '50%'
                }} />
              </span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  // User Management Functions
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setUserCounts(data.counts);
      } else {
        console.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const deleteUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        alert(`User "${data.deletedUser.username}" has been deleted successfully.`);
        fetchUsers(); // Refresh the list
      } else {
        const error = await response.json();
        alert(`Failed to delete user: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user. Please try again.');
    }
  };

  // Add useEffect for fetching users when section changes
  useEffect(() => {
    if (activeSection === 'users') {
      fetchUsers();
    }
  }, [activeSection]);

  const renderUserManagement = () => {
    // Get current user info
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3 style={{ color: '#333', marginBottom: '15px', fontSize: '18px' }}>User Management</h3>
        
        {/* Compact Account Statistics */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '12px',
          marginBottom: '15px'
        }}>
          <div style={{
            padding: '12px',
            backgroundColor: '#fff5f0',
            borderRadius: '6px',
            border: '1px solid #ff8c42',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ff8c42' }}>
              {userCounts.owner}/3
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Owners</div>
          </div>
          
          <div style={{
            padding: '12px',
            backgroundColor: '#f0f8ff',
            borderRadius: '6px',
            border: '1px solid #3b82f6',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#3b82f6' }}>
              {userCounts.default}/2
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Default</div>
          </div>
          
          <div style={{
            padding: '12px',
            backgroundColor: '#f0fdf4',
            borderRadius: '6px',
            border: '1px solid #22c55e',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#22c55e' }}>
              {userCounts.total}/5
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Total</div>
          </div>
        </div>

        {/* Compact Users List */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '6px',
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
          maxHeight: '400px'
        }}>
          <div style={{
            padding: '10px 15px',
            backgroundColor: '#f9fafb',
            borderBottom: '1px solid #e5e7eb',
            fontWeight: '600',
            color: '#374151',
            fontSize: '14px'
          }}>
            All User Accounts ({users.length})
          </div>
          
          {loadingUsers ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#666', fontSize: '14px' }}>
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#666', fontSize: '14px' }}>
              No users found
            </div>
          ) : (
            <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
              {users.map((user, index) => (
                <div key={user.id} style={{
                  padding: '10px 15px',
                  borderBottom: index < users.length - 1 ? '1px solid #f3f4f6' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                      <span style={{ fontWeight: '600', color: '#374151', fontSize: '14px' }}>
                        {user.username}
                      </span>
                      <span style={{
                        padding: '1px 6px',
                        borderRadius: '10px',
                        fontSize: '10px',
                        fontWeight: '500',
                        backgroundColor: user.role === 'Owner' ? '#fef3c7' : '#dbeafe',
                        color: user.role === 'Owner' ? '#92400e' : '#1e40af'
                      }}>
                        {user.role}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '1px' }}>
                      {user.email}
                    </div>
                    <div style={{ fontSize: '10px', color: '#9ca3af' }}>
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  
                  {user.id === currentUser.id ? (
                    <div style={{
                      padding: '6px 10px',
                      backgroundColor: '#f0f9ff',
                      color: '#0369a1',
                      border: '1px solid #bae6fd',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <User size={12} />
                      Me
                    </div>
                  ) : (
                    <button
                      onClick={() => deleteUser(user.id, user.username)}
                      style={{
                        padding: '6px 10px',
                        backgroundColor: '#fee2e2',
                        color: '#dc2626',
                        border: '1px solid #fecaca',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        fontWeight: '500',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#fecaca';
                        e.target.style.borderColor = '#f87171';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#fee2e2';
                        e.target.style.borderColor = '#fecaca';
                      }}
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div style={{
          padding: '10px',
          backgroundColor: '#f0f9ff',
          borderRadius: '6px',
          border: '1px solid #0ea5e9',
          fontSize: '12px',
          color: '#0c4a6e'
        }}>
          <strong>Note:</strong> Create accounts from login page. Deletions are permanent.
        </div>
      </div>
    );
  };

  const renderKitchenSettings = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h3 style={{ color: '#333', marginBottom: '15px', fontSize: '18px' }}>Kitchen & Operations</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#555' }}>
            Average Preparation Time (minutes)
          </label>
          <input
            type="number"
            value={settings.preparationTime}
            onChange={(e) => handleInputChange('preparationTime', parseInt(e.target.value))}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #ff8c42',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = '#ff7b25'}
            onBlur={(e) => e.target.style.borderColor = '#ff8c42'}
          />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#555' }}>
            Max Orders Per Hour
          </label>
          <input
            type="number"
            value={settings.maxOrdersPerHour}
            onChange={(e) => handleInputChange('maxOrdersPerHour', parseInt(e.target.value))}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #ff8c42',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = '#ff7b25'}
            onBlur={(e) => e.target.style.borderColor = '#ff8c42'}
          />
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {[
          { key: 'orderSoundAlert', label: 'Order Sound Alerts', desc: 'Play sound when new orders arrive' },
          { key: 'kitchenDisplay', label: 'Kitchen Display System', desc: 'Show orders on kitchen display screen' }
        ].map(item => (
          <div key={item.key} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '15px',
            backgroundColor: '#fff5f0',
            borderRadius: '8px',
            border: '1px solid #ff8c42'
          }}>
            <div>
              <div style={{ fontWeight: '500', color: '#333', marginBottom: '4px' }}>{item.label}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>{item.desc}</div>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px' }}>
              <input
                type="checkbox"
                checked={settings[item.key]}
                onChange={(e) => handleInputChange(item.key, e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute',
                cursor: 'pointer',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: settings[item.key] ? '#ff8c42' : '#ccc',
                transition: '0.4s',
                borderRadius: '24px'
              }}>
                <span style={{
                  position: 'absolute',
                  content: '',
                  height: '18px',
                  width: '18px',
                  left: settings[item.key] ? '29px' : '3px',
                  bottom: '3px',
                  backgroundColor: 'white',
                  transition: '0.4s',
                  borderRadius: '50%'
                }} />
              </span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'restaurant': return renderRestaurantSettings();
      case 'notifications': return renderNotifications();
      case 'business': return renderBusinessSettings();
      case 'security': return renderSecuritySettings();
      case 'users': return renderUserManagement();
      default: return renderRestaurantSettings();
    }
  };

  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#fff8f5',
      height: '100vh',
      overflow: 'hidden'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        height: 'calc(100vh - 40px)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Compact Header */}
        <div style={{
          background: 'linear-gradient(135deg, #ff8c42 0%, #ff7b25 100%)',
          color: 'white',
          padding: '15px 25px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexShrink: 0
        }}>
          <SettingsIcon size={24} />
          <div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>Settings</h1>
            <p style={{ margin: '2px 0 0 0', opacity: 0.9, fontSize: '12px' }}>
              Configure your restaurant system
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Compact Sidebar */}
          <div style={{
            width: '220px',
            background: 'linear-gradient(180deg, #ff8c42 0%, #ff7b25 100%)',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0
          }}>
            {sections.map((section, index) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  style={{
                    width: '100%',
                    padding: '12px 20px',
                    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                    color: 'white',
                    border: 'none',
                    borderBottom: index < sections.length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '14px',
                    fontWeight: isActive ? '600' : '500',
                    transition: 'all 0.3s ease',
                    textAlign: 'left',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.target.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <Icon size={18} />
                  <span>{section.label}</span>
                  {isActive && (
                    <div style={{
                      position: 'absolute',
                      right: '0',
                      top: '0',
                      bottom: '0',
                      width: '3px',
                      backgroundColor: 'white',
                      borderRadius: '2px 0 0 2px'
                    }} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Content Area */}
          <div style={{ 
            flex: 1, 
            padding: '20px', 
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ flex: 1 }}>
              {renderContent()}
            </div>
            
            {/* Compact Save Button */}
            {activeSection !== 'users' && (
              <div style={{
                marginTop: '15px',
                paddingTop: '15px',
                borderTop: '1px solid #e9ecef',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: '15px',
                flexShrink: 0
              }}>
                {saveMessage && (
                  <div style={{
                    color: '#28a745',
                    fontSize: '13px',
                    fontWeight: '500'
                  }}>
                    {saveMessage}
                  </div>
                )}
                <button
                  onClick={handleSave}
                  style={{
                    backgroundColor: '#ff8c42',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    fontWeight: '500',
                    transition: 'background-color 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#e67e22'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#ff8c42'}
                >
                  <Save size={14} />
                  Save Settings
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;