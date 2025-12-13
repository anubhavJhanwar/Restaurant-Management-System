// API Configuration for BurgerBoss
const config = {
  // API Base URL - automatically detects environment
  API_BASE_URL: process.env.NODE_ENV === 'production' 
    ? window.location.origin  // Use same domain in production (Vercel)
    : 'http://localhost:5000', // Local development
  
  // WebSocket URL
  SOCKET_URL: process.env.NODE_ENV === 'production'
    ? window.location.origin
    : 'http://localhost:5000',
    
  // App Configuration
  APP_NAME: 'BurgerBoss',
  APP_VERSION: '2.1.0',
  
  // Features
  FEATURES: {
    REAL_TIME_UPDATES: true,
    FILE_UPLOAD: true,
    BULK_OPERATIONS: true,
    ADMIN_CONTROLS: true
  }
};

export default config;