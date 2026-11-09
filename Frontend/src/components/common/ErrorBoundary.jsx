import { Component } from 'react';
import PropTypes from 'prop-types';
import { FiAlertTriangle, FiRefreshCw, FiHome } from 'react-icons/fi';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled React Render Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-800">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-8 shadow-xl text-center">
            <div className="w-16 h-16 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FiAlertTriangle className="text-3xl" />
            </div>

            <h1 className="text-lg font-bold text-slate-900 mb-2">
              Something unexpected happened
            </h1>

            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              An error occurred while rendering this view. Your data is safe. You can reload the page or return home to continue.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 mb-6">
              <button
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto px-5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold rounded-lg shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FiRefreshCw className="text-xs" />
                <span>Reload Application</span>
              </button>

              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto px-4 py-2 border border-slate-300 hover:bg-slate-50 active:scale-95 text-slate-700 text-xs font-semibold rounded-lg transition-all cursor-pointer"
              >
                Try Again
              </button>

              <button
                onClick={() => {
                  this.handleReset();
                  window.location.href = '/';
                }}
                className="w-full sm:w-auto px-4 py-2 border border-slate-300 hover:bg-slate-50 active:scale-95 text-slate-700 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FiHome className="text-xs" />
                <span>Home</span>
              </button>
            </div>

            {/* Collapsible Error Debug Details */}
            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <div className="text-left mt-4 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => this.setState({ showDetails: !this.state.showDetails })}
                  className="text-[11px] text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                >
                  {this.state.showDetails ? 'Hide technical details' : 'Show technical details'}
                </button>

                {this.state.showDetails && (
                  <pre className="mt-2 p-3 bg-slate-900 text-rose-300 rounded-lg text-[10px] overflow-x-auto font-mono max-h-48 whitespace-pre-wrap">
                    {this.state.error?.toString()}
                    {'\n\nComponent Stack:\n'}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired
};

export default ErrorBoundary;

