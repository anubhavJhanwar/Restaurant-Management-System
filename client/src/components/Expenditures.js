import React, { useState, useEffect } from 'react';
import { Plus, DollarSign, Calendar, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import io from 'socket.io-client';
import PinVerification from './PinVerification';

const Expenditures = () => {
  const [expenditures, setExpenditures] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExpenditure, setNewExpenditure] = useState({
    description: '',
    amount: '',
    category: '',
    supplier: ''
  });
  const [showPinModal, setShowPinModal] = useState(false);
  const [targetExpenditureId, setTargetExpenditureId] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Fetch initial data
    fetchExpenditures();

    // Listen for real-time updates
    newSocket.on('expenditure_updated', () => {
      fetchExpenditures();
    });

    return () => newSocket.close();
  }, []);

  const fetchExpenditures = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/expenditures');
      const data = await response.json();
      setExpenditures(data);
    } catch (error) {
      console.error('Error fetching expenditures:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:5000/api/expenditures', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newExpenditure,
          amount: parseFloat(newExpenditure.amount)
        }),
      });

      if (response.ok) {
        setShowAddModal(false);
        setNewExpenditure({
          description: '',
          amount: '',
          category: '',
          supplier: ''
        });
        fetchExpenditures();
      }
    } catch (error) {
      console.error('Error adding expenditure:', error);
    }
  };

  const updatePaymentStatus = async (id, status) => {
    try {
      const response = await fetch(`http://localhost:5000/api/expenditures/${id}/payment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ payment_status: status }),
      });

      if (response.ok) {
        fetchExpenditures();
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };

  const requestPinForDelete = (expenditureId) => {
    setTargetExpenditureId(expenditureId);
    setShowPinModal(true);
  };

  const handlePinVerification = (pinValue) => {
    deleteExpenditureWithPin(targetExpenditureId, pinValue);
  };

  const deleteExpenditureWithPin = async (id, pin) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/expenditures/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ pin: pin }) // Use actual PIN value
      });

      if (response.ok) {
        fetchExpenditures();
      } else {
        const data = await response.json();
        alert('Failed to delete expenditure: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting expenditure:', error);
      alert('Error deleting expenditure');
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(value);
  };

  const stats = {
    totalExpenditures: expenditures.length,
    totalAmount: expenditures.reduce((sum, exp) => sum + exp.amount, 0),
    paidAmount: expenditures.filter(exp => exp.payment_status === 'paid').reduce((sum, exp) => sum + exp.amount, 0),
    unpaidAmount: expenditures.filter(exp => exp.payment_status === 'unpaid').reduce((sum, exp) => sum + exp.amount, 0),
    paidCount: expenditures.filter(exp => exp.payment_status === 'paid').length,
    unpaidCount: expenditures.filter(exp => exp.payment_status === 'unpaid').length
  };

  return (
    <div className="expenditures-container" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#33312E' }}>Expenditure Management</h1>
        <button 
          onClick={() => setShowAddModal(true)}
          style={{
            backgroundColor: '#ff8c42',
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
            boxShadow: '0 4px 12px rgba(255, 140, 66, 0.3)'
          }}
        >
          <Plus size={20} />
          Add Expenditure
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
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
            <DollarSign size={24} style={{ color: '#ff8c42' }} />
            <span style={{ fontSize: '14px', color: '#666' }}>Total Amount</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#33312E' }}>
            {formatCurrency(stats.totalAmount)}
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
            <CheckCircle size={24} style={{ color: '#22c55e' }} />
            <span style={{ fontSize: '14px', color: '#666' }}>Paid ({stats.paidCount})</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#33312E' }}>
            {formatCurrency(stats.paidAmount)}
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          borderLeft: '4px solid #ef4444'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <XCircle size={24} style={{ color: '#ef4444' }} />
            <span style={{ fontSize: '14px', color: '#666' }}>Unpaid ({stats.unpaidCount})</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#33312E' }}>
            {formatCurrency(stats.unpaidAmount)}
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
            <Calendar size={24} style={{ color: '#3b82f6' }} />
            <span style={{ fontSize: '14px', color: '#666' }}>Total Entries</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#33312E' }}>
            {stats.totalExpenditures}
          </div>
        </div>
      </div>

      {/* Expenditures List */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #f3f4f6' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#33312E' }}>
            Expenditure Records ({expenditures.length})
          </h3>
        </div>
        
        <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
          {expenditures.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
              No expenditures recorded yet
            </div>
          ) : (
            expenditures.map((expenditure, index) => (
              <div key={expenditure.id} style={{
                padding: '20px 24px',
                borderBottom: index < expenditures.length - 1 ? '1px solid #f3f4f6' : 'none',
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
                      backgroundColor: expenditure.payment_status === 'paid' ? '#22c55e' : '#ff8c42',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {expenditure.category}
                    </div>
                    <span style={{ fontWeight: '600', fontSize: '16px' }}>
                      {expenditure.description}
                    </span>
                    {expenditure.supplier && (
                      <span style={{ 
                        fontSize: '12px', 
                        color: '#666',
                        backgroundColor: '#f3f4f6',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        Supplier: {expenditure.supplier}
                      </span>
                    )}
                  </div>
                  
                  <div style={{ fontSize: '12px', color: '#999', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} />
                    {new Date(expenditure.created_at).toLocaleString()}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#33312E' }}>
                      {formatCurrency(expenditure.amount)}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: expenditure.payment_status === 'paid' ? '#22c55e' : '#ef4444',
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
                        backgroundColor: expenditure.payment_status === 'paid' ? '#22c55e' : '#ef4444',
                        borderRadius: '50%'
                      }}></div>
                      {expenditure.payment_status}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {expenditure.payment_status === 'unpaid' && (
                      <button
                        onClick={() => updatePaymentStatus(expenditure.id, 'paid')}
                        style={{
                          backgroundColor: '#22c55e',
                          color: 'white',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Mark Paid
                      </button>
                    )}
                    
                    <button
                      onClick={() => requestPinForDelete(expenditure.id)}
                      style={{
                        backgroundColor: '#6b7280',
                        color: 'white',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Expenditure Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="modal-title">Add New Expenditure</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Description</label>
                <input
                  type="text"
                  value={newExpenditure.description}
                  onChange={(e) => setNewExpenditure({...newExpenditure, description: e.target.value})}
                  className="form-input"
                  placeholder="e.g., Burger Buns Purchase"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newExpenditure.amount}
                  onChange={(e) => setNewExpenditure({...newExpenditure, amount: e.target.value})}
                  className="form-input"
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  value={newExpenditure.category}
                  onChange={(e) => setNewExpenditure({...newExpenditure, category: e.target.value})}
                  className="form-input"
                  required
                >
                  <option value="">Select category</option>
                  <option value="Ingredients">Ingredients</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Rent">Rent</option>
                  <option value="Staff">Staff</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Supplier (Optional)</label>
                <input
                  type="text"
                  value={newExpenditure.supplier}
                  onChange={(e) => setNewExpenditure({...newExpenditure, supplier: e.target.value})}
                  className="form-input"
                  placeholder="Supplier name"
                />
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  style={{ backgroundColor: '#ff8c42' }}
                >
                  Add Expenditure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PIN Verification Modal */}
      <PinVerification
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        onVerify={handlePinVerification}
        title="Owner PIN Required - DELETE"
      />
    </div>
  );
};

export default Expenditures;