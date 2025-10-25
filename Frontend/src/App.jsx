import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { DataProvider } from "./context/DataContext";
import Filters from "./components/Filters";
import SearchAndActions from "./components/SearchAndActnbtn";
import Summary from "./components/Summary";
import Pagination from "./components/Pagination";
import Table from "./components/Table";
import ExpenseBook from "./pages/ExpenseBook";
import Layout from "./Layout";
import CashinModal from "./components/modal/CashinModal";
import CashoutModal from "./components/modal/CashoutModal";
import EntryDetails from "./components/modal/EntryDetails";
import DebitModal from "./components/modal/DebitModal";
import CreditModal from "./components/modal/CreditModal";
import LoanEntryDetails from "./components/modal/LoanEntryDetails";


function App() {
  const [tableData, setTableData] = useState([]); // State to hold table data

  // Function to add a new entry to the table
  const addEntry = (entry) => {
    setTableData((prevData) => [...prevData, entry]);
  };

  // Function to update an existing entry
  const updateEntry = (updatedEntry) => {
    setTableData((prevData) =>
      prevData.map((entry) =>
        entry.id === updatedEntry.id ? updatedEntry : entry
      )
    );
  };

  return (
    <DataProvider>
    <Router>
      <div>
        {/* Header component (common for all routes) */}
        <Layout>
          {/* Define your routes */}
          <Routes>
            {/* Default route (e.g., for the dashboard or main page) */}
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

            {/* Route for the Filters component */}
            <Route path="/filters" element={<Filters />} />

            {/* Route for the SearchAndActions component */}
            <Route
              path="/search-and-actions"
              element={<SearchAndActions addEntry={addEntry} />}
            />

            {/* Route for the Summary component */}
            <Route path="/summary" element={<Summary />} />

            {/* Route for the Pagination component */}
            <Route path="/pagination" element={<Pagination />} />

            {/* Route for the Table component */}
            <Route
              path="/table"
              element={
                <Table
                  tableData={tableData}
                  updateEntry={updateEntry}
                />
              }
            />

            {/* Route for the CashinModal component */}
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

            {/* Route for the CashoutModal component */}
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

             {/* Route for the DebitModal component */}
             <Route
              path="/Debit"
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

            {/* Route for the EntryDetails component */}
            <Route
              path="/entrydetails"
              element={
                <EntryDetails
                  isOpen={true} // You can manage this state dynamically
                  onClose={() => console.log("Close Entry Details Modal")}
                  title="Entry Details"
                  entry={null} // Pass the selected entry dynamically
                  onEdit={(entry) => {
                    console.log("Edit Entry:", entry);
                    // Redirect to Cash In or Cash Out modal for editing
                  }}
                  updateEntry={updateEntry}
                />
              }
                />

              <Route
              path="/entrydetails"
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
      </div>
    </Router>
    </DataProvider>
  );
}

export default App;