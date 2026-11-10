import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { FiChevronLeft, FiUpload, FiDownload } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';

const Header = ({ onOpenBulkImport, onOpenReport }) => {
  const { activeBusiness } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 gap-3 border-b border-slate-200/80 pb-4">
      {/* Title & Active Ledger Section */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => navigate('/')}
          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer text-slate-500 hover:text-slate-900"
          title="Back to Overview"
          aria-label="Back to Overview"
        >
          <FiChevronLeft className="text-lg" />
        </button>

        <div className="flex items-center gap-2.5 truncate">
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-950 truncate">
            {activeBusiness?.name || 'Expense Book'}
          </h1>
          {activeBusiness?.businessId && (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
              {activeBusiness.businessId}
            </span>
          )}
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex items-center gap-2.5 w-full sm:w-auto">
        <button 
          onClick={onOpenBulkImport}
          className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-950 text-xs font-medium rounded-lg transition-all shadow-2xs cursor-pointer flex items-center gap-1.5 active:scale-95"
          title="Import transactions from Excel spreadsheet"
        >
          <FiUpload className="text-xs text-slate-500" />
          <span>Bulk Import</span>
        </button>

        <button 
          onClick={onOpenReport}
          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-all shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-95"
          title="Export high-resolution PDF statements and analytics"
        >
          <FiDownload className="text-xs" />
          <span>Export Report</span>
        </button>
      </div>
    </div>
  );
};

Header.propTypes = {
  onOpenBulkImport: PropTypes.func,
  onOpenReport: PropTypes.func,
};

export default Header;
