import { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FiPlus, 
  FiBookOpen, 
  FiPieChart,
  FiMenu, 
  FiX, 
  FiLogOut, 
  FiLogIn, 
  FiChevronDown, 
  FiCheck,
  FiBriefcase,
  FiLayers
} from 'react-icons/fi';
import { useSidebar } from '../context/SidebarContext';
import { AuthContext } from '../context/AuthContext';
import AddBusinessModal from './modal/AddBusinessModal';

const Sidebar = () => {
  const { isCollapsed, toggleSidebar } = useSidebar();
  const { user, activeBusiness, businesses, switchBusiness, logout } = useContext(AuthContext);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentBusinessName = activeBusiness?.name || (user?.name ? `${user.name}'s Business` : 'Default Business');
  const businessIdentifier = activeBusiness?.businessId || activeBusiness?._id || user?.businessId;
  const userInitial = (user?.name?.charAt(0) || 'U').toUpperCase();

  const isCurrentPage = (path) => {
    if (path === '/' && (location.pathname === '/' || location.pathname === '/expense-book')) return true;
    if (path === '/financial-overview' && (location.pathname === '/financial-overview' || location.pathname === '/overview')) return true;
    return location.pathname === path;
  };

  return (
    <>
      {/* Floating Toggle Button (visible when sidebar is collapsed) */}
      {isCollapsed && (
        <button
          onClick={toggleSidebar}
          className="fixed left-4 top-4 z-50 bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl shadow-lg transition-all duration-200 active:scale-95 cursor-pointer flex items-center justify-center"
          aria-label="Open sidebar"
          title="Open Menu"
        >
          <FiMenu className="text-xl" />
        </button>
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-slate-900 text-slate-100 flex flex-col justify-between transition-all duration-300 ease-in-out z-40 border-r border-slate-800 shadow-2xl ${
          isCollapsed ? '-translate-x-full' : 'w-64 translate-x-0'
        }`}
      >
        {/* Top & Navigation Section */}
        <div className="flex flex-col flex-1 overflow-y-auto p-4 custom-scrollbar">
          {/* Header Branding */}
          <div className="flex items-center justify-between pb-4 pt-1 px-1 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <FiLayers className="text-lg" />
              </div>
              <div>
                <h1 className="font-bold text-base tracking-tight text-white leading-tight">
                  FinTrack
                </h1>
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                  Expense Ledger
                </span>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={toggleSidebar}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              aria-label="Close sidebar"
            >
              <FiX className="text-lg" />
            </button>
          </div>

          {/* Unified Business Selector & Switcher */}
          <div className="mt-4 mb-5 relative" ref={dropdownRef}>
            <div className="flex items-center justify-between mb-1.5 px-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Active Ledger
              </span>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="text-[11px] text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition-colors cursor-pointer"
                title="Add New Business"
              >
                <FiPlus className="text-xs" />
                <span>New</span>
              </button>
            </div>

            {/* Active Business Trigger Card */}
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-slate-800/90 hover:bg-slate-800 p-3 rounded-xl border border-slate-700/80 hover:border-slate-600 transition-all text-left flex items-center justify-between group shadow-sm cursor-pointer"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
                  <FiBriefcase className="text-sm" />
                </div>
                <div className="overflow-hidden">
                  <div className="font-semibold text-xs text-white truncate group-hover:text-blue-300 transition-colors">
                    {currentBusinessName}
                  </div>
                  {businessIdentifier && (
                    <div className="text-[10px] font-mono text-slate-400 truncate">
                      {businessIdentifier}
                    </div>
                  )}
                </div>
              </div>
              <FiChevronDown
                className={`text-slate-400 group-hover:text-slate-200 transition-transform duration-200 shrink-0 ml-2 text-sm ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Business Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-slate-700/70 flex items-center justify-between bg-slate-850">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Businesses ({businesses?.length || 1})
                  </span>
                  {activeBusiness?.currency && (
                    <span className="text-[10px] font-mono bg-blue-900/40 text-blue-300 px-1.5 py-0.5 rounded border border-blue-700/50">
                      {activeBusiness.currency}
                    </span>
                  )}
                </div>

                <div className="max-h-52 overflow-y-auto divide-y divide-slate-700/50 py-1">
                  {businesses && businesses.length > 0 ? (
                    businesses.map((biz) => {
                      const isCurrent = (biz._id || biz.id) === (activeBusiness?._id || activeBusiness?.id);
                      return (
                        <button
                          key={biz._id || biz.id || biz.name}
                          onClick={() => {
                            switchBusiness(biz._id || biz.id);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2.5 flex items-center justify-between text-xs transition-colors cursor-pointer ${
                            isCurrent
                              ? 'bg-blue-600/20 text-blue-300 font-semibold'
                              : 'text-slate-300 hover:bg-slate-700/60 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <FiBriefcase className={`shrink-0 text-sm ${isCurrent ? 'text-blue-400' : 'text-slate-400'}`} />
                            <div className="truncate">
                              <div className="truncate">{biz.name}</div>
                              {biz.businessId && (
                                <div className="text-[10px] text-slate-400 font-mono">{biz.businessId}</div>
                              )}
                            </div>
                          </div>
                          {isCurrent && <FiCheck className="text-blue-400 text-sm shrink-0 ml-2" />}
                        </button>
                      );
                    })
                  ) : (
                    <div className="p-3 text-xs text-slate-400 text-center">No businesses found</div>
                  )}
                </div>

                <div className="p-2 border-t border-slate-700/70 bg-slate-850">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setIsAddModalOpen(true);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-blue-400 hover:text-blue-300 hover:bg-slate-700/60 rounded-lg flex items-center gap-2 transition-colors cursor-pointer font-medium"
                  >
                    <FiPlus className="text-sm" />
                    <span>Create new business</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Menu */}
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-1 mb-2 block">
              Workspace
            </span>

            {/* Expense Book Link */}
            <button
              onClick={() => navigate('/')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                isCurrentPage('/')
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <FiBookOpen className="text-base shrink-0" />
              <span>Expense Book</span>
            </button>

            {/* Overview / Analytics Button */}
            <button
              onClick={() => navigate('/financial-overview')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                isCurrentPage('/financial-overview')
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <FiPieChart className="text-base shrink-0" />
              <span>Financial Overview</span>
            </button>
          </div>
        </div>

        {/* User Profile & Auth Section (Bottom) */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/90">
          {user ? (
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-blue-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                  {userInitial}
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-semibold text-white truncate">
                    {user.name || 'User'}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {user.email || 'user@fintrack.local'}
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer shrink-0 ml-1"
                title="Logout"
                aria-label="Logout"
              >
                <FiLogOut className="text-base" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm cursor-pointer"
            >
              <FiLogIn />
              <span>Sign In / Register</span>
            </button>
          )}
        </div>
      </aside>

      {/* Backdrop overlay on mobile when sidebar is open */}
      {!isCollapsed && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-30 md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Add Business Modal */}
      <AddBusinessModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </>
  );
};

export default Sidebar;
