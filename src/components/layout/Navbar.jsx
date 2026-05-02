import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = ({ activeTab, setActiveTab, setView }) => {
  const { user, userProfile, logout } = useAuth();

  const handleLogout = () => {
    console.log('🟢 Logout button clicked');
    logout();
  };

  let logoSrc;
  try {
    logoSrc = new URL('../../assets/logo.png', import.meta.url).href;
  } catch (error) {
    logoSrc = null;
  }

  return (
    <nav className="navbar">
      <div className="nav-logo" onClick={() => setView('guest')}>
        {logoSrc ? (
          <img 
            src={logoSrc}
            alt="LigtasSystem Logo" 
            className="logo-image"
            style={{ 
              height: '40px', 
              width: 'auto',
              marginRight: '10px',
              verticalAlign: 'middle'
            }} 
          />
        ) : (
          <span style={{ marginRight: '10px' }}>🏠</span>
        )}
        Alapan Ready
      </div>
      <ul className="nav-links">
        <li className={activeTab === 'home' ? 'active' : ''} onClick={() => setActiveTab('home')}>Home</li>
        <li className={activeTab === 'maps' ? 'active' : ''} onClick={() => setActiveTab('maps')}>Evacuation Maps</li>
        <li className={activeTab === 'guides' ? 'active' : ''} onClick={() => setActiveTab('guides')}>Preparedness Guides</li>
        <li className={activeTab === 'contacts' ? 'active' : ''} onClick={() => setActiveTab('contacts')}>Emergency Contacts</li>
        {user && (
          <li className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>My Profile</li>
        )}
      </ul>
      <div className="nav-auth">
        {user ? (
          <>
            <span className="user-greeting">Hi, {userProfile?.full_name || user.email}!</span>
            <button 
              className="logout-mini" 
              onClick={handleLogout}
              style={{ cursor: 'pointer' }}
            >
              Logout
            </button>
          </>
        ) : (
          <button 
            className="login-btn-nav" 
            onClick={() => setView('login')}
          >
            Login / Register
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;