// DataContext.jsx
import { createContext, useState, useEffect } from "react";
import PropTypes from 'prop-types';
import axios from "axios";
import { toast } from 'react-toastify';

export const DataContext = createContext();

const API_BASE_URL = "http://localhost:5000/api/user";

export const DataProvider = ({ children }) => {
  const [parties, setParties] = useState([]);
  const [categories, setCategories] = useState([]);
  const [paymentModes, setPaymentModes] = useState([]);
  const [loans, setLoans] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [partiesResponse, categoriesResponse, paymentModesResponse, loansResponse, transactionsResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/parties`),
          axios.get(`${API_BASE_URL}/category`),
          axios.get(`${API_BASE_URL}/paymentmode`),
          axios.get(`${API_BASE_URL}/loans`),
          axios.get(`${API_BASE_URL}/transactions`)
        ]);
        
        setParties(partiesResponse.data.parties || []);
        setCategories(categoriesResponse.data.category || []);
        setPaymentModes(paymentModesResponse.data.paymentMode || []);
        setLoans(loansResponse.data.loans || []);
        setTransactions(transactionsResponse.data.transactions || []);
      } catch (err) {
        console.error("Error fetching shared data:", err);
        setError("Error fetching data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // ==================== Party APIs ====================
  const fetchParties = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/parties`);
      setParties(response.data.parties || []);
    } catch (err) {
      console.error("Error fetching parties:", err);
      toast.error("Failed to fetch parties");
    }
  };

  const createParty = async (partyData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/parties`, partyData);
      const newParty = response.data.party;
      setParties((prev) => [...prev, newParty]);
      toast.success("Party added successfully");
      return newParty;
    } catch (error) {
      console.error("Error creating party:", error);
      toast.error("Failed to add party");
      throw error;
    }
  };

  const updateParty = async (id, updatedData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/parties/${id}`, updatedData);
      setParties((prevParties) =>
        prevParties.map((party) => (party._id === id ? response.data.party : party))
      );
      toast.success("Party updated successfully");
      return response.data.party;
    } catch (error) {
      console.error("Error updating party:", error);
      toast.error("Failed to update party");
      throw error;
    }
  };

  const deleteParty = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/parties/${id}`);
      setParties((prevParties) => prevParties.filter((party) => party._id !== id));
      toast.success("Party deleted successfully");
    } catch (error) {
      console.error("Error deleting party:", error);
      toast.error("Failed to delete party");
      throw error;
    }
  };

  // ==================== Transaction APIs ====================
  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/transactions`);
      setTransactions(response.data.transactions || []);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      toast.error("Failed to fetch transactions");
    }
  };

  const createTransaction = async (transactionData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/transactions`, transactionData);
      const newTransaction = response.data.transaction;
      setTransactions((prev) => [newTransaction, ...prev]);
      toast.success("Transaction created successfully");
      return newTransaction;
    } catch (error) {
      console.error("Error creating transaction:", error);
      toast.error("Failed to create transaction");
      throw error;
    }
  };

  const updateTransaction = async (id, updatedData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/transactions/${id}`, updatedData);
      setTransactions((prevTransactions) =>
        prevTransactions.map((transaction) => 
          transaction._id === id ? response.data.transaction : transaction
        )
      );
      toast.success("Transaction updated successfully");
      return response.data.transaction;
    } catch (error) {
      console.error("Error updating transaction:", error);
      toast.error("Failed to update transaction");
      throw error;
    }
  };

  const deleteTransactions = async (ids) => {
    try {
      await axios.post(`${API_BASE_URL}/transactions/delete`, { ids });
      setTransactions((prevTransactions) => 
        prevTransactions.filter((transaction) => !ids.includes(transaction._id))
      );
      toast.success("Transaction(s) deleted successfully");
    } catch (error) {
      console.error("Error deleting transactions:", error);
      toast.error("Failed to delete transaction(s)");
      throw error;
    }
  };

  // ==================== Loan APIs ====================
  const fetchLoans = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/loans`);
      setLoans(response.data.loans || []);
    } catch (err) {
      console.error("Error fetching loans:", err);
      toast.error("Failed to fetch loans");
    }
  };

  const createLoan = async (loanData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/loans`, loanData);
      const newLoan = response.data.loan;
      setLoans((prev) => [newLoan, ...prev]);
      toast.success("Loan added successfully");
      return newLoan;
    } catch (error) {
      console.error("Error creating loan:", error);
      toast.error("Failed to add loan");
      throw error;
    }
  };

  const updateLoan = async (id, updatedData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/loans/${id}`, updatedData);
      setLoans((prevLoans) =>
        prevLoans.map((loan) => (loan._id === id ? response.data.loan : loan))
      );
      toast.success("Loan updated successfully");
      return response.data.loan;
    } catch (error) {
      console.error("Error updating loan:", error);
      toast.error("Failed to update loan");
      throw error;
    }
  };

  const deleteLoan = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/loans/${id}`);
      setLoans((prevLoans) => prevLoans.filter((loan) => loan._id !== id));
      toast.success("Loan deleted successfully");
    } catch (error) {
      console.error("Error deleting loan:", error);
      toast.error("Failed to delete loan");
      throw error;
    }
  };

  // ==================== Category APIs ====================
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/category`);
      setCategories(response.data.category || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
      toast.error("Failed to fetch categories");
    }
  };

  const createCategory = async (categoryData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/category`, categoryData);
      const newCategory = response.data.newCategory;
      setCategories((prev) => [...prev, newCategory]);
      toast.success("Category added successfully");
      return newCategory;
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("Failed to add category");
      throw error;
    }
  };

  const updateCategory = async (id, updatedData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/category/${id}`, updatedData);
      setCategories((prevCategories) =>
        prevCategories.map((category) => (category._id === id ? response.data.category : category))
      );
      toast.success("Category updated successfully");
      return response.data.category;
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category");
      throw error;
    }
  };

  const deleteCategory = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/category/${id}`);
      setCategories((prevCategories) => prevCategories.filter((category) => category._id !== id));
      toast.success("Category deleted successfully");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
      throw error;
    }
  };

  // ==================== Payment Mode APIs ====================
  const fetchPaymentModes = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/paymentmode`);
      setPaymentModes(response.data.paymentMode || []);
    } catch (err) {
      console.error("Error fetching payment modes:", err);
      toast.error("Failed to fetch payment modes");
    }
  };

  const createPaymentMode = async (paymentModeData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/paymentMode`, paymentModeData);
      const newPaymentMode = response.data.newPaymentMode;
      setPaymentModes((prev) => [...prev, newPaymentMode]);
      toast.success("Payment mode added successfully");
      return newPaymentMode;
    } catch (error) {
      console.error("Error creating payment mode:", error);
      toast.error("Failed to add payment mode");
      throw error;
    }
  };

  const updatePaymentMode = async (id, updatedData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/paymentMode/${id}`, updatedData);
      setPaymentModes((prevPaymentModes) =>
        prevPaymentModes.map((pm) => (pm._id === id ? response.data.paymentMode : pm))
      );
      toast.success("Payment mode updated successfully");
      return response.data.paymentMode;
    } catch (error) {
      console.error("Error updating payment mode:", error);
      toast.error("Failed to update payment mode");
      throw error;
    }
  };

  const deletePaymentMode = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/paymentMode/${id}`);
      setPaymentModes((prevPaymentModes) => prevPaymentModes.filter((pm) => pm._id !== id));
      toast.success("Payment mode deleted successfully");
    } catch (error) {
      console.error("Error deleting payment mode:", error);
      toast.error("Failed to delete payment mode");
      throw error;
    }
  };

  return (
    <DataContext.Provider
      value={{
        // Shared data
        parties,
        categories,
        paymentModes,
        loans,
        transactions,
        loading,
        error,
        // Party operations
        fetchParties,
        createParty,
        updateParty,
        deleteParty,
        // Transaction operations
        fetchTransactions,
        createTransaction,
        updateTransaction,
        deleteTransactions,
        // Loan operations
        fetchLoans,
        createLoan,
        updateLoan,
        deleteLoan,
        // Category operations
        fetchCategories,
        createCategory,
        updateCategory,
        deleteCategory,
        // PaymentMode operations
        fetchPaymentModes,
        createPaymentMode,
        updatePaymentMode,
        deletePaymentMode,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

DataProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
