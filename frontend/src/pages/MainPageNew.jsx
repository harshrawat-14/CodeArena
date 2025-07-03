/**
 * PREMIUM MAIN PAGE - ENHANCED USER EXPERIENCE
 * 
 * Features:
 * - Premium contest browser with instant loading
 * - Enhanced code editor with better features
 * - Real-time problem solving experience
 * - Smart recommendations and trending problems
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Code, Search, TrendingUp, Zap, Star } from 'lucide-react';

// Import components
import Header from '../components/Header';
import UserProfile from '../components/UserProfile';
import ProblemStatement from '../components/ProblemStatement';
import CodeEditor from '../components/CodeEditor';
import LanguageSelector from '../components/LanguageSelector';
import OutputPanel from '../components/OutputPanel';
import AIReviewPanel from '../components/AIReviewPanel';
import StatusBar from '../components/StatusBar';
import KeyboardShortcuts from '../components/KeyboardShortcuts';
import PremiumContestBrowser from '../components/PremiumContestBrowser';

// Import services
import apiService from '../services/apiService';

const MainPage = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [activeView, setActiveView] = useState('editor'); // 'editor', 'browser', 'trending'
  
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

  // Premium features state
  const [currentProblem, setCurrentProblem] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [showQuickActions, setShowQuickActions] = useState(true);

  // Load system health on component mount
  useEffect(() => {
    checkSystemHealth();
  }, []);

  const checkSystemHealth = async () => {
    try {
      const health = await apiService.getSystemHealth();
      setSystemHealth(health);
    } catch (error) {
      console.error('Failed to check system health:', error);
    }
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput('');
    const startTime = Date.now();
    
    try {
      const result = await apiService.runCode(language, code, input);
      const endTime = Date.now();
      
      setOutput(result.output || 'No output');
      setExecutionTime(endTime - startTime);
      setLastRunTime(new Date().toLocaleTimeString());
      
      // Save submission if user is logged in and solving a problem
      if (user && currentProblem) {
        try {
          await apiService.saveSubmission({
            uid: user.uid,
            language,
            code,
            input,
            output: result.output,
            status: 'executed',
            problemId: `${currentProblem.contestId}-${currentProblem.index}`,
            problemName: currentProblem.name
          });
        } catch (saveError) {
          console.warn('Failed to save submission:', saveError);
        }
      }
      
    } catch (error) {
      console.error('Code execution error:', error);
      setOutput(`Error: ${error.message}`);
      setExecutionTime(null);
    } finally {
      setIsRunning(false);
    }
  };

  const handleAIReview = async () => {
    if (!code.trim()) {
      setAiReview('Please write some code first!');
      return;
    }

    setIsReviewing(true);
    setAiReview('Analyzing your code...');
    
    try {
      const result = await apiService.getAIReview(code, language);
      setAiReview(result.review || 'Review completed successfully');
    } catch (error) {
      console.error('AI review error:', error);
      setAiReview(`AI Review Error: ${error.message}`);
    } finally {
      setIsReviewing(false);
    }
  };

  const handleSelectContest = async (contest) => {
    try {
      navigate(`/customContest/${contest.id}`);
    } catch (error) {
      console.error('Failed to load contest:', error);
    }
  };

  const handleSelectProblem = async (problem) => {
    try {
      // Load complete problem data
      const problemData = await apiService.getProblemData(problem.contestId, problem.index);
      setCurrentProblem(problemData.problem);
      setActiveView('editor');
      
      // Set initial code template based on problem
      if (problemData.problem.sampleCode) {
        setCode(problemData.problem.sampleCode);
      }
      
      // Set sample input if available
      if (problemData.problem.sampleInput) {
        setInput(problemData.problem.sampleInput);
      }
    } catch (error) {
      console.error('Failed to load problem:', error);
      // Navigate to problem detail page as fallback
      navigate(`/problem/${problem.contestId}/${problem.index}`);
    }
  };

  const handleRandomProblem = async () => {
    try {
      const result = await apiService.getRandomProblem();
      if (result.problem) {
        handleSelectProblem(result.problem);
      }
    } catch (error) {
      console.error('Failed to get random problem:', error);
    }
  };

  const views = [
    { id: 'editor', name: 'Code Editor', icon: Code, description: 'Write and test your code' },
    { id: 'browser', name: 'Contest Browser', icon: Search, description: 'Browse contests and problems' },
    { id: 'trending', name: 'Trending', icon: TrendingUp, description: 'Popular problems right now' }
  ];

  const quickActions = [
    {
      name: 'Random Problem',
      icon: Star,
      color: 'bg-purple-500 hover:bg-purple-600',
      action: handleRandomProblem
    },
    {
      name: 'Run Code',
      icon: Play,
      color: 'bg-green-500 hover:bg-green-600',
      action: handleRunCode,
      disabled: isRunning
    },
    {
      name: 'AI Review',
      icon: Zap,
      color: 'bg-blue-500 hover:bg-blue-600',
      action: handleAIReview,
      disabled: isReviewing
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        user={user} 
        onLogout={onLogout}
        onToggleProfile={() => setShowProfile(!showProfile)}
      />

      {/* System Health Status */}
      {systemHealth && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Zap className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                🚀 Premium API v{systemHealth.version} - All systems operational
                {systemHealth.uptime && ` (Uptime: ${Math.floor(systemHealth.uptime / 60)}m)`}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - User Profile */}
          {showProfile && (
            <div className="lg:w-80 space-y-6">
              <UserProfile user={user} />
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* View Navigation */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex flex-wrap gap-2 mb-4">
                {views.map(view => {
                  const Icon = view.icon;
                  return (
                    <button
                      key={view.id}
                      onClick={() => setActiveView(view.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                        activeView === view.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-medium">{view.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Quick Actions */}
              {showQuickActions && (
                <div className="flex flex-wrap gap-2">
                  {quickActions.map(action => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.name}
                        onClick={action.action}
                        disabled={action.disabled}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-50 ${action.color}`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{action.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Content based on active view */}
            {activeView === 'editor' && (
              <div className="space-y-6">
                {/* Current Problem Display */}
                {currentProblem && (
                  <div className="bg-white rounded-xl shadow-sm">
                    <ProblemStatement 
                      problem={currentProblem}
                      showFullStatement={true}
                    />
                  </div>
                )}

                {/* Code Editor Section */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  {/* Editor */}
                  <div className="xl:col-span-2 space-y-4">
                    <div className="bg-white rounded-xl shadow-sm">
                      <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900">Code Editor</h3>
                          <LanguageSelector 
                            language={language} 
                            onLanguageChange={setLanguage}
                          />
                        </div>
                      </div>
                      <div className="p-4">
                        <CodeEditor
                          language={language}
                          code={code}
                          onChange={setCode}
                          theme="vs-dark"
                        />
                      </div>
                    </div>

                    {/* Input Section */}
                    <div className="bg-white rounded-xl shadow-sm">
                      <div className="p-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Input</h3>
                      </div>
                      <div className="p-4">
                        <textarea
                          className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder="Enter your input here..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Output and AI Review */}
                  <div className="space-y-4">
                    <OutputPanel 
                      output={output}
                      isRunning={isRunning}
                      executionTime={executionTime}
                      lastRunTime={lastRunTime}
                    />
                    
                    <AIReviewPanel 
                      review={aiReview}
                      isReviewing={isReviewing}
                      onRequestReview={handleAIReview}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeView === 'browser' && (
              <PremiumContestBrowser 
                onSelectContest={handleSelectContest}
                onSelectProblem={handleSelectProblem}
              />
            )}

            {activeView === 'trending' && (
              <PremiumContestBrowser 
                onSelectContest={handleSelectContest}
                onSelectProblem={handleSelectProblem}
              />
            )}
          </div>
        </div>

        {/* Status Bar */}
        <StatusBar 
          isRunning={isRunning}
          isReviewing={isReviewing}
          lastRunTime={lastRunTime}
          executionTime={executionTime}
          user={user}
          currentProblem={currentProblem}
        />

        {/* Keyboard Shortcuts */}
        <KeyboardShortcuts 
          onRunCode={handleRunCode}
          onAIReview={handleAIReview}
          disabled={isRunning || isReviewing}
        />
      </div>
    </div>
  );
};

export default MainPage;
