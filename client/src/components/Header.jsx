import { useAuth } from '../contexts/AuthContext';
import { FiLogOut, FiUser, FiUsers } from 'react-icons/fi';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/Header.css';

function Header() {
  const { user, logout, linkPartner } = useAuth();
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [partnerUsername, setPartnerUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLinkPartner = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await linkPartner(partnerUsername);
      setSuccess('Partner linked successfully!');
      setPartnerUsername('');
      setTimeout(() => {
        setShowLinkModal(false);
        setSuccess('');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to link partner');
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <h2 className="header-title">Welcome back, {user?.displayName}!</h2>
        </div>
        
        <div className="header-right">
          {!user?.partnerId && (
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => setShowLinkModal(true)}
            >
              <FiUsers /> Link Partner
            </button>
          )}
          
          <div className="user-info">
            <FiUser className="user-icon" />
            <span>{user?.username}</span>
          </div>

          <button className="btn btn-secondary btn-sm" onClick={logout}>
            <FiLogOut /> Logout
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showLinkModal && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLinkModal(false)}
          >
            <motion.div 
              className="modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ marginBottom: '1.5rem', color: 'var(--purple-400)' }}>Link Your Partner</h3>
              
              <form onSubmit={handleLinkPartner}>
                <div className="form-group">
                  <label className="form-label">Partner's Username</label>
                  <input
                    type="text"
                    className="form-input"
                    value={partnerUsername}
                    onChange={(e) => setPartnerUsername(e.target.value)}
                    placeholder="Enter partner's username"
                    required
                  />
                </div>

                {error && (
                  <div style={{ 
                    padding: '0.75rem', 
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid var(--error)',
                    borderRadius: '8px',
                    color: 'var(--error)',
                    marginBottom: '1rem'
                  }}>
                    {error}
                  </div>
                )}

                {success && (
                  <div style={{ 
                    padding: '0.75rem', 
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid var(--success)',
                    borderRadius: '8px',
                    color: 'var(--success)',
                    marginBottom: '1rem'
                  }}>
                    {success}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    Link Partner
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowLinkModal(false)}
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Header;
