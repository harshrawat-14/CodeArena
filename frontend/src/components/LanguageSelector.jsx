import React, { useState } from 'react';

const LanguageSelector = ({ language, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const languages = [
    { value: 'cpp', label: 'C++', icon: '⚡', version: 'GCC 11.2.0', color: 'bg-blue-500' },
    { value: 'c', label: 'C', icon: '🔧', version: 'GCC 11.2.0', color: 'bg-gray-600' },
    { value: 'py', label: 'Python', icon: '🐍', version: '3.11.0', color: 'bg-yellow-500' },
    { value: 'java', label: 'Java', icon: '☕', version: 'OpenJDK 17', color: 'bg-orange-500' },
    { value: 'js', label: 'JavaScript', icon: '🟨', version: 'Node.js 18', color: 'bg-yellow-400' }
  ];

  const selectedLang = languages.find(lang => lang.value === language);

  return (
    <div className="relative">
      <label className="block text-sm font-semibold text-gray-700 mb-3">
        Choose Programming Language
      </label>
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-full bg-white border border-gray-300 rounded-lg shadow-sm pl-4 pr-10 py-3 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
        >
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 ${selectedLang?.color} rounded-lg flex items-center justify-center text-white font-bold text-sm`}>
              {selectedLang?.icon}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">{selectedLang?.label}</div>
              <div className="text-xs text-gray-500">{selectedLang?.version}</div>
            </div>
          </div>
          <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </button>

        {isOpen && (
          <div className="absolute z-20 mt-2 w-full bg-white shadow-xl rounded-lg border border-gray-200 overflow-hidden">
            <div className="max-h-60 overflow-auto">
              {languages.map((lang) => (
                <button
                  key={lang.value}
                  type="button"
                  onClick={() => {
                    onChange(lang.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors duration-150 ${
                    language === lang.value ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 ${lang.color} rounded-lg flex items-center justify-center text-white font-bold text-sm`}>
                      {lang.icon}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{lang.label}</div>
                      <div className="text-xs text-gray-500">{lang.version}</div>
                    </div>
                    {language === lang.value && (
                      <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default LanguageSelector;
