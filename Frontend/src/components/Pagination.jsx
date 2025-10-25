import { FiChevronLeft } from "react-icons/fi";
import PropTypes from 'prop-types';

const Pagination = ({ totalRows, rowsPerPage, currentPage, setCurrentPage }) => {
  const totalPages = Math.ceil(totalRows / rowsPerPage);

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage( currentPage + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 text-[13px] border-t">
      <div>
        Showing {Math.min((currentPage - 1) * rowsPerPage + 1, totalRows)} -{" "}
        {Math.min(currentPage * rowsPerPage, totalRows)} of {totalRows} entries
      </div>
      <div className="flex items-center gap-4">
        <div>
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex gap-2">
          <button
            className="p-2 border rounded-lg"
            onClick={handlePrev}
            disabled={currentPage === 1}
          >
            <FiChevronLeft />
          </button>
          <button
            className="p-2 border rounded-lg"
            onClick={handleNext}
            disabled={currentPage === totalPages}
          >
            <FiChevronLeft className="rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
};
Pagination.propTypes = {
  totalRows: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  currentPage: PropTypes.number.isRequired,
  setCurrentPage: PropTypes.func.isRequired,
};

export default Pagination;