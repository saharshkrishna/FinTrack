import { useNetwork } from '../../context/NetworkContext';
import { FiWifiOff, FiRefreshCw, FiAlertTriangle } from 'react-icons/fi';

const NetworkStatusBar = () => {
  const { 
    isOnline, 
    hasNetworkError, 
    isReconnecting, 
    retryCountdown, 
    retryConnection 
  } = useNetwork();

  if (!hasNetworkError) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white shadow-md animate-slideDown">
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-medium">
        <div className="flex items-center gap-2.5">
          <div className="p-1 bg-amber-600 rounded">
            {isOnline ? (
              <FiAlertTriangle className="text-sm shrink-0" />
            ) : (
              <FiWifiOff className="text-sm shrink-0" />
            )}
          </div>
          <div>
            <span className="font-bold uppercase tracking-wider mr-1.5 bg-amber-700/60 px-1.5 py-0.5 rounded text-[10px]">
              {!isOnline ? 'Offline' : 'Server Unreachable'}
            </span>
            <span>
              {!isOnline
                ? 'Your device is offline. Check your internet connection.'
                : 'Unable to reach FinTrack API. Operations will pause until reconnected.'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {retryCountdown > 0 && !isReconnecting && (
            <span className="text-[11px] opacity-90 font-mono">
              Auto-retry in {retryCountdown}s
            </span>
          )}

          <button
            onClick={() => retryConnection(false)}
            disabled={isReconnecting}
            className="flex items-center gap-1.5 px-3 py-1 bg-amber-700 hover:bg-amber-800 active:scale-95 text-white font-semibold rounded-md transition-all shadow-xs cursor-pointer disabled:opacity-60"
          >
            <FiRefreshCw className={`text-xs ${isReconnecting ? 'animate-spin' : ''}`} />
            <span>{isReconnecting ? 'Testing Connection...' : 'Retry Now'}</span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slideDown {
          animation: slideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default NetworkStatusBar;

