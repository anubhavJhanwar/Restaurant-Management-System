import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import authService from '../services/authService';

const Login = ({ onLogin }) => {
  const [currentView, setCurrentView] = useState('signin'); // 'signin' or 'signup'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    pin: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const resetForm = () => {
    setFormData({ username: '', password: '', full_name: '', pin: '' });
    setError('');
    setSuccess('');
    setShowPassword(false);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
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
      const result = await authService.login(formData.username, formData.password);
      
      console.log('✅ Login successful:', result.user);
      onLogin(result.user);
      
    } catch (error) {
      setError(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.username || !formData.password || !formData.pin) {
      setError('Username, password, and PIN required');
      setLoading(false);
      return;
    }

    if (formData.pin.length !== 4) {
      setError('PIN must be 4 digits');
      setLoading(false);
      return;
    }

    try {
      const result = await authService.signup({
        username: formData.username,
        password: formData.password,
        full_name: formData.full_name || formData.username,
        pin: formData.pin
      });
      
      setSuccess('Account created successfully! Please sign in.');
      setCurrentView('signin');
      resetForm();
      
    } catch (error) {
      setError(error.message || 'Account creation failed');
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
              Firebase Edition - Restaurant Management
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

          {success && (
            <div style={{
              backgroundColor: '#d1fae5',
              color: '#065f46',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              {success}
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
                      backgroundColor: '#fafafa',
                      boxSizing: 'border-box'
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
                      backgroundColor: '#fafafa',
                      boxSizing: 'border-box'
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
                  Create Owner Account
                </h2>
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
                      backgroundColor: '#fafafa',
                      boxSizing: 'border-box'
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

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Full Name (Optional)
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  style={{
                    width: '100%',
                    padding: '14px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '10px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    backgroundColor: '#fafafa',
                    boxSizing: 'border-box'
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

              <div style={{ marginBottom: '20px' }}>
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
                      backgroundColor: '#fafafa',
                      boxSizing: 'border-box'
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
                  required
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
                    textAlign: 'center',
                    boxSizing: 'border-box'
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
                    Create Owner Account
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