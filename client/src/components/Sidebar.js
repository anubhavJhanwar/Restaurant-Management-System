import React, { useState } from 'react';
import { BarChart3, Package, Menu, Receipt, CreditCard, TrendingDown, X, LogOut, User, Settings } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'orders', label: "Today's Orders", icon: Receipt },
    { id: 'transactions', label: 'Transactions', icon: CreditCard },
    { id: 'expenditures', label: 'Expenditures', icon: TrendingDown },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'menu', label: 'Recipe', icon: Menu },
    // Only show Settings for Owner accounts
    ...(user?.role === 'Owner' ? [{ id: 'settings', label: 'Settings', icon: Settings }] : []),
  ];

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          zIndex: 1001,
          backgroundColor: '#ff8c42',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(255, 140, 66, 0.3)',
          transition: 'all 0.3s ease'
        }}
      >
        {isOpen ? <X size={24} /> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div style={{ width: '18px', height: '2px', backgroundColor: 'white', borderRadius: '1px' }}></div>
            <div style={{ width: '18px', height: '2px', backgroundColor: 'white', borderRadius: '1px' }}></div>
            <div style={{ width: '18px', height: '2px', backgroundColor: 'white', borderRadius: '1px' }}></div>
          </div>
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
            transition: 'opacity 0.3s ease'
          }}
        />
      )}

      {/* Sidebar */}
      <div
        style={{
          position: 'fixed',
          left: isOpen ? '20px' : '-260px',
          top: '20px',
          bottom: '20px',
          width: '260px',
          background: 'linear-gradient(135deg, #ff8c42 0%, #ff7b25 100%)',
          borderRadius: '20px',
          padding: '20px 15px',
          zIndex: 1000,
          transition: 'left 0.3s ease',
          boxShadow: '0 10px 30px rgba(255, 140, 66, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Compact Logo */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '25px',
          marginTop: '5px',
          flexShrink: 0
        }}>
          <img 
            src="/Logo Main.png" 
            alt="BurgerBoss Logo" 
            style={{
              width: '70px',
              height: 'auto',
              marginBottom: '8px',
              borderRadius: '6px'
            }}
          />
          <div style={{
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold',
            textAlign: 'center',
            letterSpacing: '0.5px'
          }}>
            BurgerBoss
          </div>
        </div>
        
        {/* Navigation */}
        <nav style={{ 
          flex: 1, 
          overflowY: 'auto',
          paddingRight: '5px',
          marginRight: '-5px'
        }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  marginBottom: '6px',
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.25)' : 'transparent',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.3s ease',
                  backdropFilter: isActive ? 'blur(10px)' : 'none',
                  boxShadow: isActive ? '0 4px 15px rgba(255, 255, 255, 0.1)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                    e.target.style.transform = 'translateX(3px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.transform = 'translateX(0)';
                  }
                }}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
        
        {/* User Profile Section */}
        <div style={{
          marginTop: 'auto',
          paddingTop: '10px',
          borderTop: '1px solid rgba(255, 255, 255, 0.2)',
          flexShrink: 0
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            marginBottom: '10px',
            maxWidth: '100%',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '28px',
              height: '28px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '11px',
              fontWeight: 'bold',
              flexShrink: 0
            }}>
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div style={{ 
              flex: 1, 
              minWidth: 0,
              maxWidth: 'calc(100% - 36px)'
            }}>
              <div style={{ 
                color: 'white', 
                fontSize: '10px', 
                fontWeight: '600',
                marginBottom: '1px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '100%'
              }}>
                {user?.username}
              </div>
              <div style={{ 
                color: 'rgba(255, 255, 255, 0.7)', 
                fontSize: '8px',
                fontWeight: '500',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '100%'
              }}>
                {user?.role}
              </div>
            </div>
          </div>
          
          <button
            onClick={onLogout}
            style={{
              width: '100%',
              padding: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: '500',
              transition: 'all 0.3s ease',
              marginBottom: '8px'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            <LogOut size={12} />
            Logout
          </button>
          
          <div style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '9px',
            textAlign: 'center',
            opacity: 0.8
          }}>
            v2.0
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;