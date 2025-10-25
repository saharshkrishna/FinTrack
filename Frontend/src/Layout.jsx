import PropTypes from 'prop-types';
import Sidebar from './components/Sidebar'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Layout = ({children}) => {
  return (
    <div className="min-h-screen bg-gray-50">
        <Sidebar></Sidebar>
        <div className='ml-64 p-6'>
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