import { FiChevronLeft, FiUpload, FiDownload } from 'react-icons/fi';

const Header = () => {
  return (
    <div className="flex items-center justify-between mb-6">
    <div className="flex items-center gap-4">
      <button className="p-2">
        <FiChevronLeft className="text-xl" />
      </button>
      <h1 className="text-[20px] font-semibold">January Expenses</h1>
    </div>
    <div className="flex items-center gap-4">
      <button className="flex items-center gap-2 text-blue-600">
        <FiUpload />
        Add Bulk Entries
      </button>
      <button className="flex items-center gap-2 text-blue-600">
        <FiDownload />
        Reports
      </button>
    </div>
  </div>
  )
}

export default Header
        