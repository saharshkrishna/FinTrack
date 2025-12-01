import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, DollarSign, ShoppingCart, ArrowUp, ArrowDown } from 'lucide-react';

export default function BusinessDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  // Mock business data
  const revenueData = [
    { month: 'Jan', revenue: 12000, expenses: 8000 },
    { month: 'Feb', revenue: 15000, expenses: 9000 },
    { month: 'Mar', revenue: 18000, expenses: 10000 },
    { month: 'Apr', revenue: 22000, expenses: 11000 },
    { month: 'May', revenue: 25000, expenses: 12000 },
    { month: 'Jun', revenue: 28000, expenses: 13000 },
  ];

  const productData = [
    { name: 'Product A', value: 35 },
    { name: 'Product B', value: 28 },
    { name: 'Product C', value: 22 },
    { name: 'Product D', value: 15 },
  ];

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b'];

  const handleLogin = () => {
    setIsLoggedIn(true);
    setShowLogin(false);
  };

  const handleSignup = () => {
    setIsLoggedIn(true);
    setShowSignup(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  // Navbar Component
  const Navbar = () => (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          BizMetrics
        </div>
        <div className="flex gap-4">
          {!isLoggedIn ? (
            <>
              <button
                onClick={() => setShowLogin(true)}
                className="px-6 py-2 text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => setShowSignup(true)}
                className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
              >
                Sign Up
              </button>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );

  // Modal Component
  const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-scale-in">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
          {children}
        </div>
      </div>
    );
  };

  // Landing Page
  const LandingPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <Navbar />
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Transform Your Business Analytics
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Powerful insights, beautiful dashboards, and data-driven decisions all in one place. 
              Elevate your business intelligence today.
            </p>
            <button
              onClick={() => setShowSignup(true)}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all"
            >
              Get Started Free
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-20">
            {[
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: "Real-Time Analytics",
                description: "Monitor your business metrics in real-time with intuitive dashboards and live data updates."
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Team Collaboration",
                description: "Share insights with your team and make data-driven decisions together seamlessly."
              },
              {
                icon: <DollarSign className="w-8 h-8" />,
                title: "Revenue Tracking",
                description: "Track revenue, expenses, and profitability with comprehensive financial analytics."
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


  // Dashboard
  const Dashboard = () => (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-gray-800">Business Dashboard</h1>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {[
              { label: "Total Revenue", value: "$28,000", change: "+12.5%", icon: <DollarSign />, positive: true },
              { label: "Total Customers", value: "1,234", change: "+8.2%", icon: <Users />, positive: true },
              { label: "Orders", value: "456", change: "+15.3%", icon: <ShoppingCart />, positive: true },
              { label: "Profit Margin", value: "53.6%", change: "-2.1%", icon: <TrendingUp />, positive: false },
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

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-lg font-bold mb-4 text-gray-800">Revenue vs Expenses</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} />
                  <Line type="monotone" dataKey="expenses" stroke="#ec4899" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-lg font-bold mb-4 text-gray-800">Product Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={productData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {productData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md md:col-span-2">
              <h3 className="text-lg font-bold mb-4 text-gray-800">Monthly Performance</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#6366f1" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="expenses" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>

      {isLoggedIn ? <Dashboard /> : <LandingPage />}

      {/* Login Modal */}
      <Modal isOpen={showLogin} onClose={() => setShowLogin(false)}>
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Welcome Back</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="••••••••"
            />
          </div>
          <button
            onClick={handleLogin}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            Login
          </button>
        </div>
      </Modal>

      {/* Signup Modal */}
      <Modal isOpen={showSignup} onClose={() => setShowSignup(false)}>
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Create Account</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="••••••••"
            />
          </div>
          <button
            onClick={handleSignup}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            Sign Up
          </button>
        </div>
      </Modal>
    </>
  );
}