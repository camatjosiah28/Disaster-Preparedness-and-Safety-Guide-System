import React from 'react';
import { 
  LayoutDashboard, Building2, AlertTriangle, Heart, 
  Phone, BookOpen, Users, MapPin
} from 'lucide-react';

const AdminSidebar = ({ sidebarOpen, setSidebarOpen, activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'centers', name: 'Evacuation Centers', icon: Building2 },
    { id: 'population', name: 'Barangay Population', icon: MapPin },  // ✅ MERON NA
    { id: 'alerts', name: 'Alerts', icon: AlertTriangle },
    { id: 'pwd', name: 'PWD Registry', icon: Heart },
    { id: 'contacts', name: 'Emergency Contacts', icon: Phone },
    { id: 'guides', name: 'Preparedness Guides', icon: BookOpen },
    { id: 'users', name: 'Users Management', icon: Users },
  ];

  return (
    <>
      {sidebarOpen && (
        <div 
          className="admin-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 999,
            display: 'none'
          }}
        />
      )}

      <div className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-content">
          {menuItems.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
              className={`admin-sidebar-item ${activeTab === item.id ? 'active' : ''}`}
            >
              <item.icon className="admin-sidebar-icon" />
              <span>{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;