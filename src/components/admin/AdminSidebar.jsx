import React from 'react';
import { 
  LayoutDashboard, Building2, AlertTriangle, Phone, BookOpen, 
  Users, Heart, X, MapPin
} from 'lucide-react';

const AdminSidebar = ({ sidebarOpen, setSidebarOpen, activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { id: 'centers', label: 'Evacuation Centers', icon: Building2, path: '/admin/centers' },
    { id: 'population', label: 'Barangay Population', icon: MapPin, path: '/admin/population' },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle, path: '/admin/alerts' },
    { id: 'contacts', label: 'Emergency Contacts', icon: Phone, path: '/admin/contacts' },
    { id: 'guides', label: 'Preparedness Guides', icon: BookOpen, path: '/admin/guides' },
    { id: 'pwd', label: 'PWD Registry', icon: Heart, path: '/admin/pwd' },
    { id: 'users', label: 'Users', icon: Users, path: '/admin/users' },
  ];

  const handleNavigation = (item) => {
    setActiveTab(item.id);
    // Close sidebar after navigation on all devices
    setSidebarOpen(false);
  };

  return (
    <>
      {/* Overlay - lumalabas kapag open ang sidebar */}
      {sidebarOpen && (
        <div 
          className="admin-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 999,
          }}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className="admin-sidebar"
        style={{
          position: 'fixed',
          top: '64px',
          left: 0,
          bottom: 0,
          width: '260px',
          backgroundColor: '#1e1e2d',
          color: '#9899ac',
          overflowY: 'auto',
          zIndex: 1000,
          transition: 'transform 0.3s ease',
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          boxShadow: '2px 0 10px rgba(0,0,0,0.1)'
        }}
      >
        {/* Close button */}
        <div 
          className="sidebar-close-btn"
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            backgroundColor: '#2a2a3e',
            color: '#9899ac',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f97316';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#2a2a3e';
            e.currentTarget.style.color = '#9899ac';
          }}
        >
          <X size={20} />
        </div>

        <div style={{ padding: '20px 0' }}>
          {/* Sidebar Header */}
          <div style={{ padding: '0 20px 20px 20px', borderBottom: '1px solid #2a2a3e', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#f97316',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '20px' }}>🛡️</span>
              </div>
              <div>
                <div style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>Admin Panel</div>
                <div style={{ fontSize: '11px', color: '#9899ac' }}>Disaster Management</div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <nav>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <div
                  key={item.id}
                  onClick={() => handleNavigation(item)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 20px',
                    margin: '4px 12px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backgroundColor: isActive ? '#2a2a3e' : 'transparent',
                    color: isActive ? '#f97316' : '#9899ac'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = '#2a2a3e';
                      e.currentTarget.style.color = '#f97316';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#9899ac';
                    }
                  }}
                >
                  <Icon size={20} />
                  <span style={{ fontSize: '14px', fontWeight: isActive ? '500' : '400' }}>
                    {item.label}
                  </span>
                </div>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;