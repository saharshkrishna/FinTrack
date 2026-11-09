import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import { SidebarProvider } from './context/SidebarContext';
import { NetworkProvider } from "./context/NetworkContext";
import ErrorBoundary from "./components/common/ErrorBoundary";
import Filters from "./components/Filters";
import SearchAndActions from "./components/SearchAndActnbtn";
import Summary from "./components/Summary";
import Pagination from "./components/Pagination";
import Table from "./components/Table";
import ExpenseBook from "./pages/ExpenseBook";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Landing from "./pages/Landing";
import FinancialOverview from "./pages/FinancialOverview";
import BusinessSettings from "./pages/BusinessSettings";
import Layout from "./Layout";
import CashinModal from "./components/modal/CashinModal";
import CashoutModal from "./components/modal/CashoutModal";
import EntryDetails from "./components/modal/EntryDetails";
import DebitModal from "./components/modal/DebitModal";
import CreditModal from "./components/modal/CreditModal";
import LoanEntryDetails from "./components/modal/LoanEntryDetails";

function App() {
  const [tableData, setTableData] = useState([]);

  const addEntry = (entry) => {
    setTableData((prevData) => [...prevData, entry]);
  };

  const updateEntry = (updatedEntry) => {
    setTableData((prevData) =>
      prevData.map((entry) =>
        (entry._id && entry._id === updatedEntry._id) || (entry.id && entry.id === updatedEntry.id)
          ? updatedEntry
          : entry
      )
    );
  };

  return (
    <ErrorBoundary>
      <NetworkProvider>
        <AuthProvider>
          <DataProvider>
            <SidebarProvider>
              <Router>
                <Routes>
                  {/* Standalone Auth & Frontpage (Landing) */}
                  <Route path="/" element={<Landing />} />
                  <Route path="/landing" element={<Landing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />

                  {/* Main Application Pages */}
                  <Route
                    path="/*"
                    element={
                      <Layout>
                        <Routes>
                          <Route
                            path="/"
                            element={
                              <ExpenseBook
                                tableData={tableData}
                                addEntry={addEntry}
                                updateEntry={updateEntry}
                              />
                            }
                          />
                          <Route
                            path="/expense-book"
                            element={
                              <ExpenseBook
                                tableData={tableData}
                                addEntry={addEntry}
                                updateEntry={updateEntry}
                              />
                            }
                          />
                          <Route path="/financial-overview" element={<FinancialOverview />} />
                          <Route path="/overview" element={<FinancialOverview />} />
                          <Route path="/settings" element={<BusinessSettings />} />
                          <Route path="/business-settings" element={<BusinessSettings />} />
                          <Route path="/filters" element={<Filters onFilterChange={() => {}} />} />
                          <Route
                            path="/search-and-actions"
                            element={<SearchAndActions addEntry={addEntry} onSearch={() => {}} />}
                          />
                          <Route path="/summary" element={<Summary />} />
                          <Route
                            path="/pagination"
                            element={
                              <Pagination
                                totalRows={0}
                                rowsPerPage={25}
                                currentPage={1}
                                setCurrentPage={() => {}}
                              />
                            }
                          />
                          <Route
                            path="/table"
                            element={
                              <Table
                                tableData={tableData}
                                updateEntry={updateEntry}
                                onDeleteSelected={() => {}}
                              />
                            }
                          />
                          <Route
                            path="/cashin"
                            element={
                              <CashinModal
                                onClose={() => console.log("Close Cash In Modal")}
                                type="Cash In"
                                onSubmit={addEntry}
                              />
                            }
                          />
                          <Route
                            path="/cashout"
                            element={
                              <CashoutModal
                                onClose={() => console.log("Close Cash Out Modal")}
                                type="Cash Out"
                                onSubmit={addEntry}
                              />
                            }
                          />
                          <Route
                            path="/debit"
                            element={
                              <DebitModal
                                onClose={() => console.log("Close Debit Modal")}
                                type="Debit"
                                onSubmit={addEntry}
                              />
                            }
                          />
                          <Route
                            path="/credit"
                            element={
                              <CreditModal
                                onClose={() => console.log("Close Credit Modal")}
                                type="Credit"
                                onSubmit={addEntry}
                              />
                            }
                          />
                          <Route
                            path="/entrydetails"
                            element={
                              <EntryDetails
                                isOpen={true}
                                onClose={() => console.log("Close Entry Details Modal")}
                                title="Entry Details"
                                entry={null}
                                onEdit={(entry) => console.log("Edit Entry:", entry)}
                                updateEntry={updateEntry}
                              />
                            }
                          />
                          <Route
                            path="/loan-entrydetails"
                            element={
                              <LoanEntryDetails
                                isOpen={true}
                                onClose={() => console.log("close loan modal")}
                                entry={null}
                                onEdit={updateEntry}
                              />
                            }
                          />
                        </Routes>
                      </Layout>
                    }
                  />
                </Routes>
              </Router>
            </SidebarProvider>
          </DataProvider>
        </AuthProvider>
      </NetworkProvider>
    </ErrorBoundary>
  );
}

export default App;
