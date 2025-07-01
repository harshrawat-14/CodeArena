import React from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/themes/prism-tomorrow.css';

const CodeEditor = ({ code, onChange, language }) => {
  const getHighlighter = (lang) => {
    switch (lang) {
      case 'cpp':
      case 'c':
        return (code) => highlight(code, languages.clike);
      case 'py':
        return (code) => highlight(code, languages.python);
      case 'js':
        return (code) => highlight(code, languages.javascript);
      default:
        return (code) => highlight(code, languages.clike);
    }
  };

  const getLanguageIcon = (lang) => {
    switch (lang) {
      case 'cpp':
        return '⚡';
      case 'py':
        return '🐍';
      case 'js':
        return '🟨';
      case 'java':
        return '☕';
      default:
        return '📝';
    }
  };

  return (
    <div className="relative overflow-hidden bg-white/90 glass-morphism backdrop-blur-xl rounded-3xl shadow-2xl premium-shadow border border-white/20" data-aos="fade-up" data-aos-delay="100">
      {/* Animated background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 via-gray-500/5 to-black/5 animate-gradient-xy"></div>
      
      {/* Floating decoration elements */}
      <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-slate-400/20 to-gray-600/20 rounded-full blur-xl animate-float"></div>
      
      {/* Premium Editor Header */}
      <div className="relative bg-gradient-to-r from-slate-800 via-gray-800 to-slate-900 px-8 py-6 rounded-t-3xl">
        {/* Header background pattern */}
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/5"></div>
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/10 glass-morphism rounded-2xl flex items-center justify-center transform hover:scale-110 transition-all duration-500">
              <span className="text-2xl">{getLanguageIcon(language)}</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white font-display flex items-center">
                Solution.{language}
                <div className="ml-3 px-3 py-1 bg-green-500/20 text-green-300 text-xs font-bold rounded-full border border-green-500/30">
                  LIVE
                </div>
              </h3>
              <p className="text-slate-300 text-sm font-medium flex items-center mt-1">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></span>
                Write your solution here
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            {/* Premium Code Stats */}
            <div className="flex items-center space-x-4 text-slate-300 text-sm">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
                Lines: {code.split('\n').length}
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
                {code.length} chars
              </div>
            </div>
            
            {/* Premium Window Controls */}
            <div className="flex space-x-3">
              <div className="w-4 h-4 bg-red-500 rounded-full shadow-lg hover:shadow-red-500/50 cursor-pointer transition-all duration-300 hover:scale-110"></div>
              <div className="w-4 h-4 bg-yellow-500 rounded-full shadow-lg hover:shadow-yellow-500/50 cursor-pointer transition-all duration-300 hover:scale-110"></div>
              <div className="w-4 h-4 bg-green-500 rounded-full shadow-lg hover:shadow-green-500/50 cursor-pointer transition-all duration-300 hover:scale-110"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Premium Editor Content */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-900 to-gray-900 rounded-b-3xl">
        {/* Enhanced Line Numbers Background */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-b from-slate-800 to-slate-900 border-r border-slate-600/50 flex flex-col text-slate-400 text-sm font-mono pt-6 z-10 rounded-bl-3xl">
          {code.split('\n').map((_, index) => (
            <div key={index} className="h-6 flex items-center justify-end pr-4 text-xs hover:text-blue-400 hover:bg-slate-700/30 transition-colors duration-200">
              {index + 1}
            </div>
          ))}
        </div>
        
        {/* Enhanced Editor */}
        <div className="ml-20 relative">
          <Editor
            value={code}
            onValueChange={onChange}
            highlight={getHighlighter(language)}
            padding={24}
            style={{
              fontFamily: '"Fira Code", "JetBrains Mono", "SF Mono", Consolas, "Liberation Mono", Menlo, Courier, monospace',
              fontSize: 15,
              lineHeight: 1.8,
              outline: 'none',
              border: 'none',
              background: 'transparent',
              color: '#f8fafc',
              minHeight: '450px',
              caretColor: '#3b82f6',
            }}
            textareaClassName="code-editor-textarea custom-scrollbar"
            className="code-editor-container"
          />
          
          {/* Code completion hint overlay */}
          <div className="absolute bottom-4 right-4 text-xs text-slate-500 bg-slate-800/80 px-3 py-1 rounded-lg backdrop-blur-sm border border-slate-600/50">
            Press <kbd className="bg-slate-700 px-1 rounded text-slate-300">Ctrl+Space</kbd> for suggestions
          </div>
        </div>
        
        {/* Premium Status Bar */}
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 border-t border-slate-600/50 px-6 py-3 flex items-center justify-between text-sm rounded-b-3xl">
          <div className="flex items-center space-x-6 text-slate-300">
            <span className="flex items-center font-medium">
              <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mr-2 animate-pulse shadow-lg"></div>
              Ready
            </span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
              UTF-8
            </span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Auto-save enabled
            </span>
          </div>
          <div className="flex items-center space-x-6 text-slate-400">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Ln {code.split('\n').length}, Col 1
            </span>
            <div className="flex items-center bg-slate-600/30 px-3 py-1 rounded-full">
              <span className="text-xs font-bold uppercase tracking-wide">{language}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
