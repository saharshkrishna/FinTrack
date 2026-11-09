import PropTypes from 'prop-types';
import { FiWifiOff, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import { useNetwork } from '../../context/NetworkContext';

const NetworkErrorCard = ({ title, message, onRetry }) => {
  const { isReconnecting, retryConnection, isOnline } = useNetwork();

  const handleRetry = async () => {
    if (onRetry) {
      await onRetry();
    } else {
      await retryConnection(false);
    }
  };

  return (
    <div className="bg-white border border-amber-200 rounded-2xl p-8 max-w-xl mx-auto my-8 shadow-xs text-center animate-fadeIn">
      <div className="w-14 h-14 bg-amber-50 text-amber-600 border border-amber-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
        {isOnline ? (
          <FiAlertCircle className="text-2xl" />
        ) : (
          <FiWifiOff className="text-2xl" />
        )}
      </div>

      <h3 className="text-base font-bold text-slate-900 mb-2">
        {title || 'Unable to Connect to FinTrack Server'}
      </h3>

      <p className="text-xs text-slate-600 mb-6 leading-relaxed max-w-md mx-auto">
        {message ||
          'We could not reach the financial database. This may happen if your internet connection dropped, or if the backend server is temporarily starting up.'}
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={handleRetry}
          disabled={isReconnecting}
          className="w-full sm:w-auto px-5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold rounded-lg shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
        >
          <FiRefreshCw className={`text-xs ${isReconnecting ? 'animate-spin' : ''}`} />
          <span>{isReconnecting ? 'Testing Connection...' : 'Retry Connection'}</span>
        </button>

        <button
          onClick={() => window.location.reload()}
          className="w-full sm:w-auto px-4 py-2 border border-slate-300 hover:bg-slate-50 active:scale-95 text-slate-700 text-xs font-semibold rounded-lg transition-all cursor-pointer"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
};

NetworkErrorCard.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
  onRetry: PropTypes.func
};

export default NetworkErrorCard;

