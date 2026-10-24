import { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { toast } from 'react-toastify';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [activeBusiness, setActiveBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to determine initial business from user data
  const resolveInitialBusiness = (userData) => {
    const bizList = userData?.businesses || [];
    if (bizList.length === 0) return null;

    const savedBizId = localStorage.getItem('businessId');
    const matched = bizList.find((b) => (b._id || b.id || b).toString() === savedBizId);
    const active = matched || bizList[0];

    if (active?._id) {
      localStorage.setItem('businessId', active._id.toString());
    }
    return active;
  };

  const verifyToken = async (token) => {
    try {
      const response = await axios.get('http://localhost:5000/api/auth/verify', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userData = response.data.user;
      setUser(userData);
      const active = resolveInitialBusiness(userData);
      setActiveBusiness(active);
    } catch (error) {
      console.error('Auth verification failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('businessId');
      setUser(null);
      setActiveBusiness(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token') || '';
    verifyToken(token);
  }, []);

  const login = async (identifier, password) => {
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      identifier,
      email: identifier,
      business_id: identifier,
      password
    });
    const { token, user: userData } = response.data;
    localStorage.setItem('token', token);
    setUser(userData);
    const active = resolveInitialBusiness(userData);
    setActiveBusiness(active);
    return response.data;
  };

  const signup = async (name, email, password) => {
    const response = await axios.post('http://localhost:5000/api/auth/signup', { name, email, password });
    const { token, user: userData } = response.data;
    localStorage.setItem('token', token);
    setUser(userData);
    const active = resolveInitialBusiness(userData);
    setActiveBusiness(active);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('businessId');
    setUser(null);
    setActiveBusiness(null);
  };

  // Switch active business
  const switchBusiness = (businessId) => {
    const bizList = user?.businesses || [];
    const matched = bizList.find((b) => (b._id || b.id || b).toString() === businessId.toString());
    if (matched) {
      localStorage.setItem('businessId', businessId.toString());
      setActiveBusiness(matched);
      toast.info(`Switched to ${matched.name}`);
      return matched;
    }
  };

  // Create new business via backend API
  const createBusiness = async (businessData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/business', businessData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const newBiz = response.data.business;
      const updatedBusinesses = response.data.businesses || [...(user?.businesses || []), newBiz];

      setUser((prev) => {
        if (!prev) {
          return {
            id: newBiz.userId || newBiz.owner,
            name: 'User',
            businesses: updatedBusinesses
          };
        }
        return {
          ...prev,
          businesses: updatedBusinesses
        };
      });

      localStorage.setItem('businessId', newBiz._id.toString());
      setActiveBusiness(newBiz);
      toast.success(`Business "${newBiz.name}" created successfully!`);
      return newBiz;
    } catch (error) {
      console.error('Error creating business:', error);
      const errMsg = error.response?.data?.error || 'Failed to create business';
      toast.error(errMsg);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeBusiness,
        businesses: user?.businesses || [],
        loading,
        login,
        signup,
        logout,
        switchBusiness,
        createBusiness
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
