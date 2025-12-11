import React, { useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TodaysOrders from './components/TodaysOrders';
import Transactions from './components/Transactions';
import Expenditures from './components/Expenditures';
import Inventory from './components/Inventory';
import Menu from './components/Menu';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'orders':
        return <TodaysOrders />;
      case 'transactions':
        return <Transactions />;
      case 'expenditures':
        return <Expenditures />;
      case 'inventory':
        return <Inventory />;
      case 'menu':
        return <Menu />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="App">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
