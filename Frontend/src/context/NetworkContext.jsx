import { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { toast } from 'react-toastify';

export const NetworkContext = createContext();

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};

export const NetworkProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean'
      ? navigator.onLine
      : true
  );
  const [isServerReachable, setIsServerReachable] = useState(true);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [activeRequests, setActiveRequests] = useState(0);
  const [lastErrorTime, setLastErrorTime] = useState(null);
  const [retryCountdown, setRetryCountdown] = useState(0);

  const isReconnectingRef = useRef(false);
  const countdownTimerRef = useRef(null);

  // Increment / Decrement active HTTP requests for the top loader
  const startRequest = useCallback(() => {
    setActiveRequests((prev) => prev + 1);
  }, []);

  const endRequest = useCallback(() => {
    setActiveRequests((prev) => Math.max(0, prev - 1));
  }, []);

  // Report a network / server connectivity failure
  const reportNetworkError = useCallback(() => {
    setIsServerReachable(false);
    setLastErrorTime(Date.now());
  }, []);

  // Report server recovery
  const reportServerRecovery = useCallback(() => {
    setIsServerReachable(true);
    setRetryCountdown(0);
  }, []);

  // Active probe to test server health
  const retryConnection = useCallback(async (silent = false) => {
    if (isReconnectingRef.current) return;
    isReconnectingRef.current = true;
    setIsReconnecting(true);

    try {
      const response = await axios.get('http://localhost:5000/api/health', {
        timeout: 4000
      });

      if (response.data?.status === 'ok') {
        setIsServerReachable(true);
        setIsOnline(true);
        setRetryCountdown(0);

        if (!silent) {
          toast.success('Connection restored! Re-syncing data...', {
            toastId: 'net-restored',
            autoClose: 2500
          });
        }

        // Notify DataContext to refresh cached state
        window.dispatchEvent(new CustomEvent('fintrack:network-restored'));
        return true;
      }
    } catch {
      setIsServerReachable(false);
      if (!silent) {
        toast.error('Server still unreachable. Retrying shortly...', {
          toastId: 'net-retry-fail',
          autoClose: 2000
        });
      }
      return false;
    } finally {
      isReconnectingRef.current = false;
      setIsReconnecting(false);
    }
  }, []);

  // Window online/offline event listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.info('Internet connection detected. Checking server...', {
        toastId: 'net-online',
        autoClose: 2000
      });
      retryConnection(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsServerReachable(false);
      toast.warn('You are currently offline. Check your internet connection.', {
        toastId: 'net-offline',
        autoClose: 4000
      });
    };

    const handleReqStart = () => startRequest();
    const handleReqEnd = () => endRequest();
    const handleNetError = (e) => reportNetworkError(e.detail?.message);
    const handleNetOk = () => reportServerRecovery();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('fintrack:request-start', handleReqStart);
    window.addEventListener('fintrack:request-end', handleReqEnd);
    window.addEventListener('fintrack:network-error', handleNetError);
    window.addEventListener('fintrack:network-ok', handleNetOk);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('fintrack:request-start', handleReqStart);
      window.removeEventListener('fintrack:request-end', handleReqEnd);
      window.removeEventListener('fintrack:network-error', handleNetError);
      window.removeEventListener('fintrack:network-ok', handleNetOk);
    };
  }, [retryConnection, startRequest, endRequest, reportNetworkError, reportServerRecovery]);

  // Periodic auto-retry when server is unreachable or offline
  useEffect(() => {
    if (!isServerReachable || !isOnline) {
      setRetryCountdown(6);

      countdownTimerRef.current = setInterval(() => {
        setRetryCountdown((prev) => {
          if (prev <= 1) {
            retryConnection(true);
            return 6;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setRetryCountdown(0);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    }

    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [isServerReachable, isOnline, retryConnection]);

  const hasNetworkError = !isOnline || !isServerReachable;

  return (
    <NetworkContext.Provider
      value={{
        isOnline,
        isServerReachable,
        hasNetworkError,
        isReconnecting,
        activeRequests,
        lastErrorTime,
        retryCountdown,
        startRequest,
        endRequest,
        reportNetworkError,
        reportServerRecovery,
        retryConnection
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};

NetworkProvider.propTypes = {
  children: PropTypes.node.isRequired
};
