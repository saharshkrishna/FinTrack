import { FiPlus, FiBook, FiSettings } from 'react-icons/fi';


const Sidebar = () => {
  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white p-4">
    <button className="w-full bg-blue-600 text-white p-3 rounded-lg flex items-center justify-center gap-2 mb-6">
      <FiPlus />
      Add New Business
    </button>

    <div className="bg-blue-600 p-4 rounded-lg mb-4">
      <div className="flex items-center gap-3 mb-2">
        <FiBook className="text-xl" />
        <span className="font-medium">Wood</span>
      </div>
      <div className="text-sm text-blue-200">
        Role: Owner • 2 books
      </div>
    </div>

    <div className="space-y-4">
      <button className="w-full flex items-center gap-3 px-4 py-2">
        <FiBook />
        Cashbooks
      </button>
      <button className="w-full flex items-center gap-3 px-4 py-2">
        <FiSettings />
        Business Settings
      </button>
    </div>
  </div>
  )
}

export default Sidebar