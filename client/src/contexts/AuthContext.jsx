import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await axios.get('/api/auth/me');
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    const response = await axios.post('/api/auth/login', { username, password });
    const { token: newToken, ...userData } = response.data;
    
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    
    return userData;
  };

  const register = async (username, password, displayName) => {
    const response = await axios.post('/api/auth/register', { 
      username, 
      password, 
      displayName 
    });
    const { token: newToken, ...userData } = response.data;
    
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const linkPartner = async (partnerUsername) => {
    const response = await axios.put('/api/auth/link-partner', { partnerUsername });
    await fetchUser(); // Refresh user data
    return response.data;
  };

  const getHouseholdId = () => {
    if (!user) return null;
    if (user.partnerId) {
      return [user.id, user.partnerId].sort().join('-');
    }
    return user.id;
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    linkPartner,
    getHouseholdId,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
