import { NavLink } from 'react-router-dom';
import { FiHome, FiShoppingCart, FiCalendar, FiCheckSquare, FiBell, FiClipboard, FiEdit, FiTarget, FiMessageSquare, FiWifi } from 'react-icons/fi';
import { motion } from 'framer-motion';
import '../styles/Sidebar.css';

const menuItems = [
  { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
  { path: '/shopping', icon: FiShoppingCart, label: 'Shopping' },
  { path: '/chores', icon: FiClipboard, label: 'Chores' },
  { path: '/appointments', icon: FiCalendar, label: 'Appointments' },
  { path: '/todos', icon: FiCheckSquare, label: 'To-Do Lists' },
  { path: '/reminders', icon: FiBell, label: 'Reminders' },
  { path: '/whiteboard', icon: FiEdit, label: 'Whiteboard' },
  { path: '/vision-board', icon: FiTarget, label: 'Vision Board' },
  { path: '/messages', icon: FiMessageSquare, label: 'Messages' },
  { path: '/webhooks', icon: FiWifi, label: 'Webhooks' },
];

function Sidebar() {
  return (
    <motion.aside 
      className="sidebar"
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="sidebar-header">
        <h1 className="sidebar-logo">
          <span className="logo-icon">🏠</span>
          Micasa
        </h1>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <item.icon className="sidebar-icon" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-tagline">
          Manage your household together
        </div>
      </div>
    </motion.aside>
  );
}

export default Sidebar;
