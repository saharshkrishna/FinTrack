import PropTypes from 'prop-types';
import Sidebar from './components/Sidebar'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSidebar } from './context/SidebarContext';

const Layout = ({children}) => {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar></Sidebar>
      <div className={`p-6 transition-all duration-300 ${
        isCollapsed ? 'ml-0' : 'ml-64'
      }`}>
        {children}
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </div>
  )
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout
