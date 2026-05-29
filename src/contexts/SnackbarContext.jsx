import React, { createContext, useContext, useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const SnackbarContext = createContext();

export const useSnackbar = () => useContext(SnackbarContext);

const SnackbarComponent = ({ message, type, onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch(type) {
      case 'success':
        return <CheckCircle size={18} color="#10b981" />;
      case 'error':
        return <AlertCircle size={18} color="#ef4444" />;
      case 'warning':
        return <AlertTriangle size={18} color="#f59e0b" />;
      default:
        return <Info size={18} color="#3b82f6" />;
    }
  };

  const getBgColor = () => {
    switch(type) {
      case 'success':
        return '#d1fae5';
      case 'error':
        return '#fee2e2';
      case 'warning':
        return '#fed7aa';
      default:
        return '#dbeafe';
    }
  };

  const getTextColor = () => {
    switch(type) {
      case 'success':
        return '#065f46';
      case 'error':
        return '#991b1b';
      case 'warning':
        return '#92400e';
      default:
        return '#1e40af';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 9999,
      animation: 'slideIn 0.3s ease'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 20px',
        backgroundColor: getBgColor(),
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        borderLeft: `4px solid ${getIcon().props.color}`,
        minWidth: '280px',
        maxWidth: '400px'
      }}>
        {getIcon()}
        <span style={{ flex: 1, fontSize: '13px', color: getTextColor(), fontWeight: '500' }}>
          {message}
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px'
          }}
        >
          <X size={16} color={getTextColor()} />
        </button>
      </div>
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export const SnackbarProvider = ({ children }) => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    type: 'info'
  });

  const showSnackbar = (message, type = 'info') => {
    setSnackbar({ open: true, message, type });
  };

  const hideSnackbar = () => {
    setSnackbar({ open: false, message: '', type: 'info' });
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      {snackbar.open && (
        <SnackbarComponent
          message={snackbar.message}
          type={snackbar.type}
          onClose={hideSnackbar}
        />
      )}
    </SnackbarContext.Provider>
  );
};