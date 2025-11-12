import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiTrash2, FiEdit } from 'react-icons/fi';
import { appointmentsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import '../styles/Shopping.css';

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await appointmentsAPI.getAll();
      setAppointments(response.data);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this appointment?')) return;
    try {
      await appointmentsAPI.delete(id);
      fetchAppointments();
    } catch (error) {
      console.error('Failed to delete appointment:', error);
    }
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div></div>;
  }

  return (
    <div className="shopping-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Appointments</h1>
          <p className="page-subtitle">{appointments.length} scheduled appointment{appointments.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="shopping-sections">
        <section className="shopping-section">
          <h2 className="section-title">All Appointments</h2>
          <div className="shopping-grid">
            {appointments.map((apt) => (
              <motion.div key={apt._id} className="shopping-item" layout>
                <div className="item-header">
                  <h3 className="item-title">{apt.title}</h3>
                  <span className={`badge badge-medium`}>{apt.category}</span>
                </div>
                
                {apt.description && <p className="item-notes">{apt.description}</p>}
                
                <div className="item-details">
                  <span>{format(new Date(apt.startTime), 'MMM dd, yyyy h:mm a')}</span>
                </div>

                {apt.location && (
                  <div className="item-details">
                    <span>📍 {apt.location}</span>
                  </div>
                )}

                <div className="item-meta">
                  Created by {apt.createdBy?.displayName}
                </div>

                <div className="item-actions">
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(apt._id)}>
                    <FiTrash2 /> Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
          {appointments.length === 0 && <div className="empty-state"><p>No appointments scheduled</p></div>}
        </section>
      </div>
    </div>
  );
}

export default Appointments;
