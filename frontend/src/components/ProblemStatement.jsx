import React, { useState } from 'react';

const ProblemStatement = () => {
  const [activeTab, setActiveTab] = useState('problem');
  
  const tabs = [
    { id: 'problem', label: 'Problem', icon: '📝' },
    { id: 'examples', label: 'Examples', icon: '🔍' },
    { id: 'constraints', label: 'Constraints', icon: '⚠️' }
  ];

  const difficulty = 'Easy';
  const tags = ['Math', 'Implementation', 'Beginner'];
  
  const getDifficultyColor = (diff) => {
    switch(diff.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'hard': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🎯</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Problem #1</h2>
              <p className="text-blue-100 text-sm">Practice Problem</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(difficulty)}`}>
              {difficulty}
            </span>
          </div>
        </div>
        
        {/* Tags */}
        <div className="flex items-center space-x-2 mt-4">
          {tags.map((tag, index) => (
            <span key={index} className="px-2 py-1 bg-white/20 text-white text-xs rounded-md">
              {tag}
            </span>
          ))}
        </div>
        
        {/* Tabs */}
        <div className="flex space-x-1 mt-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white/30 text-white shadow-lg'
                  : 'text-blue-100 hover:text-white hover:bg-white/20'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        {activeTab === 'problem' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Sum of Two Numbers</h3>
            <p className="text-gray-600 leading-relaxed">
              Write a program that reads two integers from the user and outputs their sum.
              This is a basic input/output problem designed to help you get familiar with 
              reading input and producing output in your chosen programming language.
            </p>
            
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="text-blue-400 text-lg">💡</span>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-blue-900">Tip</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Make sure to handle the input correctly and output only the sum without any extra text.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'examples' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Examples</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <span className="mr-2">📥</span>
                    Input
                  </h4>
                  <div className="bg-gray-50 p-3 rounded-lg font-mono text-sm border">
                    5 3
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <span className="mr-2">📤</span>
                    Output
                  </h4>
                  <div className="bg-gray-50 p-3 rounded-lg font-mono text-sm border">
                    8
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <span className="mr-2">📥</span>
                    Input
                  </h4>
                  <div className="bg-gray-50 p-3 rounded-lg font-mono text-sm border">
                    -10 15
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <span className="mr-2">📤</span>
                    Output
                  </h4>
                  <div className="bg-gray-50 p-3 rounded-lg font-mono text-sm border">
                    5
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="text-yellow-400 text-lg">⚠️</span>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-yellow-900">Note</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    The two numbers are separated by a space on the same line.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'constraints' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Constraints</h3>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-blue-500">📊</span>
                <span className="text-gray-700">
                  <strong>Input range:</strong> -1,000,000 ≤ each number ≤ 1,000,000
                </span>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-green-500">⏱️</span>
                <span className="text-gray-700">
                  <strong>Time limit:</strong> 1 second
                </span>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-purple-500">💾</span>
                <span className="text-gray-700">
                  <strong>Memory limit:</strong> 256 MB
                </span>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-orange-500">🔢</span>
                <span className="text-gray-700">
                  <strong>Input format:</strong> Two integers separated by a space
                </span>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-red-500">📝</span>
                <span className="text-gray-700">
                  <strong>Output format:</strong> Single integer (the sum)
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="bg-gray-50 border-t border-gray-200 px-6 py-3 flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center space-x-4">
          <span className="flex items-center">
            <span className="text-green-500 mr-1">✓</span>
            Solved by 15,432 users
          </span>
          <span>•</span>
          <span>Success Rate: 89%</span>
        </div>
        <div className="flex items-center space-x-2">
          <span>Problem ID: #001</span>
        </div>
      </div>
    </div>
  );
};

export default ProblemStatement;
