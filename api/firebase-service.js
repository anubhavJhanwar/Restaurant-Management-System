// Clean Firebase Service for BurgerBoss - All Features
const { db, auth, isConnected } = require('./firebase-config');
const bcrypt = require('bcryptjs');

class FirebaseService {
  
  // ==================== AUTHENTICATION ====================
  static async createUser(userData) {
    try {
      if (!isConnected()) throw new Error('Firebase not connected');
      
      const { username, password, role, full_name, pin } = userData;
      
      // Hash password and PIN
      const hashedPassword = await bcrypt.hash(password, 10);
      const hashedPin = await bcrypt.hash(pin.toString(), 10);
      
      const newUser = {
        username,
        password: hashedPassword,
        pin: hashedPin,
        role: role || 'Owner',
        full_name: full_name || username,
        active: true,
        created_at: new Date().toISOString()
      };
      
      // Save to Firestore
      const docRef = await db.collection('users').add(newUser);
      
      console.log('✅ User created in Firebase:', username);
      return { id: docRef.id, ...newUser };
      
    } catch (error) {
      console.error('❌ Error creating user:', error);
      throw error;
    }
  }
  
  static async authenticateUser(username, password) {
    try {
      if (!isConnected()) throw new Error('Firebase not connected');
      
      const snapshot = await db.collection('users')
        .where('username', '==', username)
        .where('active', '==', true)
        .get();
      
      if (snapshot.empty) {
        throw new Error('User not found');
      }
      
      const userDoc = snapshot.docs[0];
      const userData = userDoc.data();
      
      // Verify password
      const isValidPassword = await bcrypt.compare(password, userData.password);
      if (!isValidPassword) {
        throw new Error('Invalid password');
      }
      
      console.log('✅ User authenticated:', username);
      return { id: userDoc.id, ...userData };
      
    } catch (error) {
      console.error('❌ Authentication failed:', error);
      throw error;
    }
  }
  
  static async verifyPin(userId, pin) {
    try {
      if (!isConnected()) throw new Error('Firebase not connected');
      
      const userDoc = await db.collection('users').doc(userId).get();
      if (!userDoc.exists) throw new Error('User not found');
      
      const userData = userDoc.data();
      const isValidPin = await bcrypt.compare(pin.toString(), userData.pin);
      
      return isValidPin;
    } catch (error) {
      console.error('❌ PIN verification failed:', error);
      return false;
    }
  }

  // ==================== MENU ITEMS ====================
  static async getAllMenuItems() {
    try {
      if (!isConnected()) return [];
      
      const snapshot = await db.collection('menuItems')
        .where('active', '==', true)
        .orderBy('created_at', 'desc')
        .get();
      
      const items = [];
      snapshot.forEach(doc => {
        items.push({ id: doc.id, ...doc.data() });
      });
      
      console.log(`✅ Fetched ${items.length} menu items from Firebase`);
      return items;
      
    } catch (error) {
      console.error('❌ Error fetching menu items:', error);
      return [];
    }
  }

  static async addMenuItem(itemData) {
    try {
      if (!isConnected()) throw new Error('Firebase not connected');
      
      const newItem = {
        name: itemData.name,
        price: parseFloat(itemData.price),
        category: itemData.category || 'Burgers',
        ingredients: itemData.ingredients || [],
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const docRef = await db.collection('menuItems').add(newItem);
      
      console.log('✅ Menu item added to Firebase:', newItem.name);
      return { id: docRef.id, ...newItem };
      
    } catch (error) {
      console.error('❌ Error adding menu item:', error);
      throw error;
    }
  }

  static async deleteMenuItem(itemId) {
    try {
      if (!isConnected()) throw new Error('Firebase not connected');
      
      await db.collection('menuItems').doc(itemId).update({
        active: false,
        deleted_at: new Date().toISOString()
      });
      
      console.log('✅ Menu item deleted from Firebase:', itemId);
      return { success: true };
      
    } catch (error) {
      console.error('❌ Error deleting menu item:', error);
      throw error;
    }
  }

  // ==================== INVENTORY ====================
  static async getAllInventory() {
    try {
      if (!isConnected()) return [];
      
      const snapshot = await db.collection('inventory')
        .orderBy('name')
        .get();
      
      const items = [];
      snapshot.forEach(doc => {
        items.push({ id: doc.id, ...doc.data() });
      });
      
      console.log(`✅ Fetched ${items.length} inventory items from Firebase`);
      return items;
      
    } catch (error) {
      console.error('❌ Error fetching inventory:', error);
      return [];
    }
  }

  static async addInventoryItem(itemData) {
    try {
      if (!isConnected()) throw new Error('Firebase not connected');
      
      const newItem = {
        name: itemData.name,
        quantity: parseFloat(itemData.quantity),
        unit: itemData.unit,
        low_stock_threshold: parseFloat(itemData.low_stock_threshold) || 10,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const docRef = await db.collection('inventory').add(newItem);
      
      console.log('✅ Inventory item added to Firebase:', newItem.name);
      return { id: docRef.id, ...newItem };
      
    } catch (error) {
      console.error('❌ Error adding inventory item:', error);
      throw error;
    }
  }

  // ==================== EXPENDITURES ====================
  static async getAllExpenditures() {
    try {
      if (!isConnected()) return [];
      
      const snapshot = await db.collection('expenditures')
        .orderBy('created_at', 'desc')
        .get();
      
      const items = [];
      snapshot.forEach(doc => {
        items.push({ id: doc.id, ...doc.data() });
      });
      
      console.log(`✅ Fetched ${items.length} expenditures from Firebase`);
      return items;
      
    } catch (error) {
      console.error('❌ Error fetching expenditures:', error);
      return [];
    }
  }

  static async addExpenditure(expenditureData) {
    try {
      if (!isConnected()) throw new Error('Firebase not connected');
      
      const newExpenditure = {
        description: expenditureData.description,
        amount: parseFloat(expenditureData.amount),
        category: expenditureData.category,
        supplier: expenditureData.supplier || '',
        payment_status: 'pending',
        created_at: new Date().toISOString()
      };
      
      const docRef = await db.collection('expenditures').add(newExpenditure);
      
      console.log('✅ Expenditure added to Firebase:', newExpenditure.description);
      return { id: docRef.id, ...newExpenditure };
      
    } catch (error) {
      console.error('❌ Error adding expenditure:', error);
      throw error;
    }
  }

  static async deleteExpenditure(expenditureId) {
    try {
      if (!isConnected()) throw new Error('Firebase not connected');
      
      await db.collection('expenditures').doc(expenditureId).delete();
      
      console.log('✅ Expenditure deleted from Firebase:', expenditureId);
      return { success: true };
      
    } catch (error) {
      console.error('❌ Error deleting expenditure:', error);
      throw error;
    }
  }

  // ==================== ORDERS ====================
  static async getAllOrders() {
    try {
      if (!isConnected()) return [];
      
      const snapshot = await db.collection('orders')
        .orderBy('created_at', 'desc')
        .get();
      
      const orders = [];
      snapshot.forEach(doc => {
        orders.push({ id: doc.id, ...doc.data() });
      });
      
      console.log(`✅ Fetched ${orders.length} orders from Firebase`);
      return orders;
      
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      return [];
    }
  }

  static async getTodaysOrders() {
    try {
      if (!isConnected()) return [];
      
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      
      const snapshot = await db.collection('orders')
        .where('created_at', '>=', startOfDay.toISOString())
        .where('created_at', '<', endOfDay.toISOString())
        .orderBy('created_at', 'desc')
        .get();
      
      const orders = [];
      snapshot.forEach(doc => {
        orders.push({ id: doc.id, ...doc.data() });
      });
      
      console.log(`✅ Fetched ${orders.length} today's orders from Firebase`);
      return orders;
      
    } catch (error) {
      console.error('❌ Error fetching today\'s orders:', error);
      return [];
    }
  }

  static async addOrder(orderData) {
    try {
      if (!isConnected()) throw new Error('Firebase not connected');
      
      const newOrder = {
        items: orderData.items || [],
        total_amount: parseFloat(orderData.total_amount) || 0,
        payment_method: orderData.payment_method || 'Cash',
        customer_name: orderData.customer_name || 'Walk-in',
        status: 'completed',
        locked: false,
        created_at: new Date().toISOString()
      };
      
      const docRef = await db.collection('orders').add(newOrder);
      
      console.log('✅ Order added to Firebase:', docRef.id);
      return { id: docRef.id, ...newOrder };
      
    } catch (error) {
      console.error('❌ Error adding order:', error);
      throw error;
    }
  }

  // ==================== DASHBOARD STATS ====================
  static async getDashboardStats() {
    try {
      if (!isConnected()) {
        return { total_sales: 0, total_orders: 0, today_sales: 0, today_orders: 0 };
      }
      
      const [allOrders, todaysOrders] = await Promise.all([
        this.getAllOrders(),
        this.getTodaysOrders()
      ]);
      
      const totalSales = allOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
      const todaySales = todaysOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
      
      const stats = {
        total_sales: totalSales,
        total_orders: allOrders.length,
        today_sales: todaySales,
        today_orders: todaysOrders.length
      };
      
      console.log('✅ Dashboard stats calculated:', stats);
      return stats;
      
    } catch (error) {
      console.error('❌ Error calculating dashboard stats:', error);
      return { total_sales: 0, total_orders: 0, today_sales: 0, today_orders: 0 };
    }
  }

  // ==================== UTILITY ====================
  static async clearAllData() {
    try {
      if (!isConnected()) throw new Error('Firebase not connected');
      
      const collections = ['menuItems', 'inventory', 'expenditures', 'orders'];
      
      for (const collectionName of collections) {
        const snapshot = await db.collection(collectionName).get();
        const batch = db.batch();
        
        snapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        
        await batch.commit();
        console.log(`✅ Cleared ${collectionName} collection`);
      }
      
      return { success: true, message: 'All data cleared from Firebase' };
      
    } catch (error) {
      console.error('❌ Error clearing data:', error);
      throw error;
    }
  }
}

module.exports = FirebaseService;