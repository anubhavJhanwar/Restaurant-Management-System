# 🍔 BurgerBoss - Restaurant Management System

A comprehensive, real-time restaurant management system built with React, Node.js, and SQLite. Features advanced user management, role-based access control, PIN security, and complete restaurant operations management.

![Restaurant Management System](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18+-blue)

## ✨ Latest Features (v2.0)

### 🔐 **Advanced Authentication System**
- **Dual Account Types**: Owner accounts (with PIN) and Default accounts (no PIN)
- **Account Limits**: Maximum 3 Owner accounts, 2 Default accounts
- **Clean Login Flow**: Separate sign-in and signup pages with proper validation
- **Role-Based Access**: Owners get full access, Default users get operational access
- **PIN Security**: 4-digit PIN system for secure operations

### 👥 **User Management (Owner Only)**
- **Account Overview**: Real-time statistics showing account usage (2/3 Owners, 1/2 Default)
- **User Administration**: View all accounts with creation dates and roles
- **Account Deletion**: Delete any user account (except your own) with confirmation
- **Activity Logging**: All user management actions are logged for security
- **Self-Protection**: Cannot delete your own account for safety

### 🎨 **Optimized UI/UX**
- **Compact Sidebar**: Fixed overflow issues, perfect viewport fit
- **Role-Based Menus**: Settings only visible to Owner accounts
- **Professional Design**: Clean, modern interface with proper spacing
- **Responsive Layout**: Works perfectly on all screen sizes
- **No Annoying Alerts**: Silent operations with clean user feedback

### 🔒 **Enhanced Security**
- **PIN Operations**: Lock/unlock orders, delete operations require PIN verification
- **Cross-PIN Support**: Any Owner/Manager PIN works for operations
- **Rate Limiting**: Protection against brute force attacks (20 attempts per 5 minutes)
- **JWT Authentication**: Secure token-based authentication system
- **Activity Logging**: Complete audit trail of all user actions

## 📊 Core Features

### 📈 **Real-time Dashboard**
- Live sales analytics with top-selling products display
- Total sales and orders tracking (₹ INR currency)
- Hourly transaction monitoring with local time
- Professional statistics cards with color coding
- Recent orders with payment status indicators

### 📦 **Smart Inventory Management**
- Quick-add common items: Aloo Patty, Chilli Herb Patty, Veg Patty, Paneer Patty
- Real-time stock level monitoring with color indicators
- Automatic inventory deduction on order processing
- Whole number quantity inputs (no decimals)
- Smart stock status tracking

### 🍽️ **Advanced Order Management**
- **Item-Specific Extras**: Each item can have its own extras (Extra Cheese Slice ₹15)
- **Order Segregation**: Items display separately with their specific extras
- **Payment Methods**: Cash (Offline), Online, Half Cash + Half Online
- **Lock System**: Lock orders without PIN, unlock requires PIN
- **Professional Bills**: Complete bill generation with order details

### 💳 **Transaction System**
- Complete transaction history with payment method badges
- Advanced filtering and search capabilities
- CSV export with payment method information
- Real-time sync with order payments
- Professional transaction display

### 💰 **Expenditure Management**
- Business expense tracking by category
- Payment status management
- No success alerts (clean UX)
- Manual entry system (no automatic additions)
- Complete expense analytics

### 🔄 **Real-time Features**
- Socket.io integration for instant updates
- Live inventory sync across all clients
- Real-time order and payment updates
- Automatic dashboard refresh

## 🚀 Technology Stack

### **Backend**
- **Node.js** with Express.js
- **Socket.io** for real-time communication
- **SQLite** with proper role constraints
- **bcryptjs** for password and PIN hashing
- **JWT** for secure authentication
- **Rate Limiting** for security

### **Frontend**
- **React 18** with hooks and functional components
- **Lucide React** for modern icons
- **Professional UI** with gradient designs
- **Responsive CSS** with proper overflow handling
- **Role-based rendering** for different user types

## 🛠️ Installation & Setup

### **Prerequisites**
- Node.js (v16 or higher)
- npm or yarn package manager

### **1. Clone Repository**
```bash
git clone https://github.com/anubhavJhanwar/BurgerBoss-Restaurant-Management.git
cd BurgerBoss-Restaurant-Management
```

### **2. Install Dependencies**
```bash
# Install server dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### **3. Start Development Servers**
```bash
# Start both server and client simultaneously
npm run dev

# Or start separately:
# Terminal 1 - Backend server
npm run server

# Terminal 2 - Frontend client  
npm run client
```

### **4. Access Application**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 👤 User Account System

### **Account Types**

#### **Owner Accounts** (Maximum 3)
- **Full Access**: All features including Settings and User Management
- **PIN Required**: 4-digit PIN for secure operations
- **Required Fields**: Username, Email, Password, PIN
- **Capabilities**: 
  - Create/delete user accounts
  - Access all settings
  - Perform all PIN-protected operations
  - View user management dashboard

#### **Default Accounts** (Maximum 2)
- **Operational Access**: Core restaurant features only
- **No PIN Required**: Simple username/password login
- **Required Fields**: Username, Password only
- **Capabilities**:
  - Dashboard, Orders, Transactions, Expenditures
  - Inventory management, Recipe management
  - Cannot access Settings or User Management

### **Getting Started**
1. **First Time Setup**: Create an Owner account via signup
2. **Add Staff**: Owner can create Default accounts for staff
3. **Login**: Use the clean login interface with automatic role detection
4. **Manage Users**: Owners can view and delete accounts via Settings → User Management

## 🔧 API Endpoints

### **Authentication**
```
POST /api/auth/signup-owner        # Create Owner account (max 3)
POST /api/auth/signup-default      # Create Default account (max 2)
POST /api/auth/owner-login         # Owner login
POST /api/auth/default-login       # Default account login
POST /api/auth/verify-pin          # Verify PIN for operations
POST /api/auth/change-pin          # Change PIN (Owner only)
```

### **User Management (Owner Only)**
```
GET    /api/admin/users            # Get all users with counts
DELETE /api/admin/users/:userId    # Delete user account
```

### **Core Operations**
```
GET    /api/dashboard/stats        # Dashboard statistics
GET    /api/dashboard/top-products # Top selling products
GET    /api/orders/today           # Today's orders
POST   /api/orders                 # Create order with extras
PUT    /api/orders/:id/lock        # Lock order (no PIN required)
POST   /api/orders/:id/unlock      # Unlock order (PIN required)
GET    /api/inventory              # Inventory management
GET    /api/menu                   # Recipe management
GET    /api/transactions           # Transaction history
GET    /api/expenditures           # Expenditure tracking
```

## 🎨 UI/UX Features

### **Design System**
- **Orange Gradient Theme**: Professional orange (#ff8c42) color scheme
- **Compact Sidebar**: Optimized for viewport with no overflow
- **Role-Based UI**: Different interfaces for Owner vs Default accounts
- **Clean Cards**: Modern white cards with subtle shadows and proper spacing
- **Professional Typography**: Consistent fonts and sizing throughout

### **User Experience**
- **No Annoying Alerts**: Silent operations with clean feedback
- **Whole Number Inputs**: Quantity fields only accept integers (1, 2, 3)
- **Smart Navigation**: Role-based menu items (Settings only for Owners)
- **Responsive Design**: Perfect on desktop, tablet, and mobile
- **Professional Workflow**: Clean signup → login → dashboard flow

## 🔒 Security Features

### **Authentication Security**
- **Password Hashing**: bcrypt with salt rounds for secure password storage
- **PIN Encryption**: 4-digit PINs are hashed and stored securely
- **JWT Tokens**: Secure token-based authentication with expiration
- **Rate Limiting**: 20 attempts per 5 minutes to prevent brute force

### **Access Control**
- **Role-Based Access**: Strict separation between Owner and Default capabilities
- **PIN Protection**: Critical operations require PIN verification
- **Self-Protection**: Users cannot delete their own accounts
- **Activity Logging**: Complete audit trail of all user actions

### **Data Protection**
- **Input Validation**: All inputs are validated and sanitized
- **SQL Injection Protection**: Parameterized queries throughout
- **CORS Configuration**: Proper cross-origin resource sharing setup
- **Error Handling**: Secure error messages without sensitive data exposure

## 📱 System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Client  │◄──►│   Express API    │◄──►│  SQLite Database│
│   (Port 3000)   │    │   (Port 5000)    │    │   (Local File)  │
│                 │    │                  │    │                 │
│ • Role-based UI │    │ • JWT Auth       │    │ • User accounts │
│ • PIN entry     │    │ • Rate limiting  │    │ • Role constraints│
│ • Real-time     │    │ • PIN verification│    │ • Activity logs │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │
         └───────────────────────┘
              Socket.io
           (Real-time Updates)
```

## 🎯 Production Deployment

### **Environment Setup**
```bash
# Create production environment file
echo "NODE_ENV=production" > .env
echo "PORT=5000" >> .env
echo "JWT_SECRET=your-super-secure-jwt-secret-key" >> .env
```

### **Build & Deploy**
```bash
# Build React frontend
cd client
npm run build
cd ..

# Start production server
npm start
```

## 🔍 Troubleshooting

### **Common Issues**
1. **Login Issues**: Check if rate limit exceeded (wait 5 minutes)
2. **Account Limits**: Maximum 3 Owners, 2 Default accounts
3. **PIN Problems**: PINs must be exactly 4 digits
4. **Database Issues**: Delete `restaurant.db` to reset (loses all data)
5. **Port Conflicts**: Change ports in `package.json` scripts

### **Development Tips**
- Check browser console for authentication errors
- Server logs show detailed authentication attempts
- Database constraints prevent invalid role assignments
- All PIN operations are logged for debugging

## 🎯 Future Enhancements

### **Immediate Roadmap**
- [ ] Password reset functionality
- [ ] Email notifications for account actions
- [ ] Advanced user permissions system
- [ ] Multi-location restaurant support
- [ ] Mobile app (React Native)

### **Advanced Features**
- [ ] Two-factor authentication (2FA)
- [ ] Advanced analytics dashboard
- [ ] Automated backup system
- [ ] Integration with POS systems
- [ ] Customer loyalty program

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Anubhav Jhanwar**
- GitHub: [@anubhavJhanwar](https://github.com/anubhavJhanwar)
- LinkedIn: [Connect with me](https://linkedin.com/in/anubhavjhanwar)

## 🙏 Acknowledgments

- Built with modern React and Node.js best practices
- Designed for real restaurant management needs
- Security-first approach with role-based access control
- Professional UI/UX with attention to detail
- Community-driven development

---

## 🚀 Quick Start Guide

1. **Clone & Install**: `git clone` → `npm install` → `cd client && npm install`
2. **Start Development**: `npm run dev`
3. **Create Owner Account**: Go to signup, select "Owner Account", fill all fields including PIN
4. **Login**: Use the clean login interface
5. **Add Staff**: Go to Settings → User Management → Create Default accounts
6. **Start Managing**: Use Dashboard, Orders, Inventory, and other features

⭐ **Star this repository if you find it helpful!** ⭐

---

**BurgerBoss v2.0** - Professional Restaurant Management Made Simple