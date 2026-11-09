import { useNetwork } from '../../context/NetworkContext';

const GlobalNetworkLoader = () => {
  const { activeRequests, isReconnecting } = useNetwork();
  const isLoading = activeRequests > 0 || isReconnecting;

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-9999 pointer-events-none">
      {/* Animated Top Progress Bar */}
      <div className="h-[3px] w-full bg-blue-100 overflow-hidden relative">
        <div 
          className="h-full bg-blue-600 rounded-full animate-indeterminate"
          style={{
            boxShadow: '0 0 10px rgba(37, 99, 235, 0.7), 0 0 5px rgba(37, 99, 235, 0.4)'
          }}
        />
      </div>

      <style>{`
        @keyframes indeterminate {
          0% {
            transform: translateX(-100%) scaleX(0.2);
          }
          50% {
            transform: translateX(0%) scaleX(0.6);
          }
          100% {
            transform: translateX(100%) scaleX(0.2);
          }
        }
        .animate-indeterminate {
          animation: indeterminate 1.4s infinite cubic-bezier(0.65, 0.815, 0.735, 0.395);
          width: 100%;
          transform-origin: 0% 50%;
        }
      `}</style>
    </div>
  );
};

export default GlobalNetworkLoader;

