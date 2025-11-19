import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiShoppingCart, FiClipboard, FiCalendar,
  FiCheckSquare, FiBell, FiTrendingUp,
  FiEdit, FiTarget, FiMessageSquare, FiZap
} from 'react-icons/fi';
import {
  shoppingAPI, choresAPI, appointmentsAPI, todosAPI, remindersAPI,
  whiteboardAPI, visionBoardAPI, messagesAPI, webhooksAPI
} from '../services/api';
import '../styles/Dashboard.css';

function Dashboard() {
  const [stats, setStats] = useState({
    shopping: 0,
    chores: 0,
    appointments: 0,
    todos: 0,
    reminders: 0,
    whiteboard: 0,
    visionBoard: 0,
    messages: 0,
    webhooks: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [shopping, chores, appointments, todos, reminders, whiteboard, visionBoard, unreadMessages, webhooks] = await Promise.all([
        shoppingAPI.getAll(),
        choresAPI.getAll(),
        appointmentsAPI.getAll(),
        todosAPI.getAll(),
        remindersAPI.getAll(),
        whiteboardAPI.getAll(),
        visionBoardAPI.getAll(),
        messagesAPI.getUnreadCount(),
        webhooksAPI.getAll(),
      ]);

      setStats({
        shopping: shopping.data.filter(item => !item.isPurchased).length,
        chores: chores.data.filter(chore => !chore.isCompleted).length,
        appointments: appointments.data.length,
        todos: todos.data.length,
        reminders: reminders.data.filter(r => !r.isCompleted).length,
        whiteboard: whiteboard.data.length,
        visionBoard: visionBoard.data.filter(item => item.status !== 'completed').length,
        messages: unreadMessages.data.count || 0,
        webhooks: webhooks.data.filter(w => w.isActive).length,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      title: 'Shopping List',
      count: stats.shopping,
      icon: FiShoppingCart,
      color: 'var(--purple-600)',
      link: '/shopping',
      description: 'Pending items'
    },
    {
      title: 'Chores',
      count: stats.chores,
      icon: FiClipboard,
      color: 'var(--purple-500)',
      link: '/chores',
      description: 'To complete'
    },
    {
      title: 'Appointments',
      count: stats.appointments,
      icon: FiCalendar,
      color: 'var(--purple-400)',
      link: '/appointments',
      description: 'Scheduled'
    },
    {
      title: 'To-Do Lists',
      count: stats.todos,
      icon: FiCheckSquare,
      color: 'var(--purple-700)',
      link: '/todos',
      description: 'Active lists'
    },
    {
      title: 'Reminders',
      count: stats.reminders,
      icon: FiBell,
      color: 'var(--purple-800)',
      link: '/reminders',
      description: 'Active reminders'
    },
    {
      title: 'Whiteboard',
      count: stats.whiteboard,
      icon: FiEdit,
      color: '#9D8DF1',
      link: '/whiteboard',
      description: 'Creative notes'
    },
    {
      title: 'Vision Board',
      count: stats.visionBoard,
      icon: FiTarget,
      color: '#FF6B9D',
      link: '/vision-board',
      description: 'Goals & dreams'
    },
    {
      title: 'Messages',
      count: stats.messages,
      icon: FiMessageSquare,
      color: '#4ECDC4',
      link: '/messages',
      description: 'Unread messages'
    },
    {
      title: 'Webhooks',
      count: stats.webhooks,
      icon: FiZap,
      color: '#FFD93D',
      link: '/webhooks',
      description: 'Active webhooks'
    },
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <motion.div 
        className="dashboard-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">Overview of your household management</p>
        </div>
        <div className="dashboard-badge">
          <FiTrendingUp />
          <span>All systems active</span>
        </div>
      </motion.div>

      <div className="dashboard-grid">
        {cards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link to={card.link} className="dashboard-card">
              <div className="card-icon" style={{ color: card.color }}>
                <card.icon />
              </div>
              <div className="card-content">
                <h3 className="card-title">{card.title}</h3>
                <p className="card-description">{card.description}</p>
              </div>
              <div className="card-count" style={{ color: card.color }}>
                {card.count}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <motion.div 
        className="welcome-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="welcome-title">Welcome to Micasa</h2>
        <p className="welcome-text">
          Manage your household together with your partner. Keep track of shopping, 
          chores, appointments, and more - all in one place.
        </p>
        <div className="welcome-features">
          <div className="feature-item">
            <span className="feature-icon">✨</span>
            <span>Real-time sync</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🤝</span>
            <span>Shared features</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🎨</span>
            <span>Beautiful design</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Dashboard;
