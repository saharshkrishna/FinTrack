import { FiChevronLeft, FiUpload, FiDownload } from 'react-icons/fi';

const Header = () => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
      {/* Title Section */}
      <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
        <button className="p-2">
          <FiChevronLeft className="text-xl" />
        </button>
        <h1 className="text-lg sm:text-[20px] font-semibold truncate">January Expenses</h1>
      </div>
      
      {/* Action Buttons */}
      <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
        <button className="flex items-center gap-1 sm:gap-2 text-blue-600 text-sm sm:text-base whitespace-nowrap">
          <FiUpload className="shrink-0" />
          <span className="hidden sm:inline">Add Bulk Entries</span>
          <span className="sm:hidden">Bulk</span>
        </button>
        <button className="flex items-center gap-1 sm:gap-2 text-blue-600 text-sm sm:text-base whitespace-nowrap">
          <FiDownload className="shrink-0" />
          <span>Reports</span>
        </button>
      </div>
    </div>
  )
}

export default Header
