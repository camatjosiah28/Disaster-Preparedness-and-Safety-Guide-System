import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../supabaseClient';

const AlertsList = ({ refreshTrigger }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('status', 'Active')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching alerts:', error);
    } else if (data) {
      setAlerts(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts, refreshTrigger]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchAlerts();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchAlerts]);

  useEffect(() => {
    const subscription = supabase
      .channel('alerts_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'alerts',
          filter: 'status=eq.Active'
        }, 
        () => {
          fetchAlerts();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchAlerts]);

  if (loading) {
    return (
      <div className="loading-alerts" style={{ textAlign: 'center', padding: '20px' }}>
        <p>Loading alerts...</p>
      </div>
    );
  }

  if (alerts.length === 0) {
    return <p className="no-data" style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>No active alerts at the moment. Stay safe!</p>;
  }

  return (
    <div className="alerts-list-container">
      {alerts.map(alert => (
        <div key={alert.alert_id} className="alert-card" style={{
          background: '#fff',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderLeft: '4px solid',
          position: 'relative'
        }}>
          <span className={`alert-badge ${alert.alert_type.toLowerCase()}`} style={{
            display: 'inline-block',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            marginBottom: '12px',
            background: alert.alert_type === 'Warning' ? '#fee2e2' : 
                       alert.alert_type === 'Emergency' ? '#ffedd5' : '#e0e7ff',
            color: alert.alert_type === 'Warning' ? '#dc2626' : 
                   alert.alert_type === 'Emergency' ? '#ea580c' : '#2563eb'
          }}>
            {alert.alert_type}
          </span>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '8px',
            color: '#111827'
          }}>{alert.title}</h3>
          <p style={{
            fontSize: '14px',
            color: '#4b5563',
            marginBottom: '12px',
            lineHeight: '1.5'
          }}>{alert.message}</p>
          <small style={{
            fontSize: '12px',
            color: '#9ca3af'
          }}>{new Date(alert.created_at).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
};

export default AlertsList;