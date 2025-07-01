import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

const AIReviewPanel = ({ review, isLoading, onRequestReview }) => {
  const [activeTab, setActiveTab] = useState('review');
  
  const tabs = [
    { id: 'review', label: 'AI Review', icon: '🤖' },
    { id: 'suggestions', label: 'Suggestions', icon: '💡' },
    { id: 'performance', label: 'Performance', icon: '⚡' }
  ];

  const extractSections = (reviewText) => {
    if (!reviewText) return { review: '', suggestions: '', performance: '' };
    
    const sections = {
      review: reviewText,
      suggestions: '',
      performance: ''
    };
    
    // Try to extract different sections from the review
    const suggestionMatch = reviewText.match(/(?:suggestions?|improvements?|recommendations?):?\s*([\s\S]*?)(?:\n\n|\n(?=[A-Z])|$)/i);
    const performanceMatch = reviewText.match(/(?:performance|optimization|efficiency):?\s*([\s\S]*?)(?:\n\n|\n(?=[A-Z])|$)/i);
    
    if (suggestionMatch) sections.suggestions = suggestionMatch[1].trim();
    if (performanceMatch) sections.performance = performanceMatch[1].trim();
    
    return sections;
  };

  const sections = extractSections(review);
  
  const getReviewScore = () => {
    if (!review) return null;
    // Simple scoring based on keywords
    const positiveWords = ['good', 'excellent', 'well', 'correct', 'efficient'];
    const negativeWords = ['error', 'issue', 'problem', 'inefficient', 'wrong'];
    
    const positive = positiveWords.reduce((count, word) => 
      count + (review.toLowerCase().split(word).length - 1), 0);
    const negative = negativeWords.reduce((count, word) => 
      count + (review.toLowerCase().split(word).length - 1), 0);
    
    const score = Math.max(1, Math.min(10, 6 + positive - negative));
    return score;
  };

  const score = getReviewScore();
  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-500';
    if (score >= 6) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="relative overflow-hidden bg-white/90 glass-morphism backdrop-blur-xl rounded-3xl shadow-2xl premium-shadow border border-white/20">
      {/* Animated background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 animate-gradient-xy"></div>
      
      {/* Floating decoration elements */}
      <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-xl animate-float"></div>
      <div className="absolute bottom-8 left-8 w-32 h-32 bg-gradient-to-br from-pink-400/10 to-purple-600/10 rounded-full blur-2xl animate-float" style={{animationDelay: '1s'}}></div>
      
      {/* Header */}
      <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-8 py-6 rounded-t-3xl">
        {/* Header background pattern */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/5"></div>
        
        <div className="relative flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-white/20 glass-morphism rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-all duration-500">
              <span className="text-3xl animate-pulse">🤖</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white font-display">AI Code Assistant</h3>
              <p className="text-purple-100 text-sm font-medium flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                Powered by Advanced ML Intelligence
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {score && (
              <div className="bg-white/20 glass-morphism rounded-xl px-4 py-2 backdrop-blur-sm border border-white/30">
                <div className="text-white text-sm font-bold flex items-center">
                  <svg className="w-4 h-4 mr-2 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Score: <span className={`ml-1 ${getScoreColor(score)}`}>{score}/10</span>
                </div>
              </div>
            )}
            
            <button
              onClick={onRequestReview}
              disabled={isLoading}
              className="group relative inline-flex items-center px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-2xl transform hover:scale-105 border border-white/30 overflow-hidden"
            >
              {/* Button shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              <div className="relative flex items-center">
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    <span className="animate-pulse">Analyzing...</span>
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5 mr-3 group-hover:animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                    </svg>
                    <span>Analyze Code</span>
                  </>
                )}
              </div>
            </button>
          </div>
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
                  : 'text-purple-100 hover:text-white hover:bg-white/20 border border-transparent hover:border-white/20'
              }`}
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
      <div className="relative min-h-[400px] max-h-[600px] overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-80 space-y-6 p-8" data-aos="fade-in">
            {/* Enhanced loading animation */}
            <div className="relative">
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-purple-200"></div>
              <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-purple-600 absolute inset-0"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl animate-pulse">🧠</span>
              </div>
            </div>
            
            <div className="text-center space-y-3">
              <div className="text-xl font-bold text-gray-800 animate-pulse">AI Analysis in Progress</div>
              <div className="text-sm text-gray-600 max-w-md leading-relaxed">
                Our advanced machine learning models are examining your code for quality, performance optimizations, and best practices...
              </div>
              
              {/* Loading progress dots */}
              <div className="flex justify-center space-x-2 mt-4">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        ) : review ? (
          <div className="relative p-8" data-aos="fade-up">
            {activeTab === 'review' && (
              <div className="prose prose-lg max-w-none">
                <ReactMarkdown
                  components={{
                    h1: ({children}) => <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 font-display">{children}</h1>,
                    h2: ({children}) => <h2 className="text-xl font-bold text-gray-800 mb-4 mt-8 flex items-center"><span className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mr-3 flex-shrink-0"></span>{children}</h2>,
                    h3: ({children}) => <h3 className="text-lg font-semibold text-gray-700 mb-3 mt-6 flex items-center"><span className="w-4 h-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded mr-2 flex-shrink-0"></span>{children}</h3>,
                    p: ({children}) => <p className="text-gray-700 mb-4 leading-relaxed text-base">{children}</p>,
                    code: ({children}) => <code className="bg-gradient-to-r from-purple-100 to-pink-100 px-3 py-1 rounded-lg text-sm font-mono text-purple-700 border border-purple-200">{children}</code>,
                    pre: ({children}) => <pre className="bg-gray-900 text-green-400 p-6 rounded-2xl overflow-x-auto mb-6 shadow-2xl border border-gray-700">{children}</pre>,
                    ul: ({children}) => <ul className="list-none mb-6 space-y-2">{children}</ul>,
                    li: ({children}) => <li className="text-gray-700 flex items-start"><span className="w-2 h-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mt-2 mr-3 flex-shrink-0"></span><span>{children}</span></li>
                  }}
                >
                  {sections.review}
                </ReactMarkdown>
              </div>
            )}
            
            {activeTab === 'suggestions' && (
              <div className="space-y-6">
                {sections.suggestions ? (
                  <div className="prose prose-lg max-w-none">
                    <ReactMarkdown
                      components={{
                        h1: ({children}) => <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 font-display">{children}</h1>,
                        h2: ({children}) => <h2 className="text-xl font-bold text-gray-800 mb-4 mt-8">{children}</h2>,
                        p: ({children}) => <p className="text-gray-700 mb-4 leading-relaxed">{children}</p>,
                        ul: ({children}) => <ul className="list-none mb-6 space-y-3">{children}</ul>,
                        li: ({children}) => <li className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border-l-4 border-blue-500 text-gray-700">{children}</li>
                      }}
                    >
                      {sections.suggestions}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-center py-16" data-aos="fade-in">
                    <div className="text-8xl mb-6 animate-bounce">💡</div>
                    <div className="text-2xl font-bold text-gray-800 mb-3">No specific suggestions yet</div>
                    <div className="text-gray-600 max-w-md mx-auto leading-relaxed">
                      Run a comprehensive analysis to receive detailed improvement suggestions and coding best practices
                    </div>
                    <button 
                      onClick={onRequestReview}
                      className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    >
                      Analyze Now
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'performance' && (
              <div className="space-y-6">
                {sections.performance ? (
                  <div className="prose prose-lg max-w-none">
                    <ReactMarkdown
                      components={{
                        h1: ({children}) => <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-6 font-display">{children}</h1>,
                        h2: ({children}) => <h2 className="text-xl font-bold text-gray-800 mb-4 mt-8">{children}</h2>,
                        p: ({children}) => <p className="text-gray-700 mb-4 leading-relaxed">{children}</p>,
                        ul: ({children}) => <ul className="list-none mb-6 space-y-3">{children}</ul>,
                        li: ({children}) => <li className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl border-l-4 border-orange-500 text-gray-700">{children}</li>
                      }}
                    >
                      {sections.performance}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-center py-16" data-aos="fade-in">
                    <div className="text-8xl mb-6 animate-pulse">⚡</div>
                    <div className="text-2xl font-bold text-gray-800 mb-3">Performance Analysis</div>
                    <div className="text-gray-600 max-w-md mx-auto leading-relaxed mb-6">
                      Advanced performance metrics, complexity analysis, and optimization recommendations coming soon
                    </div>
                    <div className="bg-gradient-to-r from-orange-100 to-red-100 p-6 rounded-2xl border border-orange-200 max-w-sm mx-auto">
                      <div className="text-orange-700 font-semibold mb-2">⚠️ Feature Preview</div>
                      <div className="text-sm text-orange-600">Performance analysis will include execution time, memory usage, and algorithmic complexity insights</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-80 text-gray-500 p-8" data-aos="zoom-in">
            <div className="text-9xl mb-8 animate-float">🚀</div>
            <div className="text-2xl font-bold text-gray-800 mb-4">Ready for AI Analysis</div>
            <div className="text-gray-600 text-center max-w-lg leading-relaxed mb-8">
              Get instant, comprehensive feedback on your code quality, performance optimizations, and best practices from our state-of-the-art AI assistant.
            </div>
            <button 
              onClick={onRequestReview}
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 text-white font-bold rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-500 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <span className="relative flex items-center">
                <svg className="w-5 h-5 mr-2 group-hover:animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
                Start Analysis
              </span>
            </button>
          </div>
        )}
      </div>
      
      {/* Premium Footer */}
      <div className="relative bg-gradient-to-r from-gray-50/80 to-gray-100/80 glass-morphism border-t border-gray-200/50 px-8 py-4 rounded-b-3xl">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-6 text-gray-600">
            <span className="flex items-center font-medium">
              <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mr-2 animate-pulse shadow-lg"></div>
              AI Model Active
            </span>
            <span className="text-gray-400">•</span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              Response Time: ~2-3s
            </span>
            <span className="text-gray-400">•</span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
              GPT-4 Powered
            </span>
          </div>
          <div className="flex items-center space-x-2 text-gray-500">
            {review && (
              <>
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Generated: {new Date().toLocaleTimeString()}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIReviewPanel;
