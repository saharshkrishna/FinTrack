import { createContext, useState, useEffect, useCallback } from 'react';
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

  const verifyToken = useCallback(async (token) => {
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
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token') || '';
    verifyToken(token);
  }, [verifyToken]);

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

  const signup = async (userDataOrName, email, password) => {
    const payload = (typeof userDataOrName === 'object' && userDataOrName !== null)
      ? userDataOrName
      : { name: userDataOrName, email, password };

    const response = await axios.post('http://localhost:5000/api/auth/signup', payload);
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

  // Update existing business details
  const updateBusiness = async (businessId, businessData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:5000/api/business/${businessId}`, businessData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const updatedBiz = response.data.business;
      const updatedList = response.data.businesses || (user?.businesses || []).map(b => (b._id === businessId ? updatedBiz : b));

      setUser((prev) => prev ? { ...prev, businesses: updatedList } : prev);

      if (activeBusiness?._id === businessId) {
        setActiveBusiness(updatedBiz);
      }

      toast.success('Business settings updated successfully!');
      return updatedBiz;
    } catch (error) {
      console.error('Error updating business:', error);
      const errMsg = error.response?.data?.error || 'Failed to update business';
      toast.error(errMsg);
      throw error;
    }
  };

  // Delete business ledger and cascade delete related data
  const deleteBusiness = async (businessId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`http://localhost:5000/api/business/${businessId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const remainingBusinesses = response.data.businesses || [];
      const newActive = response.data.activeBusiness || remainingBusinesses[0] || null;

      setUser((prev) => prev ? { ...prev, businesses: remainingBusinesses } : prev);

      if (newActive?._id) {
        localStorage.setItem('businessId', newActive._id.toString());
        setActiveBusiness(newActive);
      } else {
        localStorage.removeItem('businessId');
        setActiveBusiness(null);
      }

      toast.success('Business ledger deleted successfully');
      return response.data;
    } catch (error) {
      console.error('Error deleting business:', error);
      const errMsg = error.response?.data?.error || 'Failed to delete business';
      toast.error(errMsg);
      throw error;
    }
  };

  // Delete entire user account and all owned businesses
  const deleteAccount = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete('http://localhost:5000/api/auth/account', {
        headers: { Authorization: `Bearer ${token}` }
      });
      logout();
      toast.success('Account deleted successfully');
    } catch (error) {
      console.error('Error deleting account:', error);
      const errMsg = error.response?.data?.error || 'Failed to delete account';
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
        createBusiness,
        updateBusiness,
        deleteBusiness,
        deleteAccount
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
