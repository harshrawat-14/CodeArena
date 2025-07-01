import React from 'react';

const StatusBar = ({ language, linesOfCode, lastRun, executionTime }) => {
  const getLanguageIcon = (lang) => {
    switch (lang) {
      case 'cpp': return '⚡';
      case 'py': return '🐍';
      case 'js': return '🟨';
      case 'java': return '☕';
      default: return '📝';
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="bg-slate-800 text-slate-300 px-6 py-2 text-xs flex items-center justify-between border-t border-slate-700">
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-1">
          <span>{getLanguageIcon(language)}</span>
          <span className="uppercase font-medium">{language}</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
          <span>Lines: {linesOfCode}</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span>Ready</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-6">
        {executionTime && (
          <div className="flex items-center space-x-1">
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span>Execution: {executionTime}ms</span>
          </div>
        )}
        
        <div className="flex items-center space-x-1">
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
          <span>Last run: {formatTime(lastRun)}</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <span>UTF-8</span>
          <span>•</span>
          <span>LF</span>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;
