import React from 'react';

const LoadingPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-purple-900">
      <div className="relative">
        {/* Animated Background */}
        <div className="fixed inset-0 aurora-bg opacity-20"></div>
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900/50 via-purple-900/30 to-slate-900/50"></div>
        
        {/* Loading Content */}
        <div className="relative z-10 text-center text-white">
          <div className="mb-8">
            <h1 className="text-4xl font-bold gradient-text mb-4">CodeJudge</h1>
            <p className="text-slate-300">Loading your coding environment...</p>
          </div>
          
          {/* Enhanced Loading Animation */}
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
          
          {/* Loading Spinner */}
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-600 border-t-blue-400 mx-auto"></div>
            <div className="absolute inset-0 animate-pulse">
              <div className="w-16 h-16 border-4 border-transparent border-t-purple-400 rounded-full mx-auto animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
            </div>
          </div>
          
          {/* Loading Text Animation */}
          <div className="mt-6">
            <div className="text-sm text-slate-400 animate-pulse">
              Initializing authentication...
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400/40 rounded-full animate-float"></div>
          <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-purple-400/40 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-pink-400/40 rounded-full animate-float" style={{animationDelay: '4s'}}></div>
          <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-cyan-400/40 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-indigo-400/40 rounded-full animate-float" style={{animationDelay: '3s'}}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingPage;
