import React from 'react';

const PWDRegistration = ({ formData, handleChange, handleCheckbox, loading }) => {
  // Use the same handleChange for both input and checkbox
  const onChange = (e) => {
    const { name, type, checked, value } = e.target;
    if (type === 'checkbox') {
      handleChange(e); // handleChange already handles checkboxes
    } else {
      handleChange(e);
    }
  };

  return (
    <div style={{ 
      padding: '15px', 
      background: '#f5f5f5', 
      borderRadius: '5px',
      marginBottom: '15px',
      textAlign: 'left'
    }}>
      <h4 style={{ marginTop: 0, marginBottom: '15px', color: '#333' }}>PWD Information</h4>
      
      <select
        name="disabilityType"
        value={formData.disabilityType}
        onChange={handleChange}
        disabled={loading}
        required
        className="auth-input"
        style={{ marginBottom: '10px' }}
      >
        <option value="">Select Disability Type *</option>
        <option value="Physical">Physical Disability</option>
        <option value="Visual">Visual Impairment</option>
        <option value="Hearing">Hearing Impairment</option>
        <option value="Intellectual">Intellectual Disability</option>
        <option value="Psychosocial">Psychosocial Disability</option>
        <option value="Multiple">Multiple Disabilities</option>
      </select>

      <select
        name="mobilityLevel"
        value={formData.mobilityLevel}
        onChange={handleChange}
        disabled={loading}
        className="auth-input"
        style={{ marginBottom: '10px' }}
      >
        <option value="Independent">Independent (can move without assistance)</option>
        <option value="WithAssistance">Needs Assistance</option>
        <option value="Bedridden">Bedridden</option>
      </select>

      <label style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px', 
        marginBottom: '10px',
        padding: '5px 0'
      }}>
        <input
          type="checkbox"
          name="needsMedicalDevice"
          checked={formData.needsMedicalDevice}
          onChange={handleCheckbox || handleChange}
          disabled={loading}
        />
        <span>Needs Medical Device?</span>
      </label>

      {formData.needsMedicalDevice && (
        <input
          name="deviceDetails"
          type="text"
          placeholder="Device Details"
          value={formData.deviceDetails}
          onChange={handleChange}
          disabled={loading}
          className="auth-input"
          style={{ marginBottom: '10px' }}
        />
      )}

      <input
        name="emergencyContactName"
        type="text"
        placeholder="Emergency Contact Name"
        value={formData.emergencyContactName}
        onChange={handleChange}
        disabled={loading}
        className="auth-input"
        style={{ marginBottom: '10px' }}
      />

      <input
        name="emergencyContactNumber"
        type="text"
        placeholder="Emergency Contact Number"
        value={formData.emergencyContactNumber}
        onChange={handleChange}
        disabled={loading}
        className="auth-input"
        style={{ marginBottom: '5px' }}
      />
    </div>
  );
};

export default PWDRegistration;