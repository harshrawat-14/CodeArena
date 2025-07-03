import React from 'react';

const ErrorPage = ({ error, onRetry }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-purple-900">
      <div className="relative">
        {/* Animated Background */}
        <div className="fixed inset-0 aurora-bg opacity-20"></div>
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900/50 via-purple-900/30 to-slate-900/50"></div>
        
        {/* Error Content */}
        <div className="relative z-10 text-center text-white max-w-md mx-auto px-4">
          {/* Error Icon */}
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-red-400 mb-2">Oops! Something went wrong</h1>
            <p className="text-slate-300 mb-6">
              We encountered an unexpected error. Don't worry, we're here to help!
            </p>
          </div>
          
          {/* Error Details */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
              <p className="text-red-300 text-sm font-mono text-left">
                {error.message || error.toString()}
              </p>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="space-y-4">
            {onRetry && (
              <button 
                onClick={onRetry}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-300 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Again
              </button>
            )}
            
            <button 
              onClick={() => window.location.reload()} 
              className="w-full px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors duration-300 flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Page
            </button>
            
            <button 
              onClick={() => window.location.href = '/'} 
              className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors duration-300 flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Go Home
            </button>
          </div>
          
          {/* Support Information */}
          <div className="mt-8 pt-6 border-t border-slate-700">
            <p className="text-slate-400 text-sm mb-2">
              Still having trouble? Get in touch with our support team.
            </p>
            <div className="flex items-center justify-center space-x-4 text-xs text-slate-500">
              <span>support@codejudge.com</span>
              <span>•</span>
              <span>Error ID: {Date.now()}</span>
            </div>
          </div>
        </div>
        
        {/* Floating Error Elements */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-red-400/30 rounded-full animate-float"></div>
          <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-orange-400/30 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-yellow-400/30 rounded-full animate-float" style={{animationDelay: '4s'}}></div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
