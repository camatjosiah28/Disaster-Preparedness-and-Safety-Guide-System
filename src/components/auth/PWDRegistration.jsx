import React from 'react';
import { FaWheelchair, FaMicrochip, FaUser, FaPhone, FaExclamationTriangle, FaHandsHelping, FaBed } from 'react-icons/fa';

const PWDRegistration = ({ formData, handleChange, handleCheckbox, loading }) => {
  const onInputChange = (e) => {
    const { name, type, checked, value } = e.target;
    if (type === 'checkbox') {
      if (handleCheckbox) {
        handleCheckbox(e);
      } else {
        handleChange(e);
      }
    } else {
      handleChange(e);
    }
  };

  const getMobilityIcon = () => {
    switch(formData.mobilityLevel) {
      case 'Independent':
        return <FaHandsHelping style={{ color: '#27ae60' }} />;
      case 'Needs Assistance':
        return <FaHandsHelping style={{ color: '#e67e22' }} />;
      case 'Bedridden':
        return <FaBed style={{ color: '#c0392b' }} />;
      default:
        return <FaWheelchair style={{ color: '#3498db' }} />;
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      background: '#f8f9fa', 
      borderRadius: '8px',
      marginBottom: '20px',
      border: '1px solid #dee2e6'
    }}>
      <h4 style={{ 
        marginTop: 0, 
        marginBottom: '15px', 
        color: '#495057',
        fontSize: '18px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        {getMobilityIcon()}
        PWD Information
      </h4>
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '8px', 
          fontWeight: '500',
          color: '#495057'
        }}>
          Level of Assistance Needed *
        </label>
        <select
          name="mobilityLevel"
          value={formData.mobilityLevel || 'Independent'}
          onChange={onInputChange}
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ced4da',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        >
          <option value="Independent">Independent - Can move without assistance</option>
          <option value="Needs Assistance">Needs Assistance - Requires help during emergencies</option>
          <option value="Bedridden">Bedridden - Cannot move without full assistance</option>
        </select>
      </div>

      <label style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        marginBottom: '15px',
        cursor: 'pointer'
      }}>
        <input
          type="checkbox"
          name="needsMedicalDevice"
          checked={formData.needsMedicalDevice || false}
          onChange={onInputChange}
          disabled={loading}
        />
        <FaMicrochip style={{ color: '#6c757d' }} />
        <span>Needs Medical Device</span>
      </label>

      {formData.needsMedicalDevice && (
        <input
          name="deviceDetails"
          type="text"
          placeholder="Specify medical device/s (e.g., wheelchair, oxygen tank)"
          value={formData.deviceDetails || ''}
          onChange={onInputChange}
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '15px',
            border: '1px solid #ced4da',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        />
      )}

      <div style={{ position: 'relative', marginBottom: '10px' }}>
        <FaUser style={{ 
          position: 'absolute', 
          left: '10px', 
          top: '50%', 
          transform: 'translateY(-50%)',
          color: '#6c757d',
          zIndex: 1
        }} />
        <input
          name="emergencyContactName"
          type="text"
          placeholder="Emergency Contact Person Name *"
          value={formData.emergencyContactName || ''}
          onChange={onInputChange}
          disabled={loading}
          required={formData.isPWD}
          style={{
            width: '100%',
            padding: '10px 10px 10px 35px',
            border: '1px solid #ced4da',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        />
      </div>

      <div style={{ position: 'relative', marginBottom: '10px' }}>
        <FaPhone style={{ 
          position: 'absolute', 
          left: '10px', 
          top: '50%', 
          transform: 'translateY(-50%)',
          color: '#6c757d',
          zIndex: 1
        }} />
        <input
          name="emergencyContactNumber"
          type="tel"
          placeholder="Emergency Contact Number *"
          value={formData.emergencyContactNumber || ''}
          onChange={onInputChange}
          disabled={loading}
          required={formData.isPWD}
          style={{
            width: '100%',
            padding: '10px 10px 10px 35px',
            border: '1px solid #ced4da',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        />
      </div>
      
      <small style={{ 
        color: '#856404',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        marginTop: '12px',
        fontSize: '12px',
        background: '#fff3cd',
        padding: '8px',
        borderRadius: '4px'
      }}>
        <FaExclamationTriangle />
        This information will help first responders assist you better during emergencies.
      </small>
    </div>
  );
};

export default PWDRegistration;