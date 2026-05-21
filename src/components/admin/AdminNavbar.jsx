import React from 'react';
import { Menu, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AdminNavbar = ({ sidebarOpen, setSidebarOpen, activeTab, setActiveTab, onLogout }) => {
  const { userProfile } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 1001,
      background: '#1e1e2d',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      {/* Left side - Menu button (laging visible) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            borderRadius: '8px',
            color: '#a0a0b0',
            minWidth: '44px',
            minHeight: '44px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a2a3e'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <Menu size={24} />
        </button>
        <div>
          <span style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>Admin Dashboard</span>
        </div>
      </div>

      {/* Right side - User profile */}
      <div style={{ position: 'relative' }} ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '6px 12px',
            borderRadius: '40px',
            background: '#2a2a3e',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#3a3a4e'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#2a2a3e'}
        >
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: '#f97316',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}>
            <User size={18} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '13px', fontWeight: '500', color: '#e0e0e0' }}>
              {userProfile?.full_name?.split(' ')[0] || 'Admin'}
            </div>
            <div style={{ fontSize: '10px', color: '#f97316' }}>
              Administrator
            </div>
          </div>
          <ChevronDown size={14} style={{ color: '#6b7280' }} />
        </button>

        {isDropdownOpen && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '220px',
            background: '#1a1a2e',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            border: '1px solid #2a2a3e',
            overflow: 'hidden',
            zIndex: 1002
          }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #2a2a3e' }}>
              <div style={{ fontWeight: '600', color: 'white' }}>{userProfile?.full_name || 'Admin User'}</div>
              <div style={{ fontSize: '11px', color: '#8b8b9b', marginTop: '2px' }}>{userProfile?.email}</div>
            </div>
            <div
              onClick={onLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 16px',
                cursor: 'pointer',
                transition: 'background 0.2s ease',
                fontSize: '13px',
                color: '#f97316'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#2a2a3e'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <LogOut size={16} />
              Logout
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default AdminNavbar;