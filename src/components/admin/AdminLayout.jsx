import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import AdminSidebar from './AdminSidebar';
import { useAuth } from '../../contexts/AuthContext';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveTabFromPath = () => {
    const path = location.pathname;
    if (path === '/admin') return 'dashboard';
    if (path.includes('/admin/centers')) return 'centers';
    if (path.includes('/admin/alerts')) return 'alerts';
    if (path.includes('/admin/pwd')) return 'pwd';
    if (path.includes('/admin/contacts')) return 'contacts';
    if (path.includes('/admin/guides')) return 'guides';
    if (path.includes('/admin/users')) return 'users';
    return 'dashboard';
  };

  const [activeTab, setActiveTab] = useState(getActiveTabFromPath());

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    switch(tabId) {
      case 'dashboard':
        navigate('/admin');
        break;
      case 'centers':
        navigate('/admin/centers');
        break;
      case 'alerts':
        navigate('/admin/alerts');
        break;
      case 'pwd':
        navigate('/admin/pwd');
        break;
      case 'contacts':
        navigate('/admin/contacts');
        break;
      case 'guides':
        navigate('/admin/guides');
        break;
      case 'users':
        navigate('/admin/users');
        break;
      default:
        navigate('/admin');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="admin-app">
      <AdminNavbar 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onLogout={handleLogout}
      />
      
      <AdminSidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
      />
        
      <div className={`admin-main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="content" style={{ paddingTop: '30px' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;