/**
 * PREMIUM PROBLEM DETAIL PAGE - ENHANCED SOLVING EXPERIENCE
 * 
 * Features:
 * - Instant problem loading via Firebase
 * - Complete problem data with test cases
 * - Enhanced code editor with syntax highlighting
 * - Real-time submission tracking
 * - AI-powered hints and solutions
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Zap, Clock, Users, Star, ExternalLink, Copy, Check } from 'lucide-react';
import Header from '../components/Header';
import CodeEditor from '../components/CodeEditor';
import LanguageSelector from '../components/LanguageSelector';
import OutputPanel from '../components/OutputPanel';
import AIReviewPanel from '../components/AIReviewPanel';
import apiService from '../services/apiService';

const PremiumProblemDetailPage = ({ user, onLogout }) => {
  const { contestId, index } = useParams();
  const navigate = useNavigate();
  
  // Problem state
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Code editor state
  const [language, setLanguage] = useState('cpp');
  const [code, setCode] = useState('');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [aiReview, setAiReview] = useState('');
  
  // Loading states
  const [isRunning, setIsRunning] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [lastRunTime, setLastRunTime] = useState(null);
  const [executionTime, setExecutionTime] = useState(null);
  
  // UI state
  const [showHints, setShowHints] = useState(false);
  const [copiedSample, setCopiedSample] = useState(null);

  // Load problem data on mount
  useEffect(() => {
    loadProblemData();
  }, [contestId, index]);

  // Set initial code template when language changes
  useEffect(() => {
    setInitialCode();
  }, [language, problem]);

  const loadProblemData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getProblemData(contestId, index);
      const problemData = response.problem;
      
      setProblem(problemData);
      
      // Set initial input from sample if available
      if (problemData.sampleInputs && problemData.sampleInputs.length > 0) {
        setInput(problemData.sampleInputs[0]);
      }
      
    } catch (error) {
      console.error('Failed to load problem:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const setInitialCode = () => {
    if (!problem) return;

    const templates = {
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    // Your solution here
    
    return 0;
}`,
      java: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        
        // Your solution here
        
        sc.close();
    }
}`,
      python: `# Your solution here
`,
      javascript: `// Your solution here
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('line', (input) => {
    // Process input
});`
    };

    if (!code || code === '') {
      setCode(templates[language] || '// Your solution here');
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
      
      // Save submission if user is logged in
      if (user) {
        try {
          await apiService.saveSubmission({
            uid: user.uid,
            language,
            code,
            input,
            output: result.output,
            status: 'executed',
            problemId: `${contestId}-${index}`,
            problemName: problem?.name || `${contestId}${index}`
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

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSample(type);
      setTimeout(() => setCopiedSample(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const getDifficultyColor = (rating) => {
    if (!rating) return 'text-gray-600';
    if (rating < 1200) return 'text-green-600';
    if (rating < 1600) return 'text-blue-600';
    if (rating < 2000) return 'text-purple-600';
    if (rating < 2400) return 'text-red-600';
    return 'text-gray-800';
  };

  const formatTime = (timeLimit) => {
    if (typeof timeLimit === 'string') return timeLimit;
    return `${timeLimit / 1000} seconds`;
  };

  const formatMemory = (memoryLimit) => {
    if (typeof memoryLimit === 'string') return memoryLimit;
    return `${memoryLimit / 1024} MB`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user} onLogout={onLogout} />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="h-64 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-4">
                <div className="h-96 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user} onLogout={onLogout} />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-red-800 mb-4">Problem Not Found</h2>
              <p className="text-red-600 mb-6">{error}</p>
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={onLogout} />
      
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={handleRunCode}
              disabled={isRunning}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              <Play className="w-4 h-4" />
              <span>{isRunning ? 'Running...' : 'Run Code'}</span>
            </button>
            
            <button
              onClick={handleAIReview}
              disabled={isReviewing}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Zap className="w-4 h-4" />
              <span>{isReviewing ? 'Analyzing...' : 'AI Review'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Problem Statement */}
          <div className="space-y-6">
            {/* Problem Header */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {problem.index}. {problem.name}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Contest {contestId}</span>
                    {problem.rating && (
                      <span className={`font-medium ${getDifficultyColor(problem.rating)}`}>
                        ★ {problem.rating}
                      </span>
                    )}
                  </div>
                </div>
                
                <a
                  href={`https://codeforces.com/problemset/problem/${contestId}/${index}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="text-sm">View on Codeforces</span>
                </a>
              </div>

              {/* Problem Stats */}
              <div className="flex items-center space-x-6 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>Time: {formatTime(problem.timeLimit)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>Memory: {formatMemory(problem.memoryLimit)}</span>
                </div>
                {problem.solvedCount && (
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4" />
                    <span>{problem.solvedCount} solved</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {problem.tags && problem.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {problem.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Problem Statement */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Problem Statement</h3>
              <div className="prose max-w-none">
                {problem.statement ? (
                  <div dangerouslySetInnerHTML={{ __html: problem.statement }} />
                ) : (
                  <p className="text-gray-600">Problem statement will be loaded from Codeforces...</p>
                )}
              </div>
            </div>

            {/* Sample Test Cases */}
            {(problem.sampleInputs || problem.sampleOutputs) && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sample Test Cases</h3>
                <div className="space-y-4">
                  {problem.sampleInputs?.map((sampleInput, i) => (
                    <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-700">Input {i + 1}</h4>
                          <button
                            onClick={() => copyToClipboard(sampleInput, `input-${i}`)}
                            className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                          >
                            {copiedSample === `input-${i}` ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span>Copy</span>
                          </button>
                        </div>
                        <pre className="bg-gray-50 p-3 rounded-lg text-sm font-mono whitespace-pre-wrap">
                          {sampleInput}
                        </pre>
                      </div>
                      
                      {problem.sampleOutputs?.[i] && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-700">Output {i + 1}</h4>
                            <button
                              onClick={() => copyToClipboard(problem.sampleOutputs[i], `output-${i}`)}
                              className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                            >
                              {copiedSample === `output-${i}` ? (
                                <Check className="w-3 h-3" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                              <span>Copy</span>
                            </button>
                          </div>
                          <pre className="bg-gray-50 p-3 rounded-lg text-sm font-mono whitespace-pre-wrap">
                            {problem.sampleOutputs[i]}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Code Editor and Testing */}
          <div className="space-y-6">
            {/* Code Editor */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Solution</h3>
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
                  height="400px"
                />
              </div>
            </div>

            {/* Input */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Custom Input</h3>
              </div>
              <div className="p-4">
                <textarea
                  className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter your test input here..."
                />
              </div>
            </div>

            {/* Output */}
            <OutputPanel 
              output={output}
              isRunning={isRunning}
              executionTime={executionTime}
              lastRunTime={lastRunTime}
            />

            {/* AI Review */}
            <AIReviewPanel 
              review={aiReview}
              isReviewing={isReviewing}
              onRequestReview={handleAIReview}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumProblemDetailPage;
