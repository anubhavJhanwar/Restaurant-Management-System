import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import config from '../config';

const Login = ({ onLogin }) => {
  const [currentView, setCurrentView] = useState('signin'); // 'signin' or 'signup'
  const [accountType, setAccountType] = useState('owner'); // 'owner' or 'default'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    pin: ''
  });
  const [error, setError] = useState('');

  const resetForm = () => {
    setFormData({ username: '', password: '', email: '', pin: '' });
    setError('');
    setShowPassword(false);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.username || !formData.password) {
      setError('Username and password required');
      setLoading(false);
      return;
    }

    try {
      // Try owner login first, then default login
      let response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        }),
      });

      if (!response.ok) {
        // Try default login if owner login fails
        response = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password
          }),
        });
      }

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLogin(data.user);
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate based on account type
    if (accountType === 'owner') {
      if (!formData.username || !formData.email || !formData.password || !formData.pin) {
        setError('All fields are required for Owner account');
        setLoading(false);
        return;
      }
      if (formData.pin.length !== 4 || !/^\d{4}$/.test(formData.pin)) {
        setError('PIN must be exactly 4 digits');
        setLoading(false);
        return;
      }
    } else {
      if (!formData.username || !formData.password) {
        setError('Username and password are required for Default account');
        setLoading(false);
        return;
      }
    }

    try {
      const endpoint = accountType === 'owner' ? 'signup-owner' : 'signup-default';
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Don't auto-login, just show success and go back to signin
        setError('');
        alert(`${accountType === 'owner' ? 'Owner' : 'Default'} account created successfully! Please sign in.`);
        setCurrentView('signin');
        resetForm();
      } else {
        setError(data.error || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FF7900 0%, #ff8c42 50%, #ff7b25 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
        overflow: 'hidden',
        width: '100%',
        maxWidth: '420px',
        border: '1px solid #e2e8f0'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #ff8c42 0%, #ff7b25 100%)',
          padding: '35px 30px',
          textAlign: 'center',
          color: 'white',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)'
          }}></div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <img 
              src="/Logo Main.png" 
              alt="BurgerBoss Logo" 
              style={{
                width: '85px',
                height: 'auto',
                marginBottom: '15px',
                borderRadius: '12px',
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)'
              }}
            />
            <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 'bold', letterSpacing: '0.5px' }}>
              BurgerBoss
            </h1>
            <p style={{ margin: '8px 0 0 0', opacity: 0.95, fontSize: '14px', fontWeight: '400' }}>
              Restaurant Management System
            </p>
          </div>
        </div>

        {/* Form */}
        <div style={{ padding: '35px' }}>
          {error && (
            <div style={{
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          {currentView === 'signin' ? (
            // SIGN IN FORM
            <form onSubmit={handleSignIn}>
              <h2 style={{ 
                textAlign: 'center', 
                marginBottom: '30px', 
                fontSize: '24px', 
                fontWeight: '600',
                color: '#374151'
              }}>
                Sign In
              </h2>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Username
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={20} style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#ff8c42'
                  }} />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Enter your username"
                    required
                    style={{
                      width: '100%',
                      padding: '14px 14px 14px 48px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '10px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      backgroundColor: '#fafafa'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#ff8c42';
                      e.target.style.backgroundColor = 'white';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.backgroundColor = '#fafafa';
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '25px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={20} style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#ff8c42'
                  }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    required
                    style={{
                      width: '100%',
                      padding: '14px 48px 14px 48px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '10px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      backgroundColor: '#fafafa'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#ff8c42';
                      e.target.style.backgroundColor = 'white';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.backgroundColor = '#fafafa';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#64748b',
                      padding: '4px'
                    }}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: loading ? '#ccc' : '#ff8c42',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'background-color 0.3s ease',
                  marginBottom: '20px'
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.target.style.backgroundColor = '#e67e22';
                }}
                onMouseLeave={(e) => {
                  if (!loading) e.target.style.backgroundColor = '#ff8c42';
                }}
              >
                {loading ? 'Signing In...' : (
                  <>
                    <LogIn size={20} />
                    Sign In
                  </>
                )}
              </button>

              <div style={{ textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentView('signup');
                    resetForm();
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ff8c42',
                    fontSize: '14px',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Create New Account
                </button>
              </div>
            </form>
          ) : (
            // SIGN UP FORM
            <form onSubmit={handleSignUp}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentView('signin');
                    resetForm();
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    fontSize: '14px',
                    cursor: 'pointer',
                    marginRight: '10px'
                  }}
                >
                  ← Back
                </button>
                <h2 style={{ 
                  fontSize: '24px', 
                  fontWeight: '600',
                  color: '#374151',
                  margin: 0
                }}>
                  Create Account
                </h2>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Account Type
                </label>
                <select
                  value={accountType}
                  onChange={(e) => {
                    setAccountType(e.target.value);
                    setFormData({ ...formData, email: '', pin: '' });
                  }}
                  style={{
                    width: '100%',
                    padding: '14px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '10px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    backgroundColor: '#fafafa'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#ff8c42';
                    e.target.style.backgroundColor = 'white';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.backgroundColor = '#fafafa';
                  }}
                >
                  <option value="owner">Owner Account (with PIN) - Max 3</option>
                  <option value="default">Default Account (no PIN) - Max 2</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Username
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={20} style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#ff8c42'
                  }} />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Enter username"
                    required
                    style={{
                      width: '100%',
                      padding: '14px 14px 14px 48px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '10px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      backgroundColor: '#fafafa'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#ff8c42';
                      e.target.style.backgroundColor = 'white';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.backgroundColor = '#fafafa';
                    }}
                  />
                </div>
              </div>

              {accountType === 'owner' && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '600',
                    color: '#374151'
                  }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                    required={accountType === 'owner'}
                    style={{
                      width: '100%',
                      padding: '14px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '10px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      backgroundColor: '#fafafa'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#ff8c42';
                      e.target.style.backgroundColor = 'white';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.backgroundColor = '#fafafa';
                    }}
                  />
                </div>
              )}

              <div style={{ marginBottom: accountType === 'owner' ? '20px' : '25px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={20} style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#ff8c42'
                  }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter password"
                    required
                    style={{
                      width: '100%',
                      padding: '14px 48px 14px 48px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '10px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      backgroundColor: '#fafafa'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#ff8c42';
                      e.target.style.backgroundColor = 'white';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.backgroundColor = '#fafafa';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#64748b',
                      padding: '4px'
                    }}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {accountType === 'owner' && (
                <div style={{ marginBottom: '25px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '600',
                    color: '#374151'
                  }}>
                    Set Your PIN (4 digits)
                  </label>
                  <input
                    type="password"
                    name="pin"
                    value={formData.pin}
                    onChange={handleInputChange}
                    placeholder="Enter 4-digit PIN"
                    maxLength={4}
                    required={accountType === 'owner'}
                    style={{
                      width: '100%',
                      padding: '14px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '10px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      backgroundColor: '#fafafa',
                      letterSpacing: '2px',
                      textAlign: 'center'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#ff8c42';
                      e.target.style.backgroundColor = 'white';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.backgroundColor = '#fafafa';
                    }}
                  />
                  <div style={{
                    fontSize: '12px',
                    color: '#64748b',
                    marginTop: '6px',
                    textAlign: 'center'
                  }}>
                    This PIN will be used for secure operations
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: loading ? '#ccc' : '#ff8c42',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'background-color 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.target.style.backgroundColor = '#e67e22';
                }}
                onMouseLeave={(e) => {
                  if (!loading) e.target.style.backgroundColor = '#ff8c42';
                }}
              >
                {loading ? 'Creating Account...' : (
                  <>
                    <UserPlus size={20} />
                    Create {accountType === 'owner' ? 'Owner' : 'Default'} Account
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;