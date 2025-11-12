import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSave, FaUser } from 'react-icons/fa';
import '../styles/Settings.css';

const Settings = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('member');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const roles = [
    { value: 'husband', label: 'Husband' },
    { value: 'wife', label: 'Wife' },
    { value: 'partner', label: 'Partner' },
    { value: 'dependent', label: 'Dependent' },
    { value: 'child', label: 'Child' },
    { value: 'sibling', label: 'Sibling' },
    { value: 'roommate', label: 'Roommate' },
    { value: 'member', label: 'Member' },
  ];

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setUser(data);
      setRole(data.role || 'member');
    } catch (error) {
      console.error('Error fetching user data:', error);
      setMessage({ type: 'error', text: 'Failed to load user data' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRole = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/auth/update-role', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ role })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Role updated successfully!' });
        fetchUserData();
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.message || 'Failed to update role' });
      }
    } catch (error) {
      console.error('Error updating role:', error);
      setMessage({ type: 'error', text: 'An error occurred while updating role' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading settings...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="settings-container"
    >
      <div className="settings-header">
        <h1>⚙️ Settings</h1>
        <p>Manage your household profile and preferences</p>
      </div>

      <div className="settings-content">
        <div className="settings-section">
          <div className="section-header">
            <FaUser />
            <h2>Profile Information</h2>
          </div>

          <div className="profile-info">
            <div className="info-item">
              <label>Username:</label>
              <span>{user?.username}</span>
            </div>
            <div className="info-item">
              <label>Display Name:</label>
              <span>{user?.displayName}</span>
            </div>
            {user?.partnerId && (
              <div className="info-item">
                <label>Partner Linked:</label>
                <span className="status-badge linked">✓ Yes</span>
              </div>
            )}
          </div>
        </div>

        <div className="settings-section">
          <div className="section-header">
            <h2>Household Role</h2>
          </div>

          <form onSubmit={handleSaveRole} className="role-form">
            <div className="form-group">
              <label>Select Your Role:</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="role-select"
              >
                {roles.map(r => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <p className="form-help">
                Choose a role that best describes your position in the household
              </p>
            </div>

            {message.text && (
              <div className={`message ${message.type}`}>
                {message.text}
              </div>
            )}

            <button 
              type="submit" 
              className="btn-primary"
              disabled={saving}
            >
              <FaSave /> {saving ? 'Saving...' : 'Save Role'}
            </button>
          </form>
        </div>

        <div className="settings-section">
          <div className="section-header">
            <h2>About Household Roles</h2>
          </div>
          <div className="info-text">
            <p>
              Setting your household role helps personalize your experience and makes it easier 
              to organize responsibilities among household members. Roles can be updated at any time.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;
