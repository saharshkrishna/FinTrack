import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiBook, FiSettings, FiMenu, FiX, FiLogOut, FiLogIn } from 'react-icons/fi';
import { useSidebar } from '../context/SidebarContext';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
  const { isCollapsed, toggleSidebar } = useSidebar();
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentBusiness = user?.businesses?.[0];
  const currentBusinessName = currentBusiness?.name || (user ? `${user.name}'s Business` : 'Default Business');
  const businessIdentifier = currentBusiness?.businessId || currentBusiness?._id || user?.businessId;

  return (
    <>
      {/* Toggle button - visible when collapsed */}
      {isCollapsed && (
        <button
          onClick={toggleSidebar}
          className="fixed left-4 top-4 z-50 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors"
          aria-label="Open sidebar"
        >
          <FiMenu />
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-gray-900 text-white p-4 flex flex-col justify-between transition-all duration-300 z-40 ${
          isCollapsed ? '-translate-x-full' : 'w-64 translate-x-0'
        }`}
      >
        <div>
          {/* Close button */}
          <button
            onClick={toggleSidebar}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            aria-label="Close sidebar"
          >
            <FiX />
          </button>

          <button className="w-full bg-blue-600 text-white p-3 rounded-lg flex items-center justify-center gap-2 mb-6 mt-8 hover:bg-blue-700 transition-colors">
            <FiPlus />
            Add New Business
          </button>

          <div className="bg-blue-600 p-4 rounded-lg mb-4">
            <div className="flex items-center gap-3 mb-2">
              <FiBook className="text-xl shrink-0" />
              <span className="font-medium truncate">{currentBusinessName}</span>
            </div>
            <div className="text-sm text-blue-200 truncate">
              {user ? `User: ${user.name}` : 'Not logged in'}
            </div>
            {user && businessIdentifier && (
              <div className="text-xs text-blue-100 mt-1 truncate bg-blue-700/60 px-2 py-0.5 rounded">
                ID: {businessIdentifier}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-800 rounded-lg transition-colors">
              <FiBook />
              Cashbooks
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-800 rounded-lg transition-colors">
              <FiSettings />
              Business Settings
            </button>
          </div>
        </div>

        {/* Auth section at bottom of sidebar */}
        <div className="pt-4 border-t border-gray-800">
          {user ? (
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-gray-800 hover:text-red-300 rounded-lg transition-colors"
            >
              <FiLogOut />
              Logout ({user.name.split(' ')[0]})
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="w-full flex items-center gap-3 px-4 py-2 text-blue-400 hover:bg-gray-800 hover:text-blue-300 rounded-lg transition-colors"
            >
              <FiLogIn />
              Sign In / Register
            </button>
          )}
        </div>
      </div>

      {/* Overlay - visible when sidebar is open */}
      {!isCollapsed && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default Sidebar;
