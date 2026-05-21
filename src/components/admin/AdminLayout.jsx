import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import AdminSidebar from './AdminSidebar';
import { useAuth } from '../../contexts/AuthContext';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Start closed on all devices
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveTabFromPath = () => {
    const path = location.pathname;
    
    if (path === '/admin') return 'dashboard';
    if (path.includes('/admin/centers')) return 'centers';
    if (path.includes('/admin/population')) return 'population';
    if (path.includes('/admin/alerts')) return 'alerts';
    if (path.includes('/admin/pwd')) return 'pwd';
    if (path.includes('/admin/contacts')) return 'contacts';
    if (path.includes('/admin/guides')) return 'guides';
    if (path.includes('/admin/users')) return 'users';
    return 'dashboard';
  };

  const [activeTab, setActiveTab] = useState(getActiveTabFromPath());

  useEffect(() => {
    const newActiveTab = getActiveTabFromPath();
    setActiveTab(newActiveTab);
  }, [location.pathname]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    switch(tabId) {
      case 'dashboard':
        navigate('/admin');
        break;
      case 'centers':
        navigate('/admin/centers');
        break;
      case 'population':
        navigate('/admin/population');
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

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen]);

  return (
    <div className="admin-app" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      backgroundColor: '#f3f4f6'
    }}>
      <AdminNavbar 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onLogout={handleLogout}
      />
      
      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        <AdminSidebar 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen}
          activeTab={activeTab}
          setActiveTab={handleTabChange}
        />
        
        {/* Main Content */}
        <main 
          className="admin-main-content"
          style={{
            flex: 1,
            width: '100%',
            overflowX: 'auto'
          }}
        >
          <div className="content" style={{ 
            padding: '20px',
            maxWidth: '1400px',
            margin: '0 auto'
          }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;