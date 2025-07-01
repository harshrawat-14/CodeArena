import React, { useState } from 'react';

const OutputPanel = ({ output, isLoading }) => {
  const [activeTab, setActiveTab] = useState('output');
  
  const getOutputStatus = () => {
    if (isLoading) return { status: 'running', color: 'text-yellow-500', icon: '⏳' };
    if (!output) return { status: 'waiting', color: 'text-gray-500', icon: '💤' };
    if (output.toLowerCase().includes('error') || output.toLowerCase().includes('exception')) {
      return { status: 'error', color: 'text-red-500', icon: '❌' };
    }
    return { status: 'success', color: 'text-green-500', icon: '✅' };
  };

  const statusInfo = getOutputStatus();

  const tabs = [
    { id: 'output', label: 'Output', icon: '📤' },
    { id: 'error', label: 'Errors', icon: '🚨' },
    { id: 'debug', label: 'Debug', icon: '🔍' }
  ];

  return (
    <div className="relative overflow-hidden bg-white/90 glass-morphism backdrop-blur-xl rounded-3xl shadow-2xl premium-shadow border border-white/20" data-aos="fade-up" data-aos-delay="300">
      {/* Animated background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-blue-500/5 to-purple-500/5 animate-gradient-xy"></div>
      
      {/* Floating decoration elements */}
      <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-emerald-400/20 to-blue-600/20 rounded-full blur-xl animate-float"></div>
      
      {/* Premium Header with tabs */}
      <div className="relative bg-gradient-to-r from-slate-800 via-gray-800 to-slate-900 px-8 py-6 rounded-t-3xl">
        {/* Header background pattern */}
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/5"></div>
        
        <div className="relative flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/10 glass-morphism rounded-2xl flex items-center justify-center transform hover:scale-110 transition-all duration-500">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white font-display">Execution Results</h3>
              <div className={`flex items-center space-x-2 text-sm font-medium mt-1 ${statusInfo.color}`}>
                <span className="text-lg">{statusInfo.icon}</span>
                <span className="capitalize bg-white/10 px-3 py-1 rounded-full border border-white/20">
                  {statusInfo.status}
                </span>
              </div>
            </div>
          </div>
          
          {isLoading && (
            <div className="flex items-center text-sm text-slate-200 bg-white/10 glass-morphism px-4 py-2 rounded-xl border border-white/20">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400 mr-3"></div>
              <span className="font-medium">Processing...</span>
            </div>
          )}
        </div>
        
        {/* Premium Tabs */}
        <div className="relative flex space-x-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group relative px-6 py-3 rounded-xl text-sm font-bold transition-all duration-500 transform hover:scale-105 ${
                activeTab === tab.id
                  ? 'bg-white/30 text-white shadow-xl glass-morphism border border-white/40 scale-105'
                  : 'text-slate-300 hover:text-white hover:bg-white/20 border border-transparent hover:border-white/20'
              }`}
              data-aos="fade-up"
              data-aos-delay={100 + tabs.indexOf(tab) * 50}
            >
              {/* Active tab glow effect */}
              {activeTab === tab.id && (
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/30 to-white/20 rounded-xl animate-pulse"></div>
              )}
              
              <div className="relative flex items-center">
                <span className="text-lg mr-2 group-hover:animate-bounce">{tab.icon}</span>
                <span>{tab.label}</span>
              </div>
              
              {/* Tab indicator */}
              {activeTab === tab.id && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white rounded-full shadow-lg animate-pulse"></div>
              )}
            </button>
          ))}
        </div>
      </div>
      
      {/* Premium Content Area */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-900 to-gray-900 rounded-b-3xl">
        {activeTab === 'output' && (
          <div className="min-h-[350px] max-h-[600px] overflow-y-auto custom-scrollbar">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-80 space-y-6 p-8" data-aos="fade-in">
                {/* Enhanced loading animation */}
                <div className="relative">
                  <div className="animate-spin rounded-full h-20 w-20 border-4 border-emerald-200"></div>
                  <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-emerald-400 absolute inset-0"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl animate-pulse">⚡</span>
                  </div>
                </div>
                
                <div className="text-center space-y-3">
                  <div className="text-xl font-bold text-emerald-400 animate-pulse">Executing your code...</div>
                  <div className="text-sm text-slate-400 max-w-md leading-relaxed">
                    Compiling and running your solution. Please wait while we process your submission.
                  </div>
                  
                  {/* Loading progress dots */}
                  <div className="flex justify-center space-x-2 mt-4">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            ) : output ? (
              <div className="p-8" data-aos="fade-up">
                <div className="mb-4 text-sm text-emerald-400 border-b border-slate-700/50 pb-3 font-medium flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Program Output:
                </div>
                <pre className="text-sm font-mono text-green-400 whitespace-pre-wrap leading-relaxed bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 shadow-2xl">{output}</pre>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-80 text-slate-400 p-8" data-aos="zoom-in">
                <div className="text-9xl mb-6 animate-float">🚀</div>
                <div className="text-2xl font-bold text-slate-300 mb-3">Ready to Execute</div>
                <div className="text-gray-500 text-center max-w-md leading-relaxed">
                  Click "Run Code" to compile and execute your solution. Results will appear here.
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'error' && (
          <div className="min-h-[350px] max-h-[600px] overflow-y-auto custom-scrollbar p-8">
            {output && (output.toLowerCase().includes('error') || output.toLowerCase().includes('exception')) ? (
              <div data-aos="fade-up">
                <div className="mb-4 text-sm text-red-400 border-b border-slate-700/50 pb-3 font-medium flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Error Details:
                </div>
                <pre className="text-sm font-mono text-red-400 whitespace-pre-wrap leading-relaxed bg-red-950/20 p-6 rounded-2xl border border-red-700/30 shadow-2xl">{output}</pre>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-80 text-slate-400" data-aos="zoom-in">
                <div className="text-9xl mb-6 animate-bounce">✨</div>
                <div className="text-2xl font-bold text-green-400 mb-3">No Errors Found</div>
                <div className="text-gray-500 text-center max-w-md leading-relaxed">
                  Your code executed successfully without any compilation or runtime errors!
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'debug' && (
          <div className="min-h-[350px] max-h-[600px] overflow-y-auto custom-scrollbar p-8">
            <div className="space-y-6" data-aos="fade-up">
              <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                <div className="mb-4 text-sm text-blue-400 border-b border-slate-700/50 pb-3 font-medium flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Execution Information:
                </div>
                <div className="text-sm font-mono space-y-3 text-slate-300">
                  <div className="flex justify-between items-center p-2 bg-slate-700/30 rounded-lg">
                    <span>Status:</span>
                    <span className={`font-bold ${statusInfo.color} flex items-center`}>
                      {statusInfo.icon} <span className="ml-2">{statusInfo.status}</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-700/30 rounded-lg">
                    <span>Timestamp:</span>
                    <span className="text-blue-400">{new Date().toLocaleTimeString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-700/30 rounded-lg">
                    <span>Output Length:</span>
                    <span className="text-purple-400">{output?.length || 0} characters</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-700/30 rounded-lg">
                    <span>Lines:</span>
                    <span className="text-emerald-400">{output?.split('\n').length || 0}</span>
                  </div>
                </div>
              </div>
              
              {output && (
                <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                  <div className="mb-4 text-sm text-yellow-400 border-b border-slate-700/50 pb-3 font-medium flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                    Raw Output Data:
                  </div>
                  <pre className="text-xs font-mono text-slate-300 bg-slate-900/80 p-4 rounded-xl overflow-x-auto border border-slate-600/50 custom-scrollbar">
                    {JSON.stringify(output, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Premium Status Bar */}
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 border-t border-slate-600/50 px-8 py-3 flex items-center justify-between text-sm rounded-b-3xl">
          <div className="flex items-center space-x-6 text-slate-300">
            <span className="flex items-center font-medium">
              <svg className="w-4 h-4 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
                <path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V9a1 1 0 00-1-1h-1v-1z" />
              </svg>
              Terminal Ready
            </span>
            <span className="text-slate-400">•</span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              Interactive Shell
            </span>
          </div>
          <div className="flex items-center space-x-4 text-slate-400">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
              {output?.split('\n').length || 0} lines
            </span>
            <span className="text-slate-500">•</span>
            <span className="flex items-center bg-slate-600/30 px-3 py-1 rounded-full">
              <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></span>
              <span className="text-xs font-bold">LIVE</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutputPanel;
