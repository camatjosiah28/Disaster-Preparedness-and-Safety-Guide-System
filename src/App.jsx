import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/layout/Navbar';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import AlertsList from './components/home/AlertsList';
import EmergencyContacts from './components/home/EmergencyContacts';
import EvacuationMap from './components/maps/EvacuationMap';
import GuidesList from './components/guides/GuidesList';
import ContactsList from './components/contacts/ContactsList';
import UserProfile from './components/profile/UserProfile';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import CentersManagement from './components/admin/CentersManagement';
import AlertsManagement from './components/admin/AlertsManagement';
import PWDManagement from './components/admin/PWDManagement';
import EmergencyContactsManagement from './components/admin/EmergencyContactsManagement';
import GuidesManagement from './components/admin/GuidesManagement';
import UsersManagement from './components/admin/UsersManagement';

import './App.css';

// User App Component
function UserApp({ setView, activeTab, setActiveTab }) {
  const { user } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Trigger refresh when tab changes
  useEffect(() => {
    console.log('Tab changed to:', activeTab);
    setRefreshTrigger(prev => prev + 1);
  }, [activeTab]);

  return (
    <div className="app-container">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        setView={setView} 
      />

      <div className={`emergency-banner ${user ? 'resident' : 'guest'}`}>
        {user 
          ? '✅ You are registered in our system. Stay safe and monitor alerts!' 
          : '⚠️ Guest Mode: Register for priority assistance during emergencies.'}
      </div>

      <main className="content">
        {activeTab === 'home' && (
          <section>
            <h2>📢 Active Alerts</h2>
            <AlertsList refreshTrigger={refreshTrigger} />
            <h2 style={{ marginTop: '2rem' }}>🏥 Emergency Hotlines</h2>
            <EmergencyContacts refreshTrigger={refreshTrigger} />
          </section>
        )}

        {activeTab === 'maps' && (
          <section>
            <h2>📍 Evacuation Centers - Alapan, Imus Cavite</h2>
            <EvacuationMap refreshTrigger={refreshTrigger} />
          </section>
        )}

        {activeTab === 'guides' && (
          <section>
            <h2>📚 Preparedness Guides</h2>
            <GuidesList refreshTrigger={refreshTrigger} />
          </section>
        )}

        {activeTab === 'contacts' && (
          <section>
            <h2>📞 Emergency Contacts</h2>
            <ContactsList refreshTrigger={refreshTrigger} />
          </section>
        )}

        {activeTab === 'profile' && user && (
          <section>
            <h2>👤 My Profile</h2>
            <UserProfile refreshTrigger={refreshTrigger} />
          </section>
        )}
      </main>
    </div>
  );
}

// Main App Content with routing
function AppContent() {
  const [view, setView] = useState('guest');
  const [activeTab, setActiveTab] = useState('home');
  const { user, loading, isAdmin, userProfile } = useAuth();

  // Debug logging
  useEffect(() => {
    console.log('=== AppContent State ===');
    console.log('User:', user?.email);
    console.log('UserProfile Role:', userProfile?.role);
    console.log('Is Admin:', isAdmin);
    console.log('Loading:', loading);
    console.log('========================');
  }, [user, userProfile, isAdmin, loading]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading user data...</p>
      </div>
    );
  }

  // If user is admin, show admin interface
  if (user && isAdmin) {
    console.log('👑 Rendering Admin Interface');
    return (
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="centers" element={<CentersManagement />} />
          <Route path="alerts" element={<AlertsManagement />} />
          <Route path="pwd" element={<PWDManagement />} />
          <Route path="contacts" element={<EmergencyContactsManagement />} />
          <Route path="guides" element={<GuidesManagement />} />
          <Route path="users" element={<UsersManagement />} />
        </Route>
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    );
  }

  // Show login page
  if (view === 'login') {
    return <Login setView={setView} />;
  }

  // Show register page
  if (view === 'register') {
    return <Register setView={setView} />;
  }

  // Show user app (guest or logged in resident)
  console.log('👤 Rendering User Interface');
  return (
    <UserApp 
      setView={setView} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
    />
  );
}

// Main App
function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;