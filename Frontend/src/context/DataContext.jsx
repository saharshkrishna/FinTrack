// DataContext.jsx
import { createContext, useState, useEffect } from "react";
import PropTypes from 'prop-types';
import axios from "axios";
import { toast } from 'react-toastify';

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [parties, setParties] = useState([]);
  const [categories, setCategories] = useState([]);
  const [paymentModes, setPaymentModes] = useState([]);
  const [loans, setLoans] = useState([]); // 🆕 Loans state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [partiesResponse, categoriesResponse, paymentModesResponse,loansResponse] = await Promise.all([
          axios.get("http://localhost:5000/api/user/parties"),
          axios.get("http://localhost:5000/api/user/category"),
          axios.get("http://localhost:5000/api/user/paymentmode"),
          axios.get("http://localhost:5000/api/user/loans")
        ]);
  
        setParties(partiesResponse.data.parties || []);
        setCategories(categoriesResponse.data.category || []);
        setPaymentModes(paymentModesResponse.data.paymentMode || []);
        setLoans(loansResponse.data.loans || []);
      } catch (err) {
        console.error("Error fetching shared data:", err);
        setError("Error fetching data");
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);

  
// 🆕 Loan-related APIs
const fetchLoans = async () => {
  try {
    const response = await axios.get("http://localhost:5000/api/user/loans");
    setLoans(response.data.loans || []);
  } catch (err) {
    console.error("Error fetching loans:", err);
  }
};

const createLoan = async (loanData) => {
  try {
    const response = await axios.post("http://localhost:5000/api/user/loans", loanData);
    const newLoan = response.data.loan;
    setLoans((prev) => [newLoan, ...prev]); // Update state with the new loan
    toast.success("Loan added successfully");
  } catch (error) {
    console.error("Error creating loan:", error);
    toast.error("Failed to add loan");
  }
};

const updateLoan = async (id, updatedData) => {
  try {
    const response = await axios.put(`http://localhost:5000/api/user/loans/${id}`, updatedData);
    setLoans((prevLoans) =>
      prevLoans.map((loan) => (loan._id === id ? response.data.loan : loan))
    );