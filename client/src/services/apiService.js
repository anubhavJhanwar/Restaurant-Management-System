// Clean API Service for BurgerBoss Firebase Integration
import config from '../config';
import authService from './authService';

class ApiService {
  
  // Generic API call method
  async apiCall(endpoint, options = {}) {
    try {
      const url = `${config.API_BASE_URL}${endpoint}`;
      const defaultOptions = {
        headers: authService.isAuthenticated() 
          ? authService.getAuthHeaders() 
          : { 'Content-Type': 'application/json' },
      };

      const response = await fetch(url, { ...defaultOptions, ...options });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data;

    } catch (error) {
      console.error(`❌ API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // ==================== MENU OPERATIONS ====================
  async getMenuItems() {
    return this.apiCall(config.ENDPOINTS.MENU);
  }

  async addMenuItem(itemData) {
    return this.apiCall(config.ENDPOINTS.MENU, {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  }

  async deleteMenuItem(itemId) {
    return this.apiCall(`${config.ENDPOINTS.MENU}/${itemId}`, {
      method: 'DELETE',
    });
  }

  async getMenuExtras() {
    return this.apiCall(config.ENDPOINTS.MENU_EXTRAS);
  }

  // ==================== INVENTORY OPERATIONS ====================
  async getInventory() {
    return this.apiCall(config.ENDPOINTS.INVENTORY);
  }

  async addInventoryItem(itemData) {
    return this.apiCall(config.ENDPOINTS.INVENTORY, {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  }

  // ==================== EXPENDITURE OPERATIONS ====================
  async getExpenditures() {
    return this.apiCall(config.ENDPOINTS.EXPENDITURES);
  }

  async addExpenditure(expenditureData) {
    return this.apiCall(config.ENDPOINTS.EXPENDITURES, {
      method: 'POST',
      body: JSON.stringify(expenditureData),
    });
  }

  async deleteExpenditure(expenditureId) {
    return this.apiCall(`${config.ENDPOINTS.EXPENDITURES}/${expenditureId}`, {
      method: 'DELETE',
    });
  }

  // ==================== ORDER OPERATIONS ====================
  async getOrders() {
    return this.apiCall(config.ENDPOINTS.ORDERS);
  }

  async getTodaysOrders() {
    return this.apiCall(config.ENDPOINTS.ORDERS_TODAY);
  }

  async createOrder(orderData) {
    return this.apiCall(config.ENDPOINTS.ORDERS, {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  // ==================== DASHBOARD OPERATIONS ====================
  async getDashboardStats() {
    return this.apiCall(config.ENDPOINTS.DASHBOARD_STATS);
  }

  async getHourlySales() {
    return this.apiCall(config.ENDPOINTS.DASHBOARD_HOURLY);
  }

  async getTopProducts() {
    return this.apiCall(config.ENDPOINTS.DASHBOARD_TOP_PRODUCTS);
  }

  // ==================== ADMIN OPERATIONS ====================
  async clearAllData() {
    return this.apiCall(config.ENDPOINTS.ADMIN_CLEAR_DATA, {
      method: 'POST',
    });
  }

  // ==================== HEALTH CHECK ====================
  async testConnection() {
    return this.apiCall(config.ENDPOINTS.TEST);
  }
}

// Create singleton instance
const apiService = new ApiService();
export default apiService;