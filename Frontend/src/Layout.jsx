import PropTypes from 'prop-types';
import Sidebar from './components/Sidebar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSidebar } from './context/SidebarContext';
import GlobalNetworkLoader from './components/common/GlobalNetworkLoader';
import NetworkStatusBar from './components/common/NetworkStatusBar';

const Layout = ({ children }) => {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 selection:bg-blue-100 selection:text-blue-900 relative">
      <GlobalNetworkLoader />
      <NetworkStatusBar />
      <Sidebar />
      <div className={`p-4 sm:p-6 transition-all duration-300 ${
        isCollapsed ? 'ml-0' : 'ml-64'
      }`}>
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
