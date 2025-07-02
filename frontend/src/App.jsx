import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// Import Firebase auth service
import authService from './services/authService';

// Import components
import Login from './components/Login';
import Header from './components/Header';
import UserProfile from './components/UserProfile';
import ProblemStatement from './components/ProblemStatement';
import CodeEditor from './components/CodeEditor';
import LanguageSelector from './components/LanguageSelector';
import OutputPanel from './components/OutputPanel';
import AIReviewPanel from './components/AIReviewPanel';
import StatusBar from './components/StatusBar';
import KeyboardShortcuts from './components/KeyboardShortcuts';

function App() {
  // Authentication state
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  
  // Add console logging for debugging
  console.log('App rendering, user:', user);
  
  // Code editor state
  const [language, setLanguage] = useState('cpp');
  const [code, setCode] = useState(`#include <iostream>
using namespace std;

int main() {
    int num1, num2, sum;
    cout << "Enter two numbers: ";
    cin >> num1 >> num2;
    sum = num1 + num2;
    cout << "The sum is: " << sum << endl;
    return 0;
}`);
  
  // Input/Output state
  const [input, setInput] = useState('5 3');
  const [output, setOutput] = useState('');
  const [aiReview, setAiReview] = useState('');
  
  // Loading states
  const [isRunning, setIsRunning] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [lastRunTime, setLastRunTime] = useState(null);
  const [executionTime, setExecutionTime] = useState(null);

  // Check for existing user session on component mount
  useEffect(() => {
    // Set up Firebase auth state listener
    const unsubscribe = authService.onAuthStateChange((firebaseUser) => {
      if (firebaseUser) {
        // Convert Firebase user to our user format
        const userData = {
          id: firebaseUser.uid,
          username: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          email: firebaseUser.email,
          name: firebaseUser.displayName || 'User',
          photoURL: firebaseUser.photoURL,
          rating: 1200, // Will be updated from backend profile
          solvedProblems: 0 // Will be updated from backend profile
        };
        setUser(userData);
      } else {
        setUser(null);
      }
      setIsAuthLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []); // Remove authService from dependencies since it's a singleton

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await authService.signOut();
      setUser(null);
      setCode('');
      setOutput('');
      setAiReview('');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput('');
    const startTime = Date.now();
    
    const payload = {
      language,
      code,
      input,
    };

    // Add authentication token if user is logged in
    const headers = {};
    if (user && authService.authToken) {
      headers.Authorization = `Bearer ${authService.authToken}`;
    }

    try {
      const { data } = await axios.post(
        `http://localhost:${import.meta.env.VITE_BACKEND_URL || '8000'}/run`, 
        payload,
        { headers }
      );
      setOutput(data.output);
      setLastRunTime(Date.now());
      setExecutionTime(Date.now() - startTime);
    } catch (error) {
      console.error('Error:', error);
      if (error.response) {
        setOutput(`Error: ${error.response.data.error || 'Server error'}`);
      } else if (error.request) {
        setOutput('Error: Cannot connect to server. Make sure the backend is running on port 8000.');
      } else {
        setOutput(`Error: ${error.message}`);
      }
      setLastRunTime(Date.now());
      setExecutionTime(Date.now() - startTime);
    } finally {
      setIsRunning(false);
    }
  };

  const handleAiReview = async () => {
    setIsReviewing(true);
    setAiReview('');
    
    const payload = { code };
    
    try {
      const { data } = await axios.post(`http://localhost:${import.meta.env.VITE_BACKEND_URL}/ai-review`, payload);
      setAiReview(data.review || data);
    } catch (error) {
      console.error('AI Review error:', error);
      setAiReview(`Error: ${error.response ? error.response.data.error : error.message}`);
    } finally {
      setIsReviewing(false);
    }
  };

  // Show loading while checking authentication
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-purple-900">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
        </div>
      </div>
    );
  }

  // If user is not logged in, show login component
  if (!user) {
    try {
      return <Login onLogin={handleLogin} />;
    } catch (error) {
      console.error('Login component error:', error);
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-purple-900">
          <div className="text-center text-white">
            <h1 className="text-2xl font-bold mb-4">Error Loading Login</h1>
            <p className="text-red-300">{error.message}</p>
          </div>
        </div>
      );
    }
  }

  try {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 aurora-bg opacity-20"></div>
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900/50 via-purple-900/30 to-slate-900/50"></div>
        
        {/* Floating Particles */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-blue-400/30 rounded-full animate-float"></div>
          <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-purple-400/30 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-1/4 left-1/3 w-5 h-5 bg-pink-400/30 rounded-full animate-float" style={{animationDelay: '4s'}}></div>
          <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-cyan-400/30 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-1/3 right-1/4 w-6 h-6 bg-indigo-400/30 rounded-full animate-float" style={{animationDelay: '3s'}}></div>
        </div>
        
        <div className="relative z-10">
          <Header 
            user={user} 
            onLogout={handleLogout} 
            onShowProfile={() => setShowProfile(true)}
          />
        
        {/* Hero Section with Spectacular Design */}
        <div className="relative bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 text-white py-20 overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          
          {/* Animated Geometric Shapes */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
            <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-br from-pink-500/20 to-red-500/20 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '2s'}}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-2xl animate-pulse-slow" style={{animationDelay: '1s'}}></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="space-y-6" data-aos="fade-right" data-aos-duration="1200">
                <div className="space-y-4">
                  <h1 className="text-6xl font-bold gradient-text animate-pulse font-display">
                    Code. Compete. Conquer.
                  </h1>
                  <p className="text-2xl text-blue-100 text-shadow font-light">
                    Experience the most advanced coding platform
                  </p>
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="px-3 py-1 bg-white/20 glass-morphism rounded-full">
                      <span className="flex items-center">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                        Live Judge System
                      </span>
                    </div>
                    <div className="px-3 py-1 bg-white/20 glass-morphism rounded-full">
                      <span className="flex items-center">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></div>
                        AI-Powered Reviews
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="hidden md:flex items-center space-x-12 text-center" data-aos="fade-left" data-aos-duration="1200">
                <div className="group">
                  <div className="text-5xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">∞</div>
                  <div className="text-blue-200 text-sm group-hover:text-white transition-colors">Problems</div>
                </div>
                <div className="group">
                  <div className="text-5xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">⚡</div>
                  <div className="text-blue-200 text-sm group-hover:text-white transition-colors">Lightning Fast</div>
                </div>
                <div className="group">
                  <div className="text-5xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">🧠</div>
                  <div className="text-blue-200 text-sm group-hover:text-white transition-colors">AI Assistant</div>
                </div>
                <div className="group">
                  <div className="text-5xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">🏆</div>
                  <div className="text-blue-200 text-sm group-hover:text-white transition-colors">Competitions</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2" data-aos="fade-up" data-aos-delay="1000">
            <div className="animate-bounce">
              <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </div>
        
        <main className="relative max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column - Enhanced with Animations */}
            <div className="lg:col-span-7 space-y-8">
              {/* Problem Statement */}
              <div data-aos="fade-up" data-aos-delay="100">
                <ProblemStatement />
              </div>
              
              {/* Language Selector & Run Button */}
              <div data-aos="fade-up" data-aos-delay="200" className="bg-white/95 glass-morphism rounded-2xl shadow-2xl premium-shadow p-6 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-6">
                    <LanguageSelector language={language} onChange={setLanguage} />
                  </div>
                  <button
                    onClick={handleRunCode}
                    disabled={isRunning}
                    className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 hover:from-emerald-600 hover:via-green-600 hover:to-teal-600 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <div className="relative flex items-center">
                      {isRunning ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                          <span className="text-lg">Executing...</span>
                        </>
                      ) : (
                        <>
                          <svg className="h-6 w-6 mr-3 group-hover:animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                          </svg>
                          <span className="text-lg">Run Code</span>
                        </>
                      )}
                    </div>
                  </button>
                </div>
              </div>
              
              {/* Code Editor */}
              <div data-aos="fade-up" data-aos-delay="300" className="transform hover:-translate-y-1 transition-all duration-500">
                <CodeEditor code={code} onChange={setCode} language={language} />
              </div>
              
              {/* Input Section */}
              <div data-aos="fade-up" data-aos-delay="400" className="bg-white/95 glass-morphism rounded-2xl shadow-2xl premium-shadow overflow-hidden hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1">
                <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 px-6 py-4 flex items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <svg className="h-5 w-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Custom Input</h3>
                      <p className="text-slate-300 text-sm">Test with your own data</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter custom input for testing (leave empty to use default test cases)..."
                    className="w-full h-32 px-4 py-3 bg-slate-50/50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 font-mono text-sm resize-none transition-all duration-300 hover:border-slate-300"
                  />
                </div>
              </div>
            </div>
            
            {/* Right Column - Enhanced with Animations */}
            <div className="lg:col-span-5 space-y-8">
              <div data-aos="fade-up" data-aos-delay="500" className="transform hover:-translate-y-1 transition-all duration-500">
                <OutputPanel output={output} isLoading={isRunning} />
              </div>
              <div data-aos="fade-up" data-aos-delay="600" className="transform hover:-translate-y-1 transition-all duration-500">
                <AIReviewPanel 
                  review={aiReview} 
                  isLoading={isReviewing} 
                  onRequestReview={handleAiReview} 
                />
              </div>
            </div>
          </div>
        </main>
        
        {/* Enhanced Status Bar */}
        <div className="relative">
          <StatusBar 
            language={language}
            linesOfCode={code.split('\n').length}
            lastRun={lastRunTime}
            executionTime={executionTime}
          />
        </div>
        
        {/* Keyboard Shortcuts */}
        <KeyboardShortcuts />
      </div>
    </div>
  );
  } catch (error) {
    console.error('App render error:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-purple-900">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
          <p className="text-slate-300 mb-4">Please refresh the page to try again.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Refresh Page
          </button>
        </div>

        {/* User Profile Modal */}
        {showProfile && (
          <UserProfile 
            user={user}
            authService={authService}
            onClose={() => setShowProfile(false)}
          />
        )}
      </div>
    );
  }
}

export default App;
