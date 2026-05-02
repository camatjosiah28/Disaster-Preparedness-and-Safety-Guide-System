import React, { useState, useEffect } from 'react';
import { Bell, LogOut, User, ChevronDown, Shield, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AdminNavbar = ({ sidebarOpen, setSidebarOpen, activeTab, setActiveTab, onLogout }) => {
  const { userProfile } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  let logoSrc;
  try {
    logoSrc = new URL('../../assets/logo.png', import.meta.url).href;
  } catch (error) {
    logoSrc = null;
  }

  useEffect(() => {
    setNotifications([
      { id: 1, title: 'New PWD Registration', message: 'A new person with disability has registered', time: '5 mins ago', type: 'info' },
      { id: 2, title: 'Center Capacity Alert', message: 'North Evac Center is at 90% capacity', time: '1 hour ago', type: 'warning' },
    ]);
  }, []);

  return (
    <>
      <nav className="admin-navbar">
        <div className="navbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="admin-mobile-toggle"
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '1.2rem'
              }}
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Logo */}
            <div className="nav-logo">
              {logoSrc ? (
                <img src={logoSrc} alt="Logo" style={{ height: '35px', marginRight: '10px' }} />
              ) : (
                <Shield size={28} style={{ marginRight: '10px' }} />
              )}
              Alapan Ready
              <span className="admin-badge">Admin</span>
            </div>
          </div>

          <div className="nav-auth">
            {/* Notification Bell */}
            <div className="notification-bell" onClick={() => setShowNotifications(!showNotifications)}>
              <Bell size={20} />
              {notifications.length > 0 && (
                <span className="notification-badge">{notifications.length}</span>
              )}
            </div>

            {/* User Menu */}
            <div className="admin-user-menu">
              <button className="admin-user-btn" onClick={() => setShowUserMenu(!showUserMenu)}>
                <div className="admin-avatar">
                  {userProfile?.full_name?.[0]?.toUpperCase() || 'A'}
                </div>
                <div className="admin-user-info">
                  <div className="admin-user-name">{userProfile?.full_name || 'Admin User'}</div>
                  <div className="admin-user-role">Administrator</div>
                </div>
                <ChevronDown size={16} />
              </button>

              {showUserMenu && (
                <div className="admin-dropdown" style={{ right: 0 }}>
                  <div className="dropdown-item user-dropdown-item" onClick={onLogout}>
                    <LogOut size={18} />
                    <span>Logout</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="admin-dropdown notifications-dropdown" style={{ top: '70px', right: '20px' }}>
          <div className="dropdown-header">Notifications</div>
          {notifications.map((notif) => (
            <div key={notif.id} className="dropdown-item">
              <div className="notification-item">
                <div className={`notification-icon ${notif.type}`}>
                  {notif.type === 'warning' ? '⚠️' : 'ℹ️'}
                </div>
                <div className="notification-content">
                  <div className="notification-title">{notif.title}</div>
                  <div className="notification-message">{notif.message}</div>
                  <div className="notification-time">{notif.time}</div>
                </div>
              </div>
            </div>
          ))}
          <div className="dropdown-footer">
            <button>View all notifications</button>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      <div className={`admin-mobile-menu ${sidebarOpen ? 'active' : ''}`}>
        {/* Mobile menu items will be handled by sidebar */}
        <p style={{ color: 'white', padding: '10px', textAlign: 'center', opacity: 0.7 }}>
          Use the sidebar menu
        </p>
      </div>
    </>
  );
};

export default AdminNavbar;