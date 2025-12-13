// Clean Authentication Service for BurgerBoss Firebase
import config from '../config';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('burgerboss_token');
    this.user = JSON.parse(localStorage.getItem('burgerboss_user') || 'null');
  }

  // Login with username/password
  async login(username, password) {
    try {
      const response = await fetch(`${config.API_BASE_URL}${config.ENDPOINTS.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store authentication data
      this.token = data.token;
      this.user = data.user;
      
      localStorage.setItem('burgerboss_token', this.token);
      localStorage.setItem('burgerboss_user', JSON.stringify(this.user));

      console.log('✅ Login successful:', this.user.username);
      return data;

    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  }

  // Create new account
  async signup(userData) {
    try {
      const response = await fetch(`${config.API_BASE_URL}${config.ENDPOINTS.SIGNUP}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      console.log('✅ Account created:', data.user.username);
      return data;

    } catch (error) {
      console.error('❌ Signup error:', error);
      throw error;
    }
  }

  // Verify PIN for sensitive operations
  async verifyPin(pin) {
    try {
      if (!this.token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${config.API_BASE_URL}${config.ENDPOINTS.VERIFY_PIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
        body: JSON.stringify({ pin }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'PIN verification failed');
      }

      return data.valid;

    } catch (error) {
      console.error('❌ PIN verification error:', error);
      return false;
    }
  }

  // Logout
  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('burgerboss_token');
    localStorage.removeItem('burgerboss_user');
    console.log('✅ Logged out successfully');
  }

  // Check if user is authenticated
  isAuthenticated() {
    return this.token && this.user;
  }

  // Get current user
  getCurrentUser() {
    return this.user;
  }

  // Get authorization headers
  getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`,
    };
  }

  // Check if user has specific role
  hasRole(role) {
    return this.user && this.user.role === role;
  }

  // Check if user is owner
  isOwner() {
    return this.hasRole('Owner');
  }

  // Check if user is staff
  isStaff() {
    return this.hasRole('Default');
  }
}

// Create singleton instance
const authService = new AuthService();
export default authService;