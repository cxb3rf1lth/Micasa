import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import socketService from '../services/socket';
import Sidebar from './Sidebar';
import Header from './Header';
import '../styles/Layout.css';

function Layout() {
  const { user, getHouseholdId } = useAuth();

  useEffect(() => {
    // Connect to socket with authentication token and join household room
    const token = localStorage.getItem('token');

    if (token) {
      const socket = socketService.connect(token);
      const householdId = getHouseholdId();

      if (householdId) {
        socketService.joinHousehold(householdId);
      }
    }

    return () => {
      socketService.disconnect();
    };
  }, [user, getHouseholdId]);

  return (
    <div className="layout">
      <Sidebar />
      <div className="layout-main">
        <Header />
        <main className="layout-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
