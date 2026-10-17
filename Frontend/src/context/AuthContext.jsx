import { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      const response = await axios.get('http://localhost:5000/api/auth/verify', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data.user);
      if (response.data.user?.businessId) {
        localStorage.setItem('businessId', response.data.user.businessId);
      }
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('businessId');
    } finally {
      setLoading(false);
    }
  };

  const login = async (identifier, password) => {
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      identifier,
      email: identifier,
      business_id: identifier,
      password
    });
    localStorage.setItem('token', response.data.token);
    if (response.data.user?.businessId) {
      localStorage.setItem('businessId', response.data.user.businessId);
    }
    setUser(response.data.user);
    return response.data;
  };

  const signup = async (name, email, password) => {
    const response = await axios.post('http://localhost:5000/api/auth/signup', { name, email, password });
    localStorage.setItem('token', response.data.token);
    if (response.data.user?.businessId) {
      localStorage.setItem('businessId', response.data.user.businessId);
    }
    setUser(response.data.user);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('businessId');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
