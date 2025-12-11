import React, { useState, useEffect } from 'react';
import { Save, User, Bell, Palette, Database, Shield, ChefHat, Clock } from 'lucide-react';

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
    { id: 'preferences', label: 'Preferences', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'business', label: 'Business', icon: Database },
    { id: 'kitchen', label: 'Kitchen', icon: ChefHat },
    { id: 'security', label: 'Security', icon: Shield }
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
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#555' }}>
            Tax Rate (%)
          </label>
          <input
            type="number"
            step="0.1"
            value={settings.taxRate}
            onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value))}
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
      
      <div>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#555' }}>
          Session Timeout (minutes)
        </label>
        <input
          type="number"
          value={settings.sessionTimeout}
          onChange={(e) => handleInputChange('sessionTimeout', parseInt(e.target.value))}
          style={{
            width: '200px',
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
      case 'preferences': return renderPreferences();
      case 'notifications': return renderNotifications();
      case 'business': return renderBusinessSettings();
      case 'kitchen': return renderKitchenSettings();
      case 'security': return renderSecuritySettings();
      default: return renderRestaurantSettings();
    }
  };

  return (
    <div style={{
      padding: '30px',
      backgroundColor: '#fff8f5',
      minHeight: '100vh'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '15px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #ff8c42 0%, #ff7b25 100%)',
          color: 'white',
          padding: '25px 30px',
          display: 'flex',
          alignItems: 'center',
          gap: '15px'
        }}>
          <Settings size={28} />
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>Settings</h1>
            <p style={{ margin: '5px 0 0 0', opacity: 0.9, fontSize: '14px' }}>
              Configure your restaurant management system
            </p>
          </div>
        </div>

        <div style={{ display: 'flex' }}>
          {/* Sidebar */}
          <div style={{
            width: '250px',
            backgroundColor: '#fff5f0',
            borderRight: '1px solid #ff8c42',
            padding: '20px 0'
          }}>
            {sections.map(section => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  style={{
                    width: '100%',
                    padding: '15px 25px',
                    backgroundColor: isActive ? '#ff8c42' : 'transparent',
                    color: isActive ? 'white' : '#333',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.target.style.backgroundColor = '#e9ecef';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.target.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <Icon size={18} />
                  {section.label}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div style={{ flex: 1, padding: '30px' }}>
            {renderContent()}
            
            {/* Save Button */}
            <div style={{
              marginTop: '30px',
              paddingTop: '20px',
              borderTop: '1px solid #e9ecef',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                {saveMessage && (
                  <div style={{
                    color: '#28a745',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    {saveMessage}
                  </div>
                )}
              </div>
              <button
                onClick={handleSave}
                style={{
                  backgroundColor: '#ff8c42',
                  color: 'white',
                  border: 'none',
                  padding: '12px 25px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'background-color 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#e67e22'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#ff8c42'}
              >
                <Save size={16} />
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;