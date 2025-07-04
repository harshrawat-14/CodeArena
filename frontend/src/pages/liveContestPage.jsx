import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import axios from 'axios';

// Mini problem statement styles
const miniStatementStyles = `
  .problem-statement-mini {
    color: #cbd5e1 !important;
    line-height: 1.4;
    font-size: 0.875rem;
  }
  
  .problem-statement-mini h1,
  .problem-statement-mini h2,
  .problem-statement-mini h3,
  .problem-statement-mini .title {
    color: #f1f5f9 !important;
    font-weight: 600;
    margin-bottom: 0.5rem;
    font-size: 1rem;
  }
  
  .problem-statement-mini .header {
    background-color: #334155;
    border-radius: 0.375rem;
    padding: 0.75rem;
    margin-bottom: 1rem;
  }
  
  .problem-statement-mini pre,
  .problem-statement-mini .test,
  .problem-statement-mini .input,
  .problem-statement-mini .output {
    background-color: #1e293b !important;
    border: 1px solid #475569;
    border-radius: 0.25rem;
    padding: 0.5rem;
    margin: 0.5rem 0;
    font-family: 'Courier New', monospace;
    font-size: 0.75rem;
    overflow-x: auto;
  }
  
  .problem-statement-mini p {
    margin-bottom: 0.5rem;
    color: #cbd5e1;
  }
`;

const ContestProblemsPage = ({ user, onLogout }) => {
  const { contestId } = useParams();
  const navigate = useNavigate();
  const [contest, setContest] = useState(null);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedProblems, setExpandedProblems] = useState(new Set());

  const getDivisionFromContestId = (contestId) => {
    // Extract division from contestId (format: div1_timestamp, div2_timestamp, etc.)
    const divMatch = contestId.match(/div(\d)/);
    return divMatch ? parseInt(divMatch[1]) : 2;
  };

  const getContestDataFromStorage = (contestId) => {
    const existingContests = JSON.parse(localStorage.getItem('contestRooms') || '{}');
    return Object.values(existingContests).find(contest => contest.contestId === contestId) || null;
  };

  useEffect(() => {
    const fetchContestProblems = async () => {
      try {
        setLoading(true);
        console.log('ContestProblemsPage - contestId:', contestId);
        
        // First, try to get contest data from localStorage (for custom contests)
        const storedContestData = getContestDataFromStorage(contestId);
        console.log('ContestProblemsPage - storedContestData:', storedContestData);
        
        let targetContestId, division;
        
        if (storedContestData && storedContestData.problems) {
          // Use stored problems with statements from custom contest
          console.log('Using stored contest data with problems:', storedContestData);
          
          // Set contest info from stored data
          setContest({
            id: storedContestData.codeforcesContestId,
            name: storedContestData.codeforcesContestName,
            type: 'CUSTOM',
            roomCode: storedContestData.roomCode,
            creator: storedContestData.creator,
            customTitle: storedContestData.title,
            durationSeconds: 7200 // Default 2 hours for custom contests
          });
          
          // Use stored problems (already have statements)
          setProblems(storedContestData.problems);
          
        } else if (storedContestData) {
          // Stored contest but no problems, fetch from API
          targetContestId = storedContestData.codeforcesContestId;
          division = storedContestData.divisionName;
          
          // Set contest info from stored data
          setContest({
            id: targetContestId,
            name: storedContestData.codeforcesContestName,
            type: 'CUSTOM',
            roomCode: storedContestData.roomCode,
            creator: storedContestData.creator,
            customTitle: storedContestData.title
          });
          
          // Fetch problems from API
          const problemsResponse = await axios.get(
            `https://codeforces.com/api/contest.standings?contestId=${targetContestId}&from=1&count=1`
          );
          
          const contestProblems = problemsResponse.data.result.problems;
          setProblems(contestProblems);
        } else {
          // Fallback to original logic for direct contest access
          division = getDivisionFromContestId(contestId);
          
          // Try our backend API first for complete problem data
          try {
            console.log('Fetching complete contest data from backend...');
            const backendResponse = await axios.get(
              `http://localhost:8000/api/contest/${contestId}/problems`
            );
            
            if (backendResponse.data && backendResponse.data.problems) {
              console.log('Successfully fetched complete contest data from backend');
              setProblems(backendResponse.data.problems);
              
              // Try to get contest info from the first problem or set a default
              if (backendResponse.data.problems.length > 0) {
                setContest({
                  id: contestId,
                  name: `Contest ${contestId}`,
                  type: 'CF_COMPLETE',
                  durationSeconds: 7200
                });
              }
              
              return; // Success, exit early
            }
          } catch (backendError) {
            console.log('Backend fetch failed, falling back to Codeforces API:', backendError.message);
          }
          
          // Fallback to original Codeforces API logic
          const contestsResponse = await axios.get('https://codeforces.com/api/contest.list');
          const contests = contestsResponse.data.result;
          
          // Filter contests by division and get the most recent finished one
          const divisionContests = contests.filter(contest => 
            contest.phase === "FINISHED" && 
            contest.name.includes(`Div. ${division}`)
          );
          
          if (divisionContests.length === 0) {
            throw new Error(`No Div. ${division} contests found`);
          }
          
          const recentContest = divisionContests[0]; // Most recent contest
          targetContestId = recentContest.id;
          setContest(recentContest);
          
          // Fetch problems for the target contest (basic version without statements)
          const problemsResponse = await axios.get(
            `https://codeforces.com/api/contest.standings?contestId=${targetContestId}&from=1&count=1`
          );
          
          const contestProblems = problemsResponse.data.result.problems;
          setProblems(contestProblems);
        }
        
      } catch (err) {
        console.error('Error fetching contest problems:', err);
        setError(`Failed to load contest problems: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchContestProblems();
  }, [contestId]);

  // Inject styles for mini problem statements
  useEffect(() => {
    const styleId = 'mini-problem-statement-styles';
    let styleElement = document.getElementById(styleId);
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      styleElement.textContent = miniStatementStyles;
      document.head.appendChild(styleElement);
    }
    
    return () => {
      const element = document.getElementById(styleId);
      if (element) {
        element.remove();
      }
    };
  }, []);

  const getDifficultyColor = (rating) => {
    if (!rating) return 'bg-gray-500';
    if (rating <= 1000) return 'bg-green-500';
    if (rating <= 1400) return 'bg-blue-500';
    if (rating <= 1800) return 'bg-purple-500';
    if (rating <= 2200) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getDifficultyText = (rating) => {
    if (!rating) return 'Unrated';
    if (rating <= 1000) return 'Easy';
    if (rating <= 1400) return 'Medium';
    if (rating <= 1800) return 'Hard';
    if (rating <= 2200) return 'Very Hard';
    return 'Expert';
  };

  const handleStartProblem = (problem) => {
    // Navigate to IDE with the selected problem
    navigate('/ide', { 
      state: { 
        problem: problem,
        contestInfo: contest 
      } 
    });
  };

  const toggleProblemExpansion = (problemKey) => {
    const newExpanded = new Set(expandedProblems);
    if (newExpanded.has(problemKey)) {
      newExpanded.delete(problemKey);
    } else {
      newExpanded.add(problemKey);
    }
    setExpandedProblems(newExpanded);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900">
        <div className="relative z-50">
          <Header user={user} onLogout={onLogout} />
        </div>
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading contest problems...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900">
        <div className="relative z-50">
          <Header user={user} onLogout={onLogout} />
        </div>
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center text-white">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-red-400 font-semibold mb-2">Error loading contest</p>
            <p className="text-slate-300 mb-4">{error}</p>
            <button
              onClick={() => navigate('/customContest')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-300"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900">
      <div className="relative z-50">
        <Header user={user} onLogout={onLogout} />
      </div>
      
      {/* Animated Background */}
      <div className="fixed inset-0 aurora-bg opacity-20"></div>
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900/50 via-purple-900/30 to-slate-900/50"></div>
      
      <div className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Contest Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <button
                onClick={() => navigate('/customContest')}
                className="mr-4 p-2 text-slate-300 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-4xl font-bold gradient-text">
                🏆 {contest?.customTitle ? `${contest.customTitle} (${contest.name})` : contest?.name || 'Contest Problems'}
              </h1>
            </div>
            <p className="text-xl text-slate-300 mb-2">
              Contest ID: {contest?.id} • Duration: {contest?.durationSeconds ? Math.floor(contest.durationSeconds / 3600) : 'N/A'} hours
              {contest?.roomCode && (
                <span className="ml-4 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-sm font-mono">
                  Room Code: {contest.roomCode}
                </span>
              )}
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-slate-400">
              <span>Problems: {problems.length}</span>
              <span>•</span>
              <span>Type: {contest?.type || 'CF'}</span>
              {contest?.creator && (
                <>
                  <span>•</span>
                  <span>Created by: {contest.creator}</span>
                </>
              )}
            </div>
          </div>

          {/* Problems Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {problems.map((problem) => (
              <div
                key={`${problem.contestId}-${problem.index}`}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20 hover:bg-white/15 transition-all duration-500 transform hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                      {problem.index}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{problem.name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        {problem.rating && (
                          <>
                            <span className={`px-2 py-1 text-xs rounded-full text-white ${getDifficultyColor(problem.rating)}`}>
                              {getDifficultyText(problem.rating)}
                            </span>
                            <span className="text-xs text-slate-400">{problem.rating}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center space-x-4 text-sm text-slate-300 mb-3">
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{problem.timeLimit || 'Time: 2s'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span>{problem.memoryLimit || 'Memory: 256MB'}</span>
                    </div>
                  </div>

                  <div className="bg-slate-800/50 rounded-lg p-3 mb-4">
                    {problem.html ? (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-slate-300 font-medium">Problem Statement:</p>
                          <button
                            onClick={() => toggleProblemExpansion(`${problem.contestId}-${problem.index}`)}
                            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            {expandedProblems.has(`${problem.contestId}-${problem.index}`) ? '▼ Collapse' : '▶ Expand'}
                          </button>
                        </div>
                        
                        {expandedProblems.has(`${problem.contestId}-${problem.index}`) ? (
                          <div className="max-h-96 overflow-y-auto">
                            <div 
                              className="problem-statement-mini text-sm text-slate-300"
                              dangerouslySetInnerHTML={{ __html: problem.html }}
                            />
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400">Click "Expand" to view the complete problem statement</p>
                        )}
                      </div>
                    ) : problem.statement ? (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-slate-300 font-medium">Problem Statement:</p>
                          <button
                            onClick={() => toggleProblemExpansion(`${problem.contestId}-${problem.index}`)}
                            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            {expandedProblems.has(`${problem.contestId}-${problem.index}`) ? '▼ Collapse' : '▶ Expand'}
                          </button>
                        </div>
                        
                        {expandedProblems.has(`${problem.contestId}-${problem.index}`) ? (
                          <div className="space-y-3 max-h-96 overflow-y-auto">
                            {/* Problem Description */}
                            <div>
                              <h4 className="text-sm font-semibold text-blue-300 mb-1">Description:</h4>
                              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                                {problem.statement}
                              </p>
                            </div>
                            
                            {/* Input Format */}
                            {problem.inputFormat && (
                              <div>
                                <h4 className="text-sm font-semibold text-green-300 mb-1">Input:</h4>
                                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                                  {problem.inputFormat}
                                </p>
                              </div>
                            )}
                            
                            {/* Output Format */}
                            {problem.outputFormat && (
                              <div>
                                <h4 className="text-sm font-semibold text-yellow-300 mb-1">Output:</h4>
                                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                                  {problem.outputFormat}
                                </p>
                              </div>
                            )}
                            
                            {/* Examples */}
                            {problem.examples && problem.examples.length > 0 && (
                              <div>
                                <h4 className="text-sm font-semibold text-purple-300 mb-2">Examples:</h4>
                                {problem.examples.map((example, idx) => (
                                  <div key={idx} className="bg-slate-700/50 rounded p-2 mb-2">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                      <div>
                                        <p className="text-xs text-green-400 mb-1">Input {example.index || idx + 1}:</p>
                                        <pre className="text-xs text-slate-300 bg-slate-800 p-2 rounded overflow-x-auto">
{example.input}
                                        </pre>
                                      </div>
                                      <div>
                                        <p className="text-xs text-yellow-400 mb-1">Output {example.index || idx + 1}:</p>
                                        <pre className="text-xs text-slate-300 bg-slate-800 p-2 rounded overflow-x-auto">
{example.output}
                                        </pre>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {/* Notes */}
                            {problem.notes && (
                              <div>
                                <h4 className="text-sm font-semibold text-orange-300 mb-1">Notes:</h4>
                                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                                  {problem.notes}
                                </p>
                              </div>
                            )}
                            
                            {/* Time and Memory Limits */}
                            {(problem.timeLimit || problem.memoryLimit) && (
                              <div className="flex items-center space-x-4 text-xs text-slate-400 pt-2 border-t border-slate-700">
                                {problem.timeLimit && (
                                  <span className="flex items-center space-x-1">
                                    <span>⏱️</span>
                                    <span>{problem.timeLimit}</span>
                                  </span>
                                )}
                                {problem.memoryLimit && (
                                  <span className="flex items-center space-x-1">
                                    <span>💾</span>
                                    <span>{problem.memoryLimit}</span>
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-400 leading-relaxed">
                            Click "Expand" to view the complete problem statement with examples and constraints.
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-300 leading-relaxed">
                        Problem {problem.index}: {problem.name}
                      </p>
                    )}
                    {problem.tags && problem.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {problem.tags.slice(0, 3).map((tag, tagIndex) => (
                          <span 
                            key={tagIndex}
                            className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {problem.tags.length > 3 && (
                          <span className="px-2 py-1 bg-slate-500/20 text-slate-400 text-xs rounded-full">
                            +{problem.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleStartProblem(problem)}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-lg transition-all duration-300 text-sm font-medium"
                  >
                    Start Solving
                  </button>
                  <button
                    onClick={() => navigate(`/problem/${problem.contestId}/${problem.index}`)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-300 text-sm font-medium"
                    title="View full problem statement"
                  >
                    View Problem
                  </button>
                  <a
                    href={problem.problemUrl || `https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-all duration-300"
                    title="View full problem on Codeforces"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>

                {/* Problem Statement Expansion */}
                <div className="mt-4">
                  <button
                    onClick={() => toggleProblemExpansion(problem.index)}
                    className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all duration-300 text-sm font-medium flex items-center justify-between"
                  >
                    <span>{expandedProblems.has(problem.index) ? 'Hide Statement' : 'View Statement'}</span>
                    <svg 
                      className={`w-4 h-4 transition-transform duration-300 ${expandedProblems.has(problem.index) ? 'transform rotate-90' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  {expandedProblems.has(problem.index) && (
                    <div className="mt-2 p-4 bg-slate-800 rounded-lg text-slate-300 text-sm leading-relaxed">
                      {problem.statement}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {problems.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-slate-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-slate-300 text-lg">No problems found for this contest</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContestProblemsPage;