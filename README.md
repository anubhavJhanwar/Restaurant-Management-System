# 🍔 BurgerBoss - Restaurant Management System

A modern, Firebase-powered restaurant management system built with React and Node.js. Features real-time data synchronization, secure authentication, and complete restaurant operations management.

![Restaurant Management System](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Firebase](https://img.shields.io/badge/Firebase-Integrated-orange)
![React](https://img.shields.io/badge/React-18+-blue)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-black)

## 🔥 Firebase Edition Features

### 🔐 **Firebase Authentication**
- **Secure User Management**: Firebase-powered authentication with JWT tokens
- **Owner Accounts**: Create accounts with username, password, and 4-digit PIN
- **Role-Based Access**: Clean separation between different user roles
- **PIN Security**: 4-digit PIN system for secure operations

### 🔥 **Real-time Firebase Integration**
- **Live Data Sync**: All data stored and synced with Firebase Firestore
- **Real-time Updates**: Changes appear instantly across all devices
- **Cloud Storage**: No local database - everything in the cloud
- **Scalable Architecture**: Built for growth and multiple locations

### 📊 **Complete Restaurant Management**
- **Menu Management**: Add/delete recipes with Firebase persistence
- **Inventory Tracking**: Real-time stock management
- **Order System**: Complete order processing with extras (Extra Cheese Slice ₹15)
- **Expenditure Tracking**: Business expense management
- **Dashboard Analytics**: Real-time sales and performance metrics

## 🚀 Technology Stack

### **Backend (Serverless)**
- **Node.js** with Express.js on Vercel serverless functions
- **Firebase Firestore** for real-time database
- **Firebase Authentication** for user management
- **JWT** for secure token-based authentication
- **bcryptjs** for password and PIN hashing

### **Frontend**
- **React 18** with modern hooks and functional components
- **Clean Service Architecture** with dedicated auth and API services
- **Lucide React** for modern icons
- **Professional UI** with gradient designs and responsive layout
- **Real-time Updates** with Firebase integration

### **Deployment**
- **Vercel** for serverless deployment
- **Firebase** for database and authentication
- **Environment Variables** for secure credential management
- **Automatic Deployments** from GitHub

## 🚀 Quick Start

### **Live Demo**
🌐 **Access the live app**: [https://restaurant-management-system-sepla.vercel.app](https://restaurant-management-system-sepla.vercel.app)

### **Local Development**
```bash
# Clone repository
git clone https://github.com/anubhavJhanwar/Restaurant-Management-System.git
cd Restaurant-Management-System

# Install dependencies
npm install
cd client && npm install && cd ..

# Set up Firebase (see Firebase Setup section)
# Add environment variables to Vercel

# Start development
npm run dev
```

### **Firebase Setup**
1. Create Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore Database
3. Generate service account key
4. Add environment variables to Vercel:
   ```
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=your-client-email
   FIREBASE_PRIVATE_KEY=your-private-key
   ```

## 🔥 Firebase Features

### **Real-time Data Management**
- **Menu Items**: Add/delete recipes stored in Firebase Firestore
- **Inventory**: Real-time stock tracking with Firebase sync
- **Orders**: Complete order management with Firebase persistence
- **Expenditures**: Business expense tracking in the cloud
- **Users**: Secure user management with Firebase authentication

### **Security & Authentication**
- **JWT Authentication**: Secure token-based login system
- **PIN Protection**: 4-digit PIN for sensitive operations
- **Firebase Rules**: Database security rules for data protection
- **Environment Variables**: Secure credential management

## 📱 System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Client  │◄──►│ Vercel Functions │◄──►│ Firebase Cloud  │
│   (Frontend)    │    │   (Backend API)  │    │   (Database)    │
│                 │    │                  │    │                 │
│ • Clean UI      │    │ • JWT Auth       │    │ • Firestore DB  │
│ • Real-time     │    │ • Firebase SDK   │    │ • User Auth     │
│ • Responsive    │    │ • Serverless     │    │ • Real-time     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🚀 Getting Started

1. **Visit Live App**: [https://restaurant-management-system-sepla.vercel.app](https://restaurant-management-system-sepla.vercel.app)
2. **Create Account**: Sign up with username, password, and 4-digit PIN
3. **Add Data**: Create recipes, add inventory, track expenses
4. **Monitor Firebase**: Check Firebase Console to see real-time data sync
5. **Manage Restaurant**: Use dashboard, orders, and analytics features

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Anubhav Jhanwar**
- GitHub: [@anubhavJhanwar](https://github.com/anubhavJhanwar)

---

⭐ **Star this repository if you find it helpful!** ⭐

**BurgerBoss Firebase Edition** - Modern Restaurant Management in the Cloud 🔥