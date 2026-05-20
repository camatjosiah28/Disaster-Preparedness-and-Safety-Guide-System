import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, LogOut, Shield, ChevronDown, Home, Map, Book, Phone, UserCircle } from 'lucide-react';

const Navbar = ({ activeTab, setActiveTab, setView }) => {
  const { user, userProfile, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    console.log('🟢 Logout button clicked');
    setIsDropdownOpen(false);
    await logout();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get user display name with fallback
  const getDisplayName = () => {
    if (userProfile?.full_name) {
      const firstName = userProfile.full_name.split(' ')[0];
      return firstName;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  // Get user role badge
  const getUserRoleBadge = () => {
    if (userProfile?.role === 'admin') {
      return { text: 'Admin', color: '#f97316', icon: Shield };
    }
    return { text: 'Resident', color: '#4ade80', icon: User };
  };

  const roleBadge = getUserRoleBadge();
  const RoleIcon = roleBadge.icon;

  let logoSrc;
  try {
    logoSrc = new URL('../../assets/logo.png', import.meta.url).href;
  } catch (error) {
    logoSrc = null;
  }

  // Navigation items
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'maps', label: 'Evacuation Maps', icon: Map },
    { id: 'guides', label: 'Preparedness Guides', icon: Book },
    { id: 'contacts', label: 'Emergency Contacts', icon: Phone },
  ];

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      background: '#1a1a2e',
      padding: '0 24px',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
    }}>
      {/* Logo */}
      <div onClick={() => setView('guest')} style={{
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        fontSize: '1.25rem',
        fontWeight: 'bold'
      }}>
        {logoSrc ? (
          <img 
            src={logoSrc}
            alt="Alapan Ready Logo" 
            style={{ 
              height: '40px', 
              width: 'auto',
              marginRight: '12px'
            }} 
          />
        ) : (
          <span style={{ marginRight: '10px', fontSize: '24px' }}>🏠</span>
        )}
        <span style={{ color: 'white' }}>Alapan</span>
        <span style={{ color: '#ff6b35' }}>Ready</span>
      </div>

      {/* Navigation Links */}
      <ul style={{
        display: 'flex',
        gap: '8px',
        listStyle: 'none',
        margin: 0,
        padding: 0
      }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <li 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: isActive ? '#ff6b35' : 'transparent',
                color: isActive ? 'white' : '#e0e0e0',
                fontWeight: isActive ? '600' : '400',
                fontSize: '0.9rem'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = '#2a2a4a';
                  e.currentTarget.style.color = '#ff6b35';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#e0e0e0';
                }
              }}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </li>
          );
        })}
      </ul>

      {/* Auth Section */}
      <div>
        {user ? (
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '4px 12px 4px 6px',
                borderRadius: '40px',
                border: '1px solid #2a2a4a',
                background: '#2a2a4a',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#ff6b35';
                e.currentTarget.style.background = '#2a2a4a';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#2a2a4a';
                e.currentTarget.style.background = '#2a2a4a';
              }}
            >
              {/* Avatar */}
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#ff6b35',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
                  {getDisplayName().charAt(0).toUpperCase()}
                </span>
              </div>
              
              {/* User info */}
              <div style={{ textAlign: 'left' }}>
                <div style={{ 
                  fontSize: '13px', 
                  fontWeight: '500', 
                  color: 'white',
                  lineHeight: '1.2'
                }}>
                  Hi, {getDisplayName()}!
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  fontSize: '10px',
                  color: roleBadge.color
                }}>
                  <RoleIcon size={10} />
                  <span>{roleBadge.text}</span>
                </div>
              </div>
              
              <ChevronDown 
                size={14} 
                style={{ 
                  color: '#9ca3af',
                  transform: isDropdownOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s ease'
                }} 
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '220px',
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.02)',
                border: '1px solid #e5e7eb',
                overflow: 'hidden',
                zIndex: 1001
              }}>
                {/* User info header */}
                <div style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #f1f5f9',
                  background: '#fafbfc'
                }}>
                  <div style={{ fontWeight: '600', color: '#1f2937' }}>
                    {userProfile?.full_name || user?.email}
                  </div>
                  <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                    {user?.email}
                  </div>
                </div>

                {/* Profile link */}
                <div
                  onClick={() => {
                    setActiveTab('profile');
                    setIsDropdownOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 16px',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease',
                    fontSize: '13px',
                    color: '#4b5563'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                >
                  <UserCircle size={16} color="#6b7280" />
                  My Profile
                </div>

                {/* Logout button */}
                <div
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 16px',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease',
                    fontSize: '13px',
                    color: '#dc2626',
                    borderTop: '1px solid #f1f5f9'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                >
                  <LogOut size={16} />
                  Logout
                </div>
              </div>
            )}
          </div>
        ) : (
          <button 
            onClick={() => setView('login')}
            style={{
              background: '#ff6b35',
              color: 'white',
              border: 'none',
              padding: '8px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#e55a2b'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#ff6b35'}
          >
            Login / Register
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;