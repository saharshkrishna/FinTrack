import { useContext } from 'react';
import PropTypes from 'prop-types';
import { FiChevronLeft, FiUpload, FiDownload } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';

const Header = ({ onOpenBulkImport, onOpenReport }) => {
  const { activeBusiness } = useContext(AuthContext);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
      {/* Title Section */}
      <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
        <button className="p-2">
          <FiChevronLeft className="text-xl" />
        </button>
        <div className="flex items-center gap-2 truncate">
          <h1 className="text-lg sm:text-[20px] font-semibold truncate">
            {activeBusiness?.name || 'January Expenses'}
          </h1>
          {activeBusiness?.businessId && (
            <span className="hidden sm:inline-block text-[11px] font-mono font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-200">
              {activeBusiness.businessId}
            </span>
          )}
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
        <button 
          onClick={onOpenBulkImport}
          className="flex items-center gap-1 sm:gap-2 text-blue-600 hover:text-blue-700 active:scale-95 text-sm sm:text-base font-medium whitespace-nowrap transition-all cursor-pointer"
        >
          <FiUpload className="shrink-0" />
          <span className="hidden sm:inline">Add Bulk Entries</span>
          <span className="sm:hidden">Bulk</span>
        </button>
        <button 
          onClick={onOpenReport}
          className="flex items-center gap-1 sm:gap-2 text-blue-600 hover:text-blue-700 text-sm sm:text-base whitespace-nowrap transition-colors cursor-pointer">
          <FiDownload className="shrink-0" />
          <span>Reports</span>
        </button>
      </div>
    </div>
  )
}

Header.propTypes = {
  onOpenBulkImport: PropTypes.func,
  onOpenReport: PropTypes.func,
};

export default Header

