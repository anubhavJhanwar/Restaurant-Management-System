# 🍔 Restaurant Management System

A comprehensive, real-time restaurant management system built with React, Node.js, and SQLite. Features include live analytics, inventory management, recipe management, order processing, and expenditure tracking.

![Restaurant Management System](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18+-blue)

## ✨ Features

### 📊 **Real-time Dashboard**
- Live sales analytics with interactive charts
- Total sales and orders tracking (₹ INR currency)
- Hourly transaction monitoring with local time
- Sales by category bar chart
- Recent orders with payment status indicators

### 📦 **Bulk Inventory Management**
- Quick-add common restaurant ingredients
- Real-time stock level monitoring with color indicators
- Automatic inventory deduction on order processing
- Simple 3-field system (Name, Quantity, Unit)
- Smart stock status (Well Stocked/Medium/Low)

### 🍽️ **Recipe Management (Menu)**
- Detailed recipe creation with exact ingredient quantities
- Real-time ingredient availability checking
- Complete CRUD operations (Create, Read, Update, Delete)
- Excel bulk upload with template download
- Visual recipe cards with ingredient requirements

### 📋 **Today's Orders**
- Custom order ID format: #BBDDMMXX (BB + Date + Month + Order Number)
- Complete order management with CRUD operations
- Real-time payment status tracking
- Professional order display with status indicators
- Bill generation and printing

### 💳 **Transaction Management**
- All paid orders with advanced filtering
- Search by order ID, items, or date ranges
- Export to CSV functionality
- Comprehensive transaction analytics
- Real-time sync with order payments

### 💰 **Expenditure Tracking**
- Track all business expenses by category
- Payment status management (Paid/Unpaid)
- Supplier information tracking
- Real-time expenditure analytics
- Complete expense CRUD operations

### 🔄 **Real-time Synchronization**
- Socket.io integration for instant updates
- Live inventory sync across all clients
- Real-time order and payment updates
- Automatic chart and analytics refresh

## 🚀 Technology Stack

### **Backend**
- **Node.js** with Express.js
- **Socket.io** for real-time communication
- **SQLite** database with local time support
- **UUID** for unique ID generation
- RESTful API architecture

### **Frontend**
- **React 18** with functional components and hooks
- **Recharts** for interactive data visualization
- **Lucide React** for modern icons
- **React Dropzone** for file uploads
- **XLSX** for Excel file processing
- Responsive CSS Grid and Flexbox layout

### **Key Libraries**
- `socket.io-client` - Real-time client communication
- `recharts` - Charts and data visualization
- `xlsx` - Excel file processing
- `react-dropzone` - Drag & drop file uploads
- `lucide-react` - Modern icon library

## 📱 System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Client  │◄──►│   Express API    │◄──►│  SQLite Database│
│   (Port 3000)   │    │   (Port 5000)    │    │   (Local File)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │
         └───────────────────────┘
              Socket.io
           (Real-time Updates)
```

## 🛠️ Installation & Setup

### **Prerequisites**
- Node.js (v16 or higher)
- npm or yarn package manager

### **1. Clone Repository**
```bash
git clone https://github.com/anubhavJhanwar/Restaurant-Management-System.git
cd Restaurant-Management-System
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

## 📊 Database Schema

### **Core Tables**
```sql
-- Inventory Management
inventory (id, name, quantity, unit, created_at)

-- Recipe/Menu Management  
menu_items (id, name, price, category, ingredients, active, created_at)

-- Order Processing
orders (id, items, total_amount, status, payment_status, created_at)

-- Expense Tracking
expenditures (id, description, amount, category, payment_status, supplier, created_at)

-- Analytics
sales_analytics (id, date, hour, gross_sales, net_sales, profit, transactions, created_at)
```

## 🎯 Key Features Explained

### **Smart Inventory System**
- **Bulk Management**: Add common items like "Burger Buns", "Beef Patty", "Cheese Slices"
- **Auto-Deduction**: When orders are placed, ingredients are automatically deducted
- **Real-time Sync**: All inventory changes update instantly across all clients
- **Visual Indicators**: Color-coded stock levels (Green/Yellow/Red)

### **Recipe Management**
- **Detailed Recipes**: Define exact quantities (e.g., "2 Beef Patty pieces", "0.05 kg Lettuce")
- **Availability Checking**: Real-time ingredient availability with color coding
- **Excel Integration**: Bulk upload recipes via Excel with template download
- **CRUD Operations**: Full create, read, update, delete functionality

### **Order Processing**
- **Custom IDs**: Format #BB121101 (BB + Day + Month + Order Number)
- **Real-time Processing**: Instant inventory deduction and updates
- **Payment Tracking**: Visual status indicators with colored dots
- **Bill Generation**: Professional bill printing with order details

### **Analytics & Reporting**
- **Live Charts**: Real-time sales by category, hourly transactions
- **Local Time**: All timestamps use your laptop's local time zone
- **Currency**: Indian Rupees (₹) formatting throughout
- **Export Options**: CSV export for transaction history

## 🔧 API Endpoints

### **Dashboard Analytics**
```
GET /api/dashboard/stats           # Daily sales statistics
GET /api/dashboard/hourly-sales    # Hourly transaction data  
GET /api/dashboard/category-sales  # Sales by category
GET /api/dashboard/recent-orders   # Recent order activity
```

### **Inventory Management**
```
GET    /api/inventory              # Get all inventory items
POST   /api/inventory              # Add new inventory item
PUT    /api/inventory/:id          # Update inventory item
DELETE /api/inventory/:id          # Delete inventory item
```

### **Recipe/Menu Management**
```
GET    /api/menu                   # Get all menu items
POST   /api/menu                   # Add new menu item
PUT    /api/menu/:id               # Update menu item
DELETE /api/menu/:id               # Delete menu item
POST   /api/menu/bulk              # Bulk upload from Excel
```

### **Order Processing**
```
GET    /api/orders/today           # Get today's orders
GET    /api/orders/history         # Get order history
POST   /api/orders                 # Create new order
PUT    /api/orders/:id             # Update order
DELETE /api/orders/:id             # Delete order (restores inventory)
PUT    /api/orders/:id/payment     # Update payment status
```

### **Expenditure Tracking**
```
GET    /api/expenditures           # Get all expenditures
POST   /api/expenditures           # Add new expenditure
PUT    /api/expenditures/:id/payment # Update payment status
DELETE /api/expenditures/:id       # Delete expenditure
GET    /api/transactions           # Get paid transactions
```

## 🎨 UI/UX Features

### **Design System**
- **Orange Gradient Sidebar**: Modern floating design with smooth animations
- **Professional Cards**: Clean white cards with subtle shadows
- **Color Coding**: Consistent color scheme throughout (Orange/Green/Red)
- **Responsive Layout**: Works on desktop, tablet, and mobile devices

### **User Experience**
- **No Annoying Alerts**: Silent operations with console logging only
- **Real-time Updates**: Instant feedback without page refreshes
- **Intuitive Navigation**: Clear sidebar with icon-based navigation
- **Professional Typography**: Clean, readable fonts and spacing

## 🚀 Production Deployment

### **Environment Setup**
```bash
# Create production environment file
echo "NODE_ENV=production" > .env
echo "PORT=5000" >> .env
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

### **Docker Deployment** (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN cd client && npm ci && npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

## 🔍 Troubleshooting

### **Common Issues**
1. **Port Conflicts**: Change ports in `package.json` scripts
2. **Database Reset**: Delete `restaurant.db` file to start fresh
3. **Socket Issues**: Ensure both servers are running on correct ports
4. **Time Zone**: System automatically uses your laptop's local time

### **Development Tips**
- Use browser DevTools to monitor WebSocket connections
- Check server console for API errors and logs
- Database file is created automatically on first run
- All operations are logged to console for debugging

## 🎯 Future Enhancements

### **Immediate Roadmap**
- [ ] Multi-restaurant chain support
- [ ] Advanced reporting dashboard
- [ ] Mobile app (React Native)
- [ ] Payment gateway integration
- [ ] Staff management system

### **Advanced Features**
- [ ] Machine Learning demand forecasting
- [ ] Dynamic pricing optimization
- [ ] Customer behavior analytics
- [ ] IoT kitchen equipment integration
- [ ] Voice ordering system

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
- Inspired by real restaurant management needs
- Designed for scalability and performance
- Community-driven development approach

---

⭐ **Star this repository if you find it helpful!** ⭐