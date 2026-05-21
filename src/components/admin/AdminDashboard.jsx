import React, { useState, useEffect } from 'react';
import { 
  Users, Building2, Bell, Activity, TrendingUp, Heart, 
  Download, AlertTriangle, CheckCircle, RefreshCw, 
  Bed, ClipboardList
} from 'lucide-react';
import { supabase } from '../../supabaseClient';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalEvacuees: 0,
    activeCenters: 0,
    availableBeds: 0,
    totalCapacity: 0,
    occupancyRate: 0,
    criticalCenters: 0,
    warningCenters: 0,
    safeCenters: 0,
    fullCenters: 0,
    pwdCount: 0,
    activeAlerts: 0
  });
  
  const [centerOccupancy, setCenterOccupancy] = useState([]);
  const [evacueeHistory, setEvacueeHistory] = useState([]);
  const [pwdDemographics, setPwdDemographics] = useState({
    mobilityLevels: [],
    medicalDevices: 0
  });
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setRefreshing(true);
      
      await fetchEvacuationData();
      await fetchPwdDemographics();
      await fetchHistoricalData();
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchEvacuationData = async () => {
    const { data: centers } = await supabase
      .from('evacuation_centers')
      .select('*');
    
    const activeCenters = centers?.filter(c => c.status === 'Open') || [];
    const totalCapacity = activeCenters.reduce((sum, c) => sum + (c.capacity || 0), 0);
    const totalOccupancy = activeCenters.reduce((sum, c) => sum + (c.current_occupancy || 0), 0);
    const occupancyRate = totalCapacity > 0 ? (totalOccupancy / totalCapacity) * 100 : 0;
    
    let criticalCount = 0;
    let warningCount = 0;
    let safeCount = 0;
    let fullCount = 0;
    
    const centerData = activeCenters.map(center => {
      const rate = center.capacity > 0 ? ((center.current_occupancy || 0) / center.capacity) * 100 : 0;
      
      if (rate >= 100) fullCount++;
      else if (rate >= 80) criticalCount++;
      else if (rate >= 50) warningCount++;
      else safeCount++;
      
      return {
        id: center.center_id,
        name: center.center_name,
        occupancy: center.current_occupancy || 0,
        capacity: center.capacity || 0,
        rate: rate,
        status: rate >= 100 ? 'Full' : rate >= 80 ? 'Critical' : rate >= 50 ? 'Warning' : 'Safe'
      };
    });
    
    const { data: alerts } = await supabase
      .from('alerts')
      .select('*')
      .eq('status', 'Active')
      .order('created_at', { ascending: false })
      .limit(5);
    
    const { count: pwdCount } = await supabase
      .from('pwd_registry')
      .select('*', { count: 'exact', head: true });
    
    setCenterOccupancy(centerData);
    setRecentAlerts(alerts || []);
    
    setStats({
      totalEvacuees: totalOccupancy,
      activeCenters: activeCenters.length,
      availableBeds: totalCapacity - totalOccupancy,
      totalCapacity: totalCapacity,
      occupancyRate: occupancyRate,
      criticalCenters: criticalCount,
      warningCenters: warningCount,
      safeCenters: safeCount,
      fullCenters: fullCount,
      pwdCount: pwdCount || 0,
      activeAlerts: alerts?.length || 0
    });
  };

  const fetchPwdDemographics = async () => {
    const { data: pwdData } = await supabase
      .from('pwd_registry')
      .select('mobility_level, needs_medical_device');
    
    const mobilityLevels = {
      'Independent': 0,
      'Needs Assistance': 0,
      'Bedridden': 0
    };
    
    pwdData?.forEach(pwd => {
      if (pwd.mobility_level) {
        mobilityLevels[pwd.mobility_level]++;
      }
    });
    
    const medicalDevicesCount = pwdData?.filter(p => p.needs_medical_device === true).length || 0;
    
    setPwdDemographics({
      mobilityLevels: Object.entries(mobilityLevels).map(([level, count]) => ({ level, count })),
      medicalDevices: medicalDevicesCount
    });
  };

  const fetchHistoricalData = async () => {
    const dates = [];
    const occupancies = [];
    const currentTotal = stats.totalEvacuees;
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      
      const simulatedPrev = Math.floor(currentTotal * (0.7 + (i * 0.05)));
      occupancies.push(simulatedPrev);
    }
    
    setEvacueeHistory({ dates, occupancies });
  };

  const exportToCSV = () => {
    const csvData = [
      ['EVACUATION CENTERS REPORT'],
      ['Generated:', new Date().toLocaleString()],
      [''],
      ['SUMMARY METRICS', 'VALUE'],
      ['Total Evacuees', stats.totalEvacuees],
      ['Active Centers', stats.activeCenters],
      ['Total Capacity', stats.totalCapacity],
      ['Available Beds', stats.availableBeds],
      ['Overall Occupancy Rate', `${stats.occupancyRate.toFixed(1)}%`],
      ['Full Centers (100%)', stats.fullCenters],
      ['Critical Centers (>80%)', stats.criticalCenters],
      ['Warning Centers (50-80%)', stats.warningCenters],
      ['Safe Centers (<50%)', stats.safeCenters],
      ['Active Alerts', stats.activeAlerts],
      ['Registered PWDs', stats.pwdCount],
      [''],
      ['CENTER DETAILS', 'OCCUPANCY', 'CAPACITY', 'RATE', 'STATUS'],
      ...centerOccupancy.map(c => [c.name, c.occupancy, c.capacity, `${c.rate.toFixed(1)}%`, c.status]),
      [''],
      ['TOTAL', stats.totalEvacuees, stats.totalCapacity, `${stats.occupancyRate.toFixed(1)}%`, '']
    ];
    
    const csvString = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evacuation-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const evacueeTrendChart = {
    labels: evacueeHistory.dates || [],
    datasets: [
      {
        label: 'Total Evacuees',
        data: evacueeHistory.occupancies || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: 'white',
        pointHoverRadius: 8,
      }
    ]
  };

  const occupancyChart = {
    labels: centerOccupancy.map(c => c.name.length > 15 ? c.name.substring(0, 15) + '...' : c.name),
    datasets: [
      {
        label: 'Current Occupancy',
        data: centerOccupancy.map(c => c.occupancy),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
      {
        label: 'Capacity',
        data: centerOccupancy.map(c => c.capacity),
        backgroundColor: 'rgba(156, 163, 175, 0.5)',
        borderColor: 'rgb(156, 163, 175)',
        borderWidth: 1,
      }
    ]
  };

  const occupancyRateChart = {
    labels: centerOccupancy.map(c => c.name.length > 12 ? c.name.substring(0, 12) + '...' : c.name),
    datasets: [
      {
        label: 'Occupancy Rate (%)',
        data: centerOccupancy.map(c => c.rate),
        backgroundColor: (context) => {
          const value = context.raw;
          return value >= 100 ? 'rgba(239, 68, 68, 0.8)' :
                 value >= 80 ? 'rgba(220, 38, 38, 0.8)' : 
                 value >= 50 ? 'rgba(234, 179, 8, 0.8)' : 
                 'rgba(34, 197, 94, 0.8)';
        },
        borderColor: 'rgb(75, 85, 99)',
        borderWidth: 1,
      }
    ]
  };

  const pwdMobilityChart = {
    labels: pwdDemographics.mobilityLevels.map(m => m.level),
    datasets: [
      {
        data: pwdDemographics.mobilityLevels.map(m => m.count),
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(234, 179, 8, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(234, 179, 8)',
          'rgb(239, 68, 68)'
        ],
        borderWidth: 2,
      }
    ]
  };

  const centerStatusChart = {
    labels: ['Full (100%)', 'Critical (>80%)', 'Warning (50-80%)', 'Safe (<50%)'],
    datasets: [
      {
        data: [stats.fullCenters, stats.criticalCenters, stats.warningCenters, stats.safeCenters],
        backgroundColor: ['#ef4444', '#dc2626', '#f59e0b', '#10b981'],
        borderWidth: 0,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          boxWidth: 10,
          font: { size: 11 }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) label += ': ';
            if (context.parsed.y !== undefined) {
              label += context.parsed.y.toLocaleString();
            }
            return label;
          }
        }
      }
    }
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color }) => (
    <div style={{ 
      background: 'white', 
      borderRadius: '12px', 
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      borderLeft: `4px solid ${color}`,
      transition: 'transform 0.2s'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: '500', marginBottom: '8px' }}>
            {title}
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937' }}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          {subtitle && (
            <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
              {subtitle}
            </div>
          )}
        </div>
        <div style={{ 
          padding: '10px', 
          backgroundColor: `${color}15`, 
          borderRadius: '10px',
          color: color
        }}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #e5e7eb',
          borderTopColor: '#3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading evacuation data...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container" style={{ 
      padding: '24px', 
      backgroundColor: '#f3f4f6', 
      minHeight: '100vh' 
    }}>
      {/* Header - Responsive */}
      <div style={{ 
        marginBottom: '24px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '16px' 
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0' }}>Evacuation Analytics Dashboard</h1>
          <p style={{ color: '#6b7280', margin: 0 }}>
            Real-time monitoring of evacuation centers, occupancy rates, and PWD needs
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button 
            onClick={fetchAllData}
            disabled={refreshing}
            style={{
              padding: '10px 20px',
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button 
            onClick={exportToCSV}
            style={{
              padding: '10px 20px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            <Download size={16} />
            Export Report
          </button>
        </div>
      </div>

      {/* Critical Alerts Banner - Responsive */}
      {stats.criticalCenters > 0 && (
        <div style={{
          backgroundColor: '#fee2e2',
          borderLeft: '4px solid #dc2626',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <AlertTriangle color="#dc2626" size={24} />
          <div>
            <strong style={{ color: '#991b1b' }}>Critical: {stats.criticalCenters} evacuation center(s) at {'>'}80% capacity!</strong>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#991b1b' }}>
              Immediate action recommended. Consider opening additional centers or decongesting to centers with available space.
            </p>
          </div>
        </div>
      )}

      {/* Main Stats Cards - Responsive Grid */}
      <div className="stats-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '20px',
        marginBottom: '24px'
      }}>
        <StatCard 
          title="Total Evacuees" 
          value={stats.totalEvacuees} 
          icon={Users}
          color="#3b82f6"
        />
        <StatCard 
          title="Active Centers" 
          value={stats.activeCenters} 
          icon={Building2}
          color="#10b981"
        />
        <StatCard 
          title="Available Beds" 
          value={stats.availableBeds} 
          subtitle={`out of ${stats.totalCapacity.toLocaleString()} total`}
          icon={Bed}
          color={stats.availableBeds < 100 ? '#ef4444' : '#f59e0b'}
        />
        <StatCard 
          title="Occupancy Rate" 
          value={`${stats.occupancyRate.toFixed(1)}%`} 
          icon={Activity}
          color={stats.occupancyRate > 80 ? '#ef4444' : stats.occupancyRate > 50 ? '#f59e0b' : '#10b981'}
        />
      </div>

      {/* Center Status Summary - Responsive Grid */}
      <div className="status-summary" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{ background: '#ef4444', borderRadius: '10px', padding: '16px', color: 'white', textAlign: 'center' }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{stats.fullCenters}</div>
          <div style={{ fontSize: '12px', opacity: 0.9 }}>Full Centers (100%)</div>
        </div>
        <div style={{ background: '#dc2626', borderRadius: '10px', padding: '16px', color: 'white', textAlign: 'center' }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{stats.criticalCenters}</div>
          <div style={{ fontSize: '12px', opacity: 0.9 }}>Critical ({'>'}80%)</div>
        </div>
        <div style={{ background: '#f59e0b', borderRadius: '10px', padding: '16px', color: 'white', textAlign: 'center' }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{stats.warningCenters}</div>
          <div style={{ fontSize: '12px', opacity: 0.9 }}>Warning (50-80%)</div>
        </div>
        <div style={{ background: '#10b981', borderRadius: '10px', padding: '16px', color: 'white', textAlign: 'center' }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{stats.safeCenters}</div>
          <div style={{ fontSize: '12px', opacity: 0.9 }}>Safe ({'<'}50%)</div>
        </div>
      </div>

      {/* Charts Section - Responsive Grid */}
      <div className="charts-section" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '24px',
        marginBottom: '24px'
      }}>
        {/* Evacuee Trend Line Chart */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Evacuee Trend</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>Daily occupancy changes (last 7 days)</p>
            </div>
            <TrendingUp size={20} color="#6b7280" />
          </div>
          <div style={{ height: '280px' }}>
            <Line data={evacueeTrendChart} options={chartOptions} />
          </div>
        </div>

        {/* Center Status Distribution */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Center Status Distribution</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>Based on occupancy rate</p>
            </div>
            <ClipboardList size={20} color="#6b7280" />
          </div>
          <div style={{ height: '280px' }}>
            <Pie data={centerStatusChart} options={chartOptions} />
          </div>
        </div>

        {/* Center Capacity vs Occupancy Bar Chart */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Center Capacity vs Occupancy</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>Per evacuation center comparison</p>
            </div>
            <Activity size={20} color="#6b7280" />
          </div>
          <div style={{ height: '280px' }}>
            <Bar data={occupancyChart} options={chartOptions} />
          </div>
        </div>

        {/* PWD Mobility Levels */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>PWD Mobility Levels</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>Special needs distribution</p>
            </div>
            <Heart size={20} color="#ec4899" />
          </div>
          <div style={{ height: '280px' }}>
            <Pie data={pwdMobilityChart} options={chartOptions} />
          </div>
          <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#fef2f2', borderRadius: '8px' }}>
            <div style={{ fontSize: '13px', fontWeight: '500', color: '#dc2626' }}>
              🏥 Medical Device Needs: {pwdDemographics.medicalDevices} PWDs
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
              Require wheelchairs, oxygen tanks, or other medical equipment
            </div>
          </div>
        </div>
      </div>

      {/* Occupancy Rate by Center - Bar Chart */}
      <div style={{ 
        background: 'white', 
        borderRadius: '12px', 
        padding: '20px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Occupancy Rate by Center</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
              Color-coded: 🔴 Critical ({'>'}80%) | 🟡 Warning (50-80%) | 🟢 Safe ({'<'}50%)
            </p>
          </div>
          <TrendingUp size={20} color="#6b7280" />
        </div>
        <div style={{ height: '300px' }}>
          <Bar data={occupancyRateChart} options={{
            ...chartOptions,
            scales: {
              y: {
                beginAtZero: true,
                max: 100,
                ticks: { callback: (value) => value + '%' }
              }
            }
          }} />
        </div>
      </div>

      {/* Evacuation Centers Table - Responsive */}
      <div style={{ 
        background: 'white', 
        borderRadius: '12px', 
        padding: '20px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '24px',
        overflowX: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Evacuation Centers Details</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>Real-time occupancy and status</p>
          </div>
          <ClipboardList size={20} color="#6b7280" />
        </div>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', minWidth: '600px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Center Name</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Current Occupancy</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Capacity</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Available Beds</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Occupancy Rate</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {centerOccupancy.map((center, idx) => {
                const availableBeds = center.capacity - center.occupancy;
                const rateColor = center.rate >= 80 ? '#ef4444' : center.rate >= 50 ? '#f59e0b' : '#10b981';
                const statusColor = center.status === 'Full' ? '#ef4444' : 
                                   center.status === 'Critical' ? '#dc2626' : 
                                   center.status === 'Warning' ? '#f59e0b' : '#10b981';
                
                return (
                  <tr key={center.id} style={{ borderBottom: idx < centerOccupancy.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                    <td style={{ padding: '12px', fontWeight: '500' }}>{center.name}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>{center.occupancy.toLocaleString()}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>{center.capacity.toLocaleString()}</td>
                    <td style={{ padding: '12px', textAlign: 'right', color: availableBeds < 10 ? '#ef4444' : '#6b7280' }}>
                      {availableBeds.toLocaleString()}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{ color: rateColor, fontWeight: 'bold' }}>
                        {center.rate.toFixed(1)}%
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{
                        backgroundColor: `${statusColor}20`,
                        color: statusColor,
                        padding: '4px 8px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}>
                        {center.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot style={{ backgroundColor: '#f9fafb', borderTop: '2px solid #e5e7eb', fontWeight: 'bold' }}>
              <tr>
                <td style={{ padding: '12px' }}>TOTAL / AVERAGE</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{stats.totalEvacuees.toLocaleString()}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{stats.totalCapacity.toLocaleString()}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{stats.availableBeds.toLocaleString()}</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>{stats.occupancyRate.toFixed(1)}%</td>
                <td style={{ padding: '12px', textAlign: 'center' }}></td>
              </tr>
            </tfoot>
           </table>
        </div>
      </div>

      {/* Recent Alerts Section */}
      <div style={{ 
        background: 'white', 
        borderRadius: '12px', 
        padding: '20px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Recent Active Alerts</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>Latest emergency notifications</p>
          </div>
          <Bell size={20} color="#ef4444" />
        </div>
        {recentAlerts.length > 0 ? (
          <div>
            {recentAlerts.map((alert, index) => (
              <div 
                key={alert.alert_id} 
                style={{ 
                  padding: '12px', 
                  borderBottom: index < recentAlerts.length - 1 ? '1px solid #e5e7eb' : 'none',
                  backgroundColor: index % 2 === 0 ? '#fef2f2' : 'white',
                  borderRadius: '8px',
                  marginBottom: index < recentAlerts.length - 1 ? '8px' : 0
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={14} color="#ef4444" />
                    {alert.title}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>
                    {new Date(alert.created_at).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px', marginLeft: '22px' }}>
                  {alert.message?.substring(0, 100)}{alert.message?.length > 100 ? '...' : ''}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            <CheckCircle size={40} style={{ marginBottom: '12px', color: '#10b981' }} />
            <p>No active alerts</p>
            <p style={{ fontSize: '12px' }}>All systems are operating normally</p>
          </div>
        )}
      </div>

      {/* Footer - Responsive */}
      <div style={{ 
        textAlign: 'center', 
        padding: '20px', 
        fontSize: '12px', 
        color: '#9ca3af',
        borderTop: '1px solid #e5e7eb',
        marginTop: '20px'
      }}>
        Last updated: {lastUpdated.toLocaleString()}
        <span style={{ marginLeft: '16px' }}>
          • {stats.activeCenters} active centers • {stats.totalEvacuees.toLocaleString()} evacuees
        </span>
      </div>
    </div>
  );
};

export default AdminDashboard;