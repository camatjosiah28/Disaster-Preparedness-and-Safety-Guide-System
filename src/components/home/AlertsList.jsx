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

  // Fetch on mount and when refreshTrigger changes
  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts, refreshTrigger]);

  // Optional: Auto-refresh when tab becomes visible again
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

  // Optional: Real-time subscription for automatic updates
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
          fetchAlerts(); // Re-fetch when alerts change
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchAlerts]);

  if (loading) {
    return (
      <div className="loading-alerts">
        <p>Loading alerts...</p>
      </div>
    );
  }

  if (alerts.length === 0) {
    return <p className="no-data">No active alerts at the moment. Stay safe! 👍</p>;
  }

  return (
    <>
      {alerts.map(alert => (
        <div key={alert.alert_id} className="alert-card">
          <span className={`alert-badge ${alert.alert_type.toLowerCase()}`}>
            {alert.alert_type}
          </span>
          <h3>{alert.title}</h3>
          <p>{alert.message}</p>
          <small>🕒 {new Date(alert.created_at).toLocaleString()}</small>
        </div>
      ))}
    </>
  );
};

export default AlertsList;