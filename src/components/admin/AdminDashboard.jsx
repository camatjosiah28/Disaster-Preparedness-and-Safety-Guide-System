import React, { useState, useEffect } from 'react';
import { Users, Building2, Bell, Phone, Activity, TrendingUp, Heart } from 'lucide-react';  // Changed from Wheelchair to Heart
import { supabase } from '../../supabaseClient';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalEvacuees: 0,
    activeCenters: 0,
    availableBeds: 0,
    activeAlerts: 0,
    pwdCount: 0,
    emergencyContacts: 0
  });
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const { data: centers } = await supabase
        .from('evacuation_centers')
        .select('*');
      
      const activeCenters = centers?.filter(c => c.status === 'Open') || [];
      const totalCapacity = activeCenters.reduce((sum, c) => sum + (c.capacity || 0), 0);
      const totalOccupancy = activeCenters.reduce((sum, c) => sum + (c.current_occupancy || 0), 0);
      
      const { data: alerts } = await supabase
        .from('alerts')
        .select('*')
        .eq('status', 'Active')
        .order('created_at', { ascending: false })
        .limit(5);
      
      const { count: pwdCount } = await supabase
        .from('pwd_registry')
        .select('*', { count: 'exact', head: true });
      
      const { count: contactsCount } = await supabase
        .from('emergency_contacts')
        .select('*', { count: 'exact', head: true });
      
      setStats({
        totalEvacuees: totalOccupancy,
        activeCenters: activeCenters.length,
        availableBeds: totalCapacity - totalOccupancy,
        activeAlerts: alerts?.length || 0,
        pwdCount: pwdCount || 0,
        emergencyContacts: contactsCount || 0
      });
      
      setRecentAlerts(alerts || []);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon }) => (
    <div className="admin-stat-card">
      <div className="admin-stat-title">{title}</div>
      <div className="admin-stat-value">{value.toLocaleString()}</div>
    </div>
  );

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <p style={{ color: 'var(--gray-dark)', marginBottom: '30px' }}>
        Welcome back! Here's what's happening today.
      </p>

      <div className="admin-grid">
        <StatCard title="Total Evacuees" value={stats.totalEvacuees} icon={Users} />
        <StatCard title="Active Centers" value={stats.activeCenters} icon={Building2} />
        <StatCard title="Available Beds" value={stats.availableBeds} icon={Activity} />
        <StatCard title="Active Alerts" value={stats.activeAlerts} icon={Bell} />
        <StatCard title="Registered PWDs" value={stats.pwdCount} icon={Heart} />  {/* Changed */}
        <StatCard title="Emergency Contacts" value={stats.emergencyContacts} icon={Phone} />
      </div>

      <div className="card">
        <h3>Recent Alerts</h3>
        {recentAlerts.length > 0 ? (
          recentAlerts.map((alert) => (
            <div key={alert.alert_id} style={{ padding: '10px 0', borderBottom: '1px solid var(--light-gray)' }}>
              <div style={{ fontWeight: 'bold' }}>{alert.title}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--gray-dark)' }}>
                {new Date(alert.created_at).toLocaleDateString()}
              </div>
            </div>
          ))
        ) : (
          <div className="no-data">No active alerts</div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;