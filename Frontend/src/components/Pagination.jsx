import { FiChevronLeft } from "react-icons/fi";
import PropTypes from 'prop-types';

const Pagination = ({ totalRows = 0, rowsPerPage = 25, currentPage = 1, setCurrentPage = () => {} }) => {
  const safeTotalRows = typeof totalRows === 'number' && !isNaN(totalRows) ? totalRows : 0;
  const safeRowsPerPage = typeof rowsPerPage === 'number' && rowsPerPage > 0 ? rowsPerPage : 25;
  const safeCurrentPage = typeof currentPage === 'number' && currentPage > 0 ? currentPage : 1;
  const totalPages = Math.max(1, Math.ceil(safeTotalRows / safeRowsPerPage));

  const handleNext = () => {
    if (safeCurrentPage < totalPages && typeof setCurrentPage === 'function') {
      setCurrentPage(safeCurrentPage + 1);
    }
  };

  const handlePrev = () => {
    if (safeCurrentPage > 1 && typeof setCurrentPage === 'function') {
      setCurrentPage(safeCurrentPage - 1);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 text-[13px] border-t">
      <div>
        Showing {safeTotalRows === 0 ? 0 : Math.min((safeCurrentPage - 1) * safeRowsPerPage + 1, safeTotalRows)} -{" "}
        {Math.min(safeCurrentPage * safeRowsPerPage, safeTotalRows)} of {safeTotalRows} entries
      </div>
      <div className="flex items-center gap-4">
        <div>
          Page {safeCurrentPage} of {totalPages}
        </div>
        <div className="flex gap-2">
          <button
            className="p-2 border rounded-lg"
            onClick={handlePrev}
            disabled={safeCurrentPage === 1}
          >
            <FiChevronLeft />
          </button>
          <button
            className="p-2 border rounded-lg"
            onClick={handleNext}
            disabled={safeCurrentPage === totalPages}
          >
            <FiChevronLeft className="rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
};
Pagination.propTypes = {
  totalRows: PropTypes.number,
  rowsPerPage: PropTypes.number,
  currentPage: PropTypes.number,
  setCurrentPage: PropTypes.func,
};

export default Pagination;