// Clean API Configuration for BurgerBoss - Firebase Ready
const config = {
  // API Base URL - Vercel serverless functions
  API_BASE_URL: process.env.NODE_ENV === 'production' 
    ? window.location.origin + '/api'  // Vercel: /api routes
    : 'http://localhost:3000/api',     // Local development
  
  // App Configuration
  APP_NAME: 'BurgerBoss',
  APP_VERSION: '3.0.0 - Firebase Edition',
  
  // API Endpoints
  ENDPOINTS: {
    // Authentication
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    VERIFY_PIN: '/auth/verify-pin',
    
    // Menu Management
    MENU: '/menu',
    MENU_EXTRAS: '/menu-extras',
    
    // Inventory
    INVENTORY: '/inventory',
    
    // Expenditures
    EXPENDITURES: '/expenditures',
    
    // Orders
    ORDERS: '/orders',
    ORDERS_TODAY: '/orders/today',
    
    // Dashboard
    DASHBOARD_STATS: '/dashboard/stats',
    DASHBOARD_HOURLY: '/dashboard/hourly-sales',
    DASHBOARD_TOP_PRODUCTS: '/dashboard/top-products',
    
    // Admin
    ADMIN_CLEAR_DATA: '/admin/clear-data',
    
    // Health Check
    TEST: '/test'
  },
  
  // Features
  FEATURES: {
    FIREBASE_INTEGRATION: true,
    REAL_TIME_SYNC: true,
    BULK_OPERATIONS: true,
    ADMIN_CONTROLS: true,
    PIN_VERIFICATION: true
  },
  
  // Default Values
  DEFAULTS: {
    MENU_CATEGORY: 'Burgers',
    PAYMENT_METHOD: 'Cash',
    LOW_STOCK_THRESHOLD: 10
  }
};

export default config;