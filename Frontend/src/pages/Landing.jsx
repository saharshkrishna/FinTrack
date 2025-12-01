import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Users, DollarSign, ShoppingCart, ArrowUp, ArrowDown } from 'lucide-react';
import { DataContext } from '../context/DataContext';

export default function Landing() {
  const navigate = useNavigate();
  const { transactions } = useContext(DataContext);

  // Check if user is authenticated (check for token or user session)
  const isLoggedIn = !!localStorage.getItem('token');

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Navbar Component
  const Navbar = () => (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          FinTrack
        </div>
        <div className="flex gap-4">
          {!isLoggedIn ? (
            <>
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2 text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/expense-book')}
                className="px-6 py-2 text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
              >
                Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );

  // Landing Page (when not logged in)
  const LandingPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <Navbar />
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Smart Financial Management
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Track expenses, manage budgets, and gain valuable insights into your financial data.
              Make informed decisions with FinTrack's powerful analytics.
            </p>
            <button
              onClick={() => navigate('/signup')}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all"
            >
              Get Started Free
            </button>
          </div>
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            {[
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: "Track Expenses",
                description: "Monitor all your expenses in one place with detailed categorization and filtering options."
              },
              {
                icon: <DollarSign className="w-8 h-8" />,
                title: "Budget Management",
                description: "Set budgets, track spending, and receive alerts when approaching your limits."
              },
              {
                icon: <BarChart className="w-8 h-8" />,
                title: "Analytics & Reports",
                description: "Get insights with charts, graphs, and detailed reports of your financial activity."
              }
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Dashboard (when logged in)
  const Dashboard = () => {
    // Calculate stats from actual transactions
    const totalExpenses = transactions.reduce((sum, t) => {
      return t.type === 'expense' ? sum + (t.amount || 0) : sum;
    }, 0);

    const totalIncome = transactions.reduce((sum, t) => {
      return t.type === 'income' ? sum + (t.amount || 0) : sum;
    }, 0);

    const netBalance = totalIncome - totalExpenses;
    const transactionCount = transactions.length;

    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-24 pb-12 px-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold mb-8 text-gray-800">Financial Overview</h1>
            
            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              {[
                {
                  label: "Total Income",
                  value: `₹${totalIncome.toLocaleString()}`,
                  change: "+12.5%",
                  icon: <DollarSign />,
                  positive: true
                },
                {
                  label: "Total Expenses",
                  value: `₹${totalExpenses.toLocaleString()}`,
                  change: "+8.2%",
                  icon: <ShoppingCart />,
                  positive: false
                },
                {
                  label: "Net Balance",
                  value: `₹${netBalance.toLocaleString()}`,
                  change: netBalance >= 0 ? "+5.3%" : "-3.1%",
                  icon: <TrendingUp />,
                  positive: netBalance >= 0
                },
                {
                  label: "Total Transactions",
                  value: transactionCount,
                  change: "+15.3%",
                  icon: <Users />,
                  positive: true
                }
              ].map((stat, idx) => (
                <div key={idx} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                      {stat.icon}
                    </div>
                    <div className={`flex items-center gap-1 text-sm font-semibold ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.positive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                      {stat.change}
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Info Section */}
            <div className="bg-white p-8 rounded-xl shadow-md">
              <h3 className="text-lg font-bold mb-4 text-gray-800">Quick Summary</h3>
              <p className="text-gray-600 mb-4">
                You have {transactionCount} total transactions. Visit the dashboard to manage and track all your expenses.
              </p>
              <button
                onClick={() => navigate('/expense-book')}
                className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
      {isLoggedIn ? <Dashboard /> : <LandingPage />}
    </>
  );
}

// Import BarChart icon
function BarChart(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="2" x2="12" y2="22"></line>
      <path d="M17 8h4a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-4"></path>
      <path d="M3 8h4a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H3"></path>
    </svg>
  );
}
