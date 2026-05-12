import React, { useState } from 'react';
import { LogOut, ChevronDown, Shield, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AdminNavbar = ({ sidebarOpen, setSidebarOpen, activeTab, setActiveTab, onLogout }) => {
  const { userProfile } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  let logoSrc;
  try {
    logoSrc = new URL('../../assets/logo.png', import.meta.url).href;
  } catch (error) {
    logoSrc = null;
  }

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

            {/* Logo Only - No Text */}
            <div className="nav-logo">
              {logoSrc ? (
                <img src={logoSrc} alt="Logo" style={{ height: '40px' }} />
              ) : (
                <Shield size={32} />
              )}
            </div>
          </div>

          <div className="nav-auth">
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
                <div className="admin-dropdown-user" style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  background: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  minWidth: '180px',
                  zIndex: 1000,
                  overflow: 'hidden'
                }}>
                  <div 
                    className="dropdown-item" 
                    onClick={onLogout}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      cursor: 'pointer',
                      color: '#dc3545',
                      transition: 'background 0.2s',
                      borderBottom: 'none'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                  >
                    <LogOut size={18} />
                    <span style={{ fontWeight: 500 }}>Logout</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default AdminNavbar;