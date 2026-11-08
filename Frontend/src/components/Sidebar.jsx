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
  FiLayers,
  FiHome
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

  const currentBusinessName = activeBusiness?.name || (user?.name ? `${user.name}'s Business` : 'Default Ledger');
  const businessIdentifier = activeBusiness?.businessId || activeBusiness?._id || user?.businessId;
  const userInitial = (user?.name?.charAt(0) || 'U').toUpperCase();

  const isCurrentPage = (path) => {
    if (path === '/' && (location.pathname === '/' || location.pathname === '/landing')) return true;
    if (path === '/expense-book' && location.pathname === '/expense-book') return true;
    if (path === '/financial-overview' && (location.pathname === '/financial-overview' || location.pathname === '/overview')) return true;
    return location.pathname === path;
  };

  return (
    <>
      {/* Floating Toggle Button (visible when sidebar is collapsed) */}
      {isCollapsed && (
        <button
          onClick={toggleSidebar}
          className="fixed left-4 top-4 z-50 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 p-2.5 rounded-xl shadow-md transition-all duration-200 active:scale-95 cursor-pointer flex items-center justify-center"
          aria-label="Open sidebar"
          title="Open Menu"
        >
          <FiMenu className="text-xl" />
        </button>
      )}

      {/* Main Monochrome Minimalist Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-white text-slate-900 flex flex-col justify-between transition-all duration-300 ease-in-out z-40 border-r border-slate-200/90 shadow-xs ${
          isCollapsed ? '-translate-x-full' : 'w-64 translate-x-0'
        }`}
      >
        {/* Top & Navigation Section */}
        <div className="flex flex-col flex-1 overflow-y-auto p-4 custom-scrollbar">
          {/* Header Branding */}
          <div className="flex items-center justify-between pb-4 pt-1 px-1 border-b border-slate-100">
            <div 
              onClick={() => navigate('/')} 
              className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity"
              title="FinTrack Home"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-white shadow-2xs">
                <FiLayers className="text-base text-blue-500" />
              </div>
              <div>
                <h1 className="font-bold text-sm tracking-tight text-slate-950 leading-tight">
                  FinTrack
                </h1>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  Platform
                </span>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={toggleSidebar}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer md:hidden"
              aria-label="Close sidebar"
            >
              <FiX className="text-lg" />
            </button>
          </div>

          {/* Unified Business Selector & Switcher */}
          <div className="mt-4 mb-5 relative" ref={dropdownRef}>
            <div className="flex items-center justify-between mb-1.5 px-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Active Ledger
              </span>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="text-[11px] text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors cursor-pointer"
                title="Create New Business Ledger"
              >
                <FiPlus className="text-xs" />
                <span>New</span>
              </button>
            </div>

            {/* Active Business Trigger Card */}
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-slate-50 hover:bg-slate-100/80 p-2.5 rounded-xl border border-slate-200 transition-all text-left flex items-center justify-between group shadow-2xs cursor-pointer"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200/60 text-blue-600 flex items-center justify-center shrink-0">
                  <FiBriefcase className="text-xs" />
                </div>
                <div className="overflow-hidden">
                  <div className="font-semibold text-xs text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                    {currentBusinessName}
                  </div>
                  {businessIdentifier && (
                    <div className="text-[10px] font-mono text-slate-500 truncate">
                      {businessIdentifier}
                    </div>
                  )}
                </div>
              </div>
              <FiChevronDown
                className={`text-slate-400 group-hover:text-slate-600 transition-transform duration-200 shrink-0 ml-1.5 text-xs ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Business Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50 animate-fade-in">
                <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Ledgers ({businesses?.length || 1})
                  </span>
                  {activeBusiness?.currency && (
                    <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded border border-blue-200">
                      {activeBusiness.currency}
                    </span>
                  )}
                </div>

                <div className="max-h-52 overflow-y-auto divide-y divide-slate-100 py-1">
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
                          className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs transition-colors cursor-pointer ${
                            isCurrent
                              ? 'bg-blue-50/70 text-blue-700 font-semibold'
                              : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950'
                          }`}
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <FiBriefcase className={`shrink-0 text-xs ${isCurrent ? 'text-blue-600' : 'text-slate-400'}`} />
                            <div className="truncate">
                              <div className="truncate text-xs">{biz.name}</div>
                              {biz.businessId && (
                                <div className="text-[10px] text-slate-400 font-mono">{biz.businessId}</div>
                              )}
                            </div>
                          </div>
                          {isCurrent && <FiCheck className="text-blue-600 text-xs shrink-0 ml-1.5" />}
                        </button>
                      );
                    })
                  ) : (
                    <div className="p-3 text-xs text-slate-400 text-center">No ledgers found</div>
                  )}
                </div>

                <div className="p-2 border-t border-slate-100 bg-slate-50/50">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setIsAddModalOpen(true);
                    }}
                    className="w-full text-left px-2.5 py-1.5 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50/50 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer font-medium"
                  >
                    <FiPlus className="text-xs" />
                    <span>Create new ledger</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Menu */}
          <div className="space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-1 mb-2 block">
              Workspace
            </span>

            {/* Frontpage / Landing Link */}
            <button
              onClick={() => navigate('/')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                isCurrentPage('/')
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
              }`}
            >
              <FiHome className={`text-sm shrink-0 ${isCurrentPage('/') ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>Overview & Home</span>
            </button>

            {/* Expense Book Link */}
            <button
              onClick={() => navigate('/expense-book')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                isCurrentPage('/expense-book')
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
              }`}
            >
              <FiBookOpen className={`text-sm shrink-0 ${isCurrentPage('/expense-book') ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>Expense Book</span>
            </button>

            {/* Overview / Analytics Button */}
            <button
              onClick={() => navigate('/financial-overview')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                isCurrentPage('/financial-overview')
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
              }`}
            >
              <FiPieChart className={`text-sm shrink-0 ${isCurrentPage('/financial-overview') ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>Financial Overview</span>
            </button>
          </div>
        </div>

        {/* User Profile & Auth Section (Bottom) */}
        <div className="p-3 border-t border-slate-150 bg-slate-50/50">
          {user ? (
            <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-7 h-7 rounded-lg bg-slate-950 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {userInitial}
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-semibold text-slate-900 truncate">
                    {user.name || 'User'}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {user.email || 'user@fintrack.local'}
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0 ml-1"
                title="Logout"
                aria-label="Logout"
              >
                <FiLogOut className="text-sm" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-all shadow-xs cursor-pointer"
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
          className="fixed inset-0 bg-slate-950/20 backdrop-blur-2xs z-30 md:hidden transition-opacity"
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
