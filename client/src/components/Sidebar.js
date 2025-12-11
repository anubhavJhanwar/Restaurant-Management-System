import React, { useState } from 'react';
import { BarChart3, Package, Menu, Receipt, CreditCard, TrendingDown, X } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'orders', label: "Today's Orders", icon: Receipt },
    { id: 'transactions', label: 'Transactions', icon: CreditCard },
    { id: 'expenditures', label: 'Expenditures', icon: TrendingDown },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'menu', label: 'Recipe', icon: Menu },
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
          padding: '25px 18px',
          zIndex: 1000,
          transition: 'left 0.3s ease',
          boxShadow: '0 10px 30px rgba(255, 140, 66, 0.3)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Logo */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '40px',
          marginTop: '10px'
        }}>
          <img 
            src="/Logo Main.png" 
            alt="BurgerBoss Logo" 
            style={{
              width: '100px',
              height: 'auto',
              marginBottom: '10px',
              borderRadius: '8px'
            }}
          />
          <div style={{
            color: 'white',
            fontSize: '18px',
            fontWeight: 'bold',
            textAlign: 'center',
            letterSpacing: '0.5px'
          }}>
            BurgerBoss
          </div>
        </div>
        
        {/* Navigation */}
        <nav style={{ flex: 1 }}>
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
                  padding: '14px 18px',
                  marginBottom: '8px',
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.25)' : 'transparent',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '15px',
                  fontWeight: '500',
                  transition: 'all 0.3s ease',
                  backdropFilter: isActive ? 'blur(10px)' : 'none',
                  boxShadow: isActive ? '0 4px 15px rgba(255, 255, 255, 0.1)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                    e.target.style.transform = 'translateX(5px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.transform = 'translateX(0)';
                  }
                }}
              >
                <Icon size={22} />
                {item.label}
              </button>
            );
          })}
        </nav>
        
        {/* Footer */}
        <div style={{
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '11px',
          textAlign: 'center',
          marginTop: 'auto',
          paddingTop: '20px'
        }}>
          <span style={{ fontSize: '10px', opacity: 0.8 }}>v2.0</span>
        </div>
      </div>
    </>
  );
};

export default Sidebar;