import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, LogOut, Shield, ChevronDown, Home, Map, Book, Phone, UserCircle, Menu, X } from 'lucide-react';

const Navbar = ({ activeTab, setActiveTab, setView }) => {
  const { user, userProfile, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const handleLogout = async () => {
    console.log('🟢 Logout button clicked');
    setIsDropdownOpen(false);
    await logout();
  };

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('menu-open');
    } else {
      document.body.style.overflow = 'unset';
      document.body.classList.remove('menu-open');
    }
    
    return () => {
      document.body.style.overflow = 'unset';
      document.body.classList.remove('menu-open');
    };
  }, [isMobileMenuOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && !event.target.closest('.mobile-menu-btn')) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'maps', label: 'Evacuation Maps', icon: Map },
    { id: 'guides', label: 'Preparedness Guides', icon: Book },
    { id: 'contacts', label: 'Emergency Contacts', icon: Phone },
  ];

  return (
    <>
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        background: '#0f0f1a',
        padding: '0 24px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
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
          <span style={{ color: '#f97316' }}>Ready</span>
        </div>

        {/* Desktop Navigation Links - Hidden on mobile */}
        <ul style={{
          display: 'flex',
          gap: '8px',
          listStyle: 'none',
          margin: 0,
          padding: 0
        }}
        className="desktop-nav">
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
                  background: isActive ? '#2a2a3e' : 'transparent',
                  color: isActive ? '#f97316' : '#a0a0b0',
                  fontWeight: isActive ? '500' : '400',
                  fontSize: '0.9rem'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = '#1a1a2e';
                    e.currentTarget.style.color = '#f97316';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#a0a0b0';
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                  border: '1px solid #2a2a3e',
                  background: '#1a1a2e',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#f97316';
                  e.currentTarget.style.background = '#222236';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#2a2a3e';
                  e.currentTarget.style.background = '#1a1a2e';
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#f97316',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}>
                  <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
                    {getDisplayName().charAt(0).toUpperCase()}
                  </span>
                </div>
                
                {/* User info - hide on small screens */}
                <div style={{ textAlign: 'left' }} className="user-info-text">
                  <div style={{ 
                    fontSize: '13px', 
                    fontWeight: '500', 
                    color: '#e0e0e0',
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
                    color: '#6b7280',
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
                  background: '#1a1a2e',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3), 0 8px 10px -6px rgba(0,0,0,0.1)',
                  border: '1px solid #2a2a3e',
                  overflow: 'hidden',
                  zIndex: 1001
                }}>
                  <div style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #2a2a3e',
                    background: '#0f0f1a'
                  }}>
                    <div style={{ fontWeight: '600', color: 'white' }}>
                      {userProfile?.full_name || user?.email}
                    </div>
                    <div style={{ fontSize: '11px', color: '#8b8b9b', marginTop: '2px' }}>
                      {user?.email}
                    </div>
                  </div>

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
                      color: '#d0d0e0'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#2a2a3e'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <UserCircle size={16} color="#8b8b9b" />
                    My Profile
                  </div>

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
                      color: '#f97316',
                      borderTop: '1px solid #2a2a3e'
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
          ) : (
            <button 
              onClick={() => setView('login')}
              className="login-btn-nav"
              style={{
                background: '#2a2a3e',
                color: '#f97316',
                border: '1px solid #3a3a4e',
                padding: '8px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '14px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#3a3a4e';
                e.currentTarget.style.color = '#ff8c42';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#2a2a3e';
                e.currentTarget.style.color = '#f97316';
              }}
            >
              Login / Register
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="mobile-menu-btn"
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              color: 'white',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#2a2a3e'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown - HIGH Z-INDEX para nasa ibabaw ng lahat */}
      <div
        ref={mobileMenuRef}
        className="mobile-menu-dropdown"
        style={{
          position: 'fixed',
          top: '64px',
          left: 0,
          right: 0,
          bottom: 0,
          background: '#0f0f1a',
          borderTop: '1px solid #2a2a3e',
          transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease',
          zIndex: 9999,
          overflowY: 'auto',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}
      >
        <ul style={{
          listStyle: 'none',
          margin: 0,
          padding: '8px 0'
        }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li 
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px 24px',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                  background: isActive ? '#2a2a3e' : 'transparent',
                  color: isActive ? '#f97316' : '#a0a0b0',
                  borderBottom: '1px solid #2a2a3e'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = '#1a1a2e';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <Icon size={22} />
                <span style={{ fontSize: '1rem', fontWeight: isActive ? '500' : '400' }}>{item.label}</span>
              </li>
            );
          })}
          
          {/* Show user info in mobile menu when logged in */}
          {user && (
            <div style={{
              padding: '16px 24px',
              marginTop: '16px',
              borderTop: '1px solid #2a2a3e',
              background: '#0a0a12'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: '#f97316',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}>
                  <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
                    {getDisplayName().charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: '500', color: 'white' }}>
                    {getDisplayName()}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: roleBadge.color }}>
                    <RoleIcon size={12} />
                    <span>{roleBadge.text}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </ul>
      </div>

      {/* Overlay when mobile menu is open */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-menu-overlay"
          style={{
            position: 'fixed',
            top: '64px',
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 9998
          }}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          
          .mobile-menu-btn {
            display: flex !important;
          }
          
          .user-info-text {
            display: none !important;
          }
          
          .login-btn-nav {
            padding: 6px 12px !important;
            font-size: 0.8rem !important;
          }
        }
        
        @media (min-width: 769px) {
          .mobile-menu-btn {
            display: none !important;
          }
          
          .mobile-menu-dropdown {
            display: none !important;
          }
          
          .mobile-menu-overlay {
            display: none !important;
          }
        }
        
        /* Touch-friendly targets */
        .mobile-menu-btn {
          min-width: 44px;
          min-height: 44px;
        }
        
        .mobile-menu-dropdown li {
          min-height: 55px;
        }
      `}</style>
    </>
  );
};

export default Navbar;