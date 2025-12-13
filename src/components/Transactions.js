import React, { useState, useEffect } from 'react';
import { CreditCard, Calendar, DollarSign, TrendingUp, Search, Filter, Download } from 'lucide-react';
import io from 'socket.io-client';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Fetch initial data
    fetchTransactions();

    // Listen for real-time updates
    newSocket.on('order_updated', () => {
      fetchTransactions();
    });

    newSocket.on('sales_updated', () => {
      fetchTransactions();
    });

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchTerm, dateFilter]);

  const fetchTransactions = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/transactions');
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const filterTransactions = () => {
    if (!Array.isArray(transactions)) {
      setFilteredTransactions([]);
      return;
    }

    let filtered = [...transactions];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(transaction => 
        transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Date filter
    const now = new Date();
    if (dateFilter === 'today') {
      const today = now.toISOString().split('T')[0];
      filtered = filtered.filter(transaction => 
        transaction.created_at.startsWith(today)
      );
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(transaction => 
        new Date(transaction.created_at) >= weekAgo
      );
    } else if (dateFilter === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(transaction => 
        new Date(transaction.created_at) >= monthAgo
      );
    }

    setFilteredTransactions(filtered);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(value);
  };

  const exportTransactions = () => {
    const csvContent = [
      ['Order ID', 'Items', 'Amount', 'Payment Method', 'Date', 'Time'].join(','),
      ...filteredTransactions.map(transaction => [
        transaction.id.slice(-8),
        transaction.items.map(item => `${item.quantity}x ${item.name}`).join('; '),
        transaction.total_amount,
        transaction.payment_method === 'cash' ? 'Cash' : 
        transaction.payment_method === 'online' ? 'Online' : 'Cash+Online',
        new Date(transaction.created_at).toLocaleDateString(),
        new Date(transaction.created_at).toLocaleTimeString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const stats = {
    totalTransactions: Array.isArray(filteredTransactions) ? filteredTransactions.length : 0,
    totalRevenue: Array.isArray(filteredTransactions) ? filteredTransactions.reduce((sum, t) => sum + t.total_amount, 0) : 0,
    averageOrder: Array.isArray(filteredTransactions) && filteredTransactions.length > 0 
      ? filteredTransactions.reduce((sum, t) => sum + t.total_amount, 0) / filteredTransactions.length 
      : 0,
    todayTransactions: Array.isArray(transactions) ? transactions.filter(t => {
      const today = new Date().toISOString().split('T')[0];
      return t.created_at.startsWith(today);
    }).length : 0
  };

  return (
    <div className="transactions-container" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#33312E' }}>Transaction Management</h1>
        <button 
          onClick={exportTransactions}
          style={{
            backgroundColor: '#22c55e',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '16px',
            boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
          }}
        >
          <Download size={20} />
          Export CSV
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px', 
        marginBottom: '30px' 
      }}>
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          borderLeft: '4px solid #ff8c42'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <CreditCard size={24} style={{ color: '#ff8c42' }} />
            <span style={{ fontSize: '14px', color: '#666' }}>Total Transactions</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#33312E' }}>
            {stats.totalTransactions}
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          borderLeft: '4px solid #22c55e'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <DollarSign size={24} style={{ color: '#22c55e' }} />
            <span style={{ fontSize: '14px', color: '#666' }}>Total Revenue</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#33312E' }}>
            {formatCurrency(stats.totalRevenue)}
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          borderLeft: '4px solid #3b82f6'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <TrendingUp size={24} style={{ color: '#3b82f6' }} />
            <span style={{ fontSize: '14px', color: '#666' }}>Average Order</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#33312E' }}>
            {formatCurrency(stats.averageOrder)}
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          borderLeft: '4px solid #8b5cf6'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Calendar size={24} style={{ color: '#8b5cf6' }} />
            <span style={{ fontSize: '14px', color: '#666' }}>Today's Transactions</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#33312E' }}>
            {stats.todayTransactions}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        marginBottom: '20px',
        display: 'flex',
        gap: '16px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '250px' }}>
          <Search size={20} style={{ color: '#666' }} />
          <input
            type="text"
            placeholder="Search by order ID, customer, or items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={20} style={{ color: '#666' }} />
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '14px',
              minWidth: '120px'
            }}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Transactions List */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #f3f4f6' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#33312E' }}>
            Completed Transactions ({filteredTransactions.length})
          </h3>
        </div>
        
        <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
          {filteredTransactions.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
              {searchTerm || dateFilter !== 'all' ? 'No transactions match your filters' : 'No completed transactions yet'}
            </div>
          ) : (
            filteredTransactions.map((transaction, index) => (
              <div key={transaction.id} style={{
                padding: '20px 24px',
                borderBottom: index < filteredTransactions.length - 1 ? '1px solid #f3f4f6' : 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                    <div style={{
                      backgroundColor: '#ff8c42',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      #{transaction.id.slice(-8)}
                    </div>
                    <span style={{ fontWeight: '600', fontSize: '16px' }}>
                      Order Transaction
                    </span>
                  </div>
                  
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                    {transaction.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                  </div>
                  
                  <div style={{ fontSize: '12px', color: '#999', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{new Date(transaction.created_at).toLocaleString()}</span>
                    <span style={{
                      backgroundColor: transaction.payment_method === 'cash' ? '#22c55e' : 
                                     transaction.payment_method === 'online' ? '#3b82f6' : '#f59e0b',
                      color: 'white',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: '600'
                    }}>
                      {transaction.payment_method === 'cash' ? 'CASH' : 
                       transaction.payment_method === 'online' ? 'ONLINE' : 'CASH+ONLINE'}
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#22c55e' }}>
                    {formatCurrency(transaction.total_amount)}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#22c55e',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '4px'
                  }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#22c55e',
                      borderRadius: '50%'
                    }}></div>
                    PAID
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Transactions;