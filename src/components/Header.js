import React, { useState } from 'react';
import { User, LogOut, ChevronDown } from 'lucide-react';

const Header = ({ user, onLogout }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 999
    }}>
      <div 
        style={{
          position: 'relative',
          display: 'inline-block'
        }}
        onMouseEnter={() => setShowDropdown(true)}
        onMouseLeave={() => setShowDropdown(false)}
      >
        {/* User Profile Button */}
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            backgroundColor: 'white',
            border: '2px solid #ff8c42',
            borderRadius: '25px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(255, 140, 66, 0.2)',
            transition: 'all 0.3s ease',
            fontSize: '14px',
            fontWeight: '500',
            color: '#333'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#fff5f0';
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 16px rgba(255, 140, 66, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'white';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(255, 140, 66, 0.2)';
          }}
        >
          <div style={{
            width: '32px',
            height: '32px',
            backgroundColor: '#ff8c42',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '12px'
          }}>
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>
              {user?.username || 'User'}
            </div>
            <div style={{ fontSize: '12px', color: '#ff8c42', fontWeight: '500' }}>
              {user?.role || 'Role'}
            </div>
          </div>
          <ChevronDown 
            size={16} 
            style={{ 
              color: '#ff8c42',
              transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease'
            }} 
          />
        </button>

        {/* Dropdown Menu */}
        {showDropdown && (
          <div style={{
            position: 'absolute',
            top: '100%',
            right: '0',
            marginTop: '8px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
            border: '1px solid #e2e8f0',
            minWidth: '200px',
            overflow: 'hidden',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{
              padding: '15px',
              borderBottom: '1px solid #f1f5f9'
            }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '4px' }}>
                {user?.full_name || user?.username}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                {user?.email}
              </div>
              <div style={{ 
                fontSize: '11px', 
                color: '#ff8c42', 
                fontWeight: '500',
                marginTop: '4px',
                padding: '2px 8px',
                backgroundColor: '#fff5f0',
                borderRadius: '12px',
                display: 'inline-block'
              }}>
                {user?.role}
              </div>
            </div>
            
            <button
              onClick={onLogout}
              style={{
                width: '100%',
                padding: '12px 15px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '14px',
                color: '#ef4444',
                fontWeight: '500',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#fef2f2'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Header;