import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { 
  Users, Home, Edit2, Trash2, Save, X, Plus, 
  MapPin, Phone, UserCheck, Baby, Heart, AlertCircle
} from 'lucide-react';

const BarangayPopulationManager = () => {
  const [barangays, setBarangays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    total_population: '',
    total_households: '',
    pwd_count: '',
    senior_count: '',
    child_count: ''
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBarangay, setNewBarangay] = useState({
    barangay_name: '',
    total_population: '',
    total_households: '',
    pwd_count: '',
    senior_count: '',
    child_count: ''
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchBarangays();
  }, []);

  const fetchBarangays = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('barangay_population')
        .select('*')
        .order('barangay_name');
      
      if (error) throw error;
      setBarangays(data || []);
    } catch (error) {
      console.error('Error fetching barangays:', error);
      setError('Failed to load barangay data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (barangay) => {
    setEditingId(barangay.barangay_id);
    setEditForm({
      total_population: barangay.total_population || '',
      total_households: barangay.total_households || '',
      pwd_count: barangay.pwd_count || '',
      senior_count: barangay.senior_count || '',
      child_count: barangay.child_count || ''
    });
  };

  const handleSave = async (barangayId) => {
    try {
      setError(null);
      const { error } = await supabase
        .from('barangay_population')
        .update({
          total_population: parseInt(editForm.total_population) || 0,
          total_households: parseInt(editForm.total_households) || 0,
          pwd_count: parseInt(editForm.pwd_count) || 0,
          senior_count: parseInt(editForm.senior_count) || 0,
          child_count: parseInt(editForm.child_count) || 0,
          updated_at: new Date()
        })
        .eq('barangay_id', barangayId);
      
      if (error) throw error;
      
      setEditingId(null);
      setSuccess('Barangay data updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
      fetchBarangays();
    } catch (error) {
      console.error('Error updating:', error);
      setError('Error updating population data. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleAddBarangay = async () => {
    if (!newBarangay.barangay_name.trim()) {
      setError('Please enter barangay name');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      setError(null);
      const { error } = await supabase
        .from('barangay_population')
        .insert([{
          barangay_name: newBarangay.barangay_name.trim(),
          total_population: parseInt(newBarangay.total_population) || 0,
          total_households: parseInt(newBarangay.total_households) || 0,
          pwd_count: parseInt(newBarangay.pwd_count) || 0,
          senior_count: parseInt(newBarangay.senior_count) || 0,
          child_count: parseInt(newBarangay.child_count) || 0
        }]);
      
      if (error) throw error;
      
      setShowAddModal(false);
      setNewBarangay({
        barangay_name: '',
        total_population: '',
        total_households: '',
        pwd_count: '',
        senior_count: '',
        child_count: ''
      });
      setSuccess('Barangay added successfully!');
      setTimeout(() => setSuccess(null), 3000);
      fetchBarangays();
    } catch (error) {
      console.error('Error adding:', error);
      setError('Error adding barangay. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDelete = async (barangayId, barangayName) => {
    if (window.confirm(`Are you sure you want to delete ${barangayName}? This action cannot be undone.`)) {
      try {
        setError(null);
        const { error } = await supabase
          .from('barangay_population')
          .delete()
          .eq('barangay_id', barangayId);
        
        if (error) throw error;
        
        setSuccess(`${barangayName} deleted successfully!`);
        setTimeout(() => setSuccess(null), 3000);
        fetchBarangays();
      } catch (error) {
        console.error('Error deleting:', error);
        setError('Error deleting barangay. Please try again.');
        setTimeout(() => setError(null), 3000);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({
      total_population: '',
      total_households: '',
      pwd_count: '',
      senior_count: '',
      child_count: ''
    });
  };

  // Calculate totals
  const totals = barangays.reduce((acc, b) => ({
    total_population: acc.total_population + (b.total_population || 0),
    total_households: acc.total_households + (b.total_households || 0),
    pwd_count: acc.pwd_count + (b.pwd_count || 0),
    senior_count: acc.senior_count + (b.senior_count || 0),
    child_count: acc.child_count + (b.child_count || 0)
  }), { total_population: 0, total_households: 0, pwd_count: 0, senior_count: 0, child_count: 0 });

  if (loading) {
    return (
      <div className="admin-loading" style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <div className="admin-spinner" style={{
          width: '40px',
          height: '40px',
          border: '3px solid #e5e7eb',
          borderTopColor: '#3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading barangay data...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>Barangay Population Baseline</h1>
          <p style={{ color: '#6b7280', marginTop: '8px', marginBottom: 0 }}>
            Manage population data for all barangays. This data serves as baseline for evacuation coverage calculation.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          <Plus size={18} />
          Add Barangay
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div style={{
          backgroundColor: '#d1fae5',
          borderLeft: '4px solid #10b981',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <CheckCircle size={18} color="#10b981" />
          <span style={{ color: '#065f46' }}>{success}</span>
        </div>
      )}

      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          borderLeft: '4px solid #ef4444',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <AlertCircle size={18} color="#ef4444" />
          <span style={{ color: '#991b1b' }}>{error}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', borderRadius: '12px', padding: '20px', color: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '13px', opacity: 0.9 }}>Total Population</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{totals.total_population.toLocaleString()}</div>
              <div style={{ fontSize: '11px', opacity: 0.8 }}>across {barangays.length} barangays</div>
            </div>
            <Users size={32} opacity={0.8} />
          </div>
        </div>
        
        <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: '12px', padding: '20px', color: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '13px', opacity: 0.9 }}>Total Households</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{totals.total_households.toLocaleString()}</div>
            </div>
            <Home size={32} opacity={0.8} />
          </div>
        </div>
        
        <div style={{ background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', borderRadius: '12px', padding: '20px', color: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '13px', opacity: 0.9 }}>PWDs</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{totals.pwd_count.toLocaleString()}</div>
            </div>
            <Heart size={32} opacity={0.8} />
          </div>
        </div>
        
        <div style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', borderRadius: '12px', padding: '20px', color: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '13px', opacity: 0.9 }}>Seniors + Children</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{(totals.senior_count + totals.child_count).toLocaleString()}</div>
              <div style={{ fontSize: '10px', opacity: 0.8 }}>{totals.senior_count.toLocaleString()} seniors, {totals.child_count.toLocaleString()} children</div>
            </div>
            <Baby size={32} opacity={0.8} />
          </div>
        </div>
      </div>

      {/* Barangay Data Table */}
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '12px', 
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <tr>
                <th style={{ padding: '16px', textAlign: 'left' }}>Barangay</th>
                <th style={{ padding: '16px', textAlign: 'right' }}>Population</th>
                <th style={{ padding: '16px', textAlign: 'right' }}>Households</th>
                <th style={{ padding: '16px', textAlign: 'right' }}>PWDs</th>
                <th style={{ padding: '16px', textAlign: 'right' }}>Seniors</th>
                <th style={{ padding: '16px', textAlign: 'right' }}>Children</th>
                <th style={{ padding: '16px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {barangays.map((barangay) => (
                <tr key={barangay.barangay_id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '16px', fontWeight: '500' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={16} color="#6b7280" />
                      {barangay.barangay_name}
                    </div>
                  </td>
                  
                  {editingId === barangay.barangay_id ? (
                    // Edit Mode
                    <>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <input
                          type="number"
                          value={editForm.total_population}
                          onChange={(e) => setEditForm({...editForm, total_population: e.target.value})}
                          style={{ width: '100px', padding: '6px 8px', textAlign: 'right', border: '1px solid #e5e7eb', borderRadius: '6px' }}
                        />
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <input
                          type="number"
                          value={editForm.total_households}
                          onChange={(e) => setEditForm({...editForm, total_households: e.target.value})}
                          style={{ width: '100px', padding: '6px 8px', textAlign: 'right', border: '1px solid #e5e7eb', borderRadius: '6px' }}
                        />
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <input
                          type="number"
                          value={editForm.pwd_count}
                          onChange={(e) => setEditForm({...editForm, pwd_count: e.target.value})}
                          style={{ width: '100px', padding: '6px 8px', textAlign: 'right', border: '1px solid #e5e7eb', borderRadius: '6px' }}
                        />
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <input
                          type="number"
                          value={editForm.senior_count}
                          onChange={(e) => setEditForm({...editForm, senior_count: e.target.value})}
                          style={{ width: '100px', padding: '6px 8px', textAlign: 'right', border: '1px solid #e5e7eb', borderRadius: '6px' }}
                        />
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <input
                          type="number"
                          value={editForm.child_count}
                          onChange={(e) => setEditForm({...editForm, child_count: e.target.value})}
                          style={{ width: '100px', padding: '6px 8px', textAlign: 'right', border: '1px solid #e5e7eb', borderRadius: '6px' }}
                        />
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleSave(barangay.barangay_id)}
                          style={{ background: '#10b981', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', marginRight: '8px', color: 'white' }}
                          title="Save"
                        >
                          <Save size={14} />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          style={{ background: '#6b7280', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', color: 'white' }}
                          title="Cancel"
                        >
                          <X size={14} />
                        </button>
                      </td>
                    </>
                  ) : (
                    // View Mode
                    <>
                      <td style={{ padding: '16px', textAlign: 'right', fontWeight: '500' }}>
                        {barangay.total_population?.toLocaleString()}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        {barangay.total_households?.toLocaleString()}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        {barangay.pwd_count?.toLocaleString()}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        {barangay.senior_count?.toLocaleString()}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        {barangay.child_count?.toLocaleString()}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleEdit(barangay)}
                          style={{ background: '#3b82f6', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', marginRight: '8px', color: 'white' }}
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(barangay.barangay_id, barangay.barangay_name)}
                          style={{ background: '#ef4444', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', color: 'white' }}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
            <tfoot style={{ backgroundColor: '#f9fafb', borderTop: '2px solid #e5e7eb', fontWeight: 'bold' }}>
              <tr>
                <td style={{ padding: '16px' }}>TOTAL</td>
                <td style={{ padding: '16px', textAlign: 'right' }}>{totals.total_population.toLocaleString()}</td>
                <td style={{ padding: '16px', textAlign: 'right' }}>{totals.total_households.toLocaleString()}</td>
                <td style={{ padding: '16px', textAlign: 'right' }}>{totals.pwd_count.toLocaleString()}</td>
                <td style={{ padding: '16px', textAlign: 'right' }}>{totals.senior_count.toLocaleString()}</td>
                <td style={{ padding: '16px', textAlign: 'right' }}>{totals.child_count.toLocaleString()}</td>
                <td style={{ padding: '16px', textAlign: 'center' }}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {barangays.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px',
          background: '#f9fafb',
          borderRadius: '12px',
          marginTop: '24px'
        }}>
          <MapPin size={48} color="#9ca3af" />
          <p style={{ marginTop: '16px', color: '#6b7280' }}>No barangays found. Click "Add Barangay" to create one.</p>
        </div>
      )}

      {/* Add Barangay Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', width: '500px', maxWidth: '90%', maxHeight: '90%', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>Add New Barangay</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
              >
                <X size={24} color="#6b7280" />
              </button>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Barangay Name *</label>
              <input
                type="text"
                value={newBarangay.barangay_name}
                onChange={(e) => setNewBarangay({...newBarangay, barangay_name: e.target.value})}
                placeholder="e.g., Alapan 1-D"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }}
                autoFocus
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Total Population</label>
                <input
                  type="number"
                  value={newBarangay.total_population}
                  onChange={(e) => setNewBarangay({...newBarangay, total_population: e.target.value})}
                  placeholder="0"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Total Households</label>
                <input
                  type="number"
                  value={newBarangay.total_households}
                  onChange={(e) => setNewBarangay({...newBarangay, total_households: e.target.value})}
                  placeholder="0"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>PWD Count</label>
                <input
                  type="number"
                  value={newBarangay.pwd_count}
                  onChange={(e) => setNewBarangay({...newBarangay, pwd_count: e.target.value})}
                  placeholder="0"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Senior Count</label>
                <input
                  type="number"
                  value={newBarangay.senior_count}
                  onChange={(e) => setNewBarangay({...newBarangay, senior_count: e.target.value})}
                  placeholder="0"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Child Count (0-12)</label>
                <input
                  type="number"
                  value={newBarangay.child_count}
                  onChange={(e) => setNewBarangay({...newBarangay, child_count: e.target.value})}
                  placeholder="0"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleAddBarangay}
                style={{ flex: 1, backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}
              >
                Add Barangay
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ flex: 1, backgroundColor: '#e5e7eb', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Note */}
      <div style={{ 
        marginTop: '24px', 
        padding: '16px', 
        backgroundColor: '#f0fdf4', 
        borderRadius: '8px',
        borderLeft: '4px solid #10b981'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={16} color="#10b981" />
          <div style={{ fontSize: '13px', color: '#065f46' }}>
            <strong>Note:</strong> This population data serves as baseline for evacuation coverage calculation in the dashboard. 
            Update these numbers annually based on official barangay census.
          </div>
        </div>
      </div>
    </div>
  );
};

// Import missing CheckCircle component
const CheckCircle = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export default BarangayPopulationManager;