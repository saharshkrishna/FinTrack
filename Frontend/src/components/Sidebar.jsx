import { useState } from 'react';
import { FiPlus, FiBook, FiSettings, FiMenu, FiX } from 'react-icons/fi';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

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
        className={`fixed left-0 top-0 h-full bg-gray-900 text-white p-4 transition-all duration-300 z-40 ${
          isCollapsed ? '-translate-x-full' : 'w-64 translate-x-0'
        }`}
      >
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
            <FiBook className="text-xl" />
            <span className="font-medium">Wood</span>
          </div>
          <div className="text-sm text-blue-200">Role: Owner • 2 books</div>
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
