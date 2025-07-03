import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';

// Simple icon components as fallback
const ArrowLeft = () => <span>←</span>;
const ExternalLink = () => <span>↗</span>;
const Code = () => <span>{ }</span>;
const Clock = () => <span>⏱</span>;

// Custom styles for problem statement
const problemStatementStyles = `
  .problem-statement {
    color: #e2e8f0 !important;
    line-height: 1.6;
  }
  
  .problem-statement h1,
  .problem-statement h2,
  .problem-statement h3,
  .problem-statement .title {
    color: #f1f5f9 !important;
    font-weight: bold;
    margin-bottom: 1rem;
  }
  
  .problem-statement .header {
    background-color: #334155;
    border-radius: 0.5rem;
    padding: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .problem-statement .header .title {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }
  
  .problem-statement .time-limit,
  .problem-statement .memory-limit {
    background-color: #475569;
    padding: 0.5rem;
    border-radius: 0.25rem;
    margin: 0.5rem 0;
    font-size: 0.875rem;
  }
  
  .problem-statement .property-title {
    font-weight: bold;
    color: #94a3b8;
  }
  
  .problem-statement .section-title {
    color: #60a5fa !important;
    font-size: 1.125rem;
    font-weight: 600;
    margin: 1.5rem 0 0.75rem 0;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #475569;
  }
  
  .problem-statement pre,
  .problem-statement .test,
  .problem-statement .input,
  .problem-statement .output {
    background-color: #1e293b !important;
    border: 1px solid #475569;
    border-radius: 0.375rem;
    padding: 1rem;
    margin: 0.75rem 0;
    font-family: 'Courier New', monospace;
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-word;
  }
  
  .problem-statement .sample-test {
    margin: 1rem 0;
  }
  
  .problem-statement .sample-test .title {
    color: #94a3b8;
    font-size: 0.875rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  
  .problem-statement .input-specification,
  .problem-statement .output-specification,
  .problem-statement .note {
    margin: 1.5rem 0;
  }
  
  .problem-statement p {
    margin-bottom: 1rem;
    color: #cbd5e1;
  }
  
  .problem-statement ul,
  .problem-statement ol {
    margin: 1rem 0;
    padding-left: 1.5rem;
    color: #cbd5e1;
  }
  
  .problem-statement li {
    margin-bottom: 0.5rem;
  }
  
  .problem-statement table {
    border-collapse: collapse;
    width: 100%;
    margin: 1rem 0;
  }
  
  .problem-statement table th,
  .problem-statement table td {
    border: 1px solid #475569;
    padding: 0.5rem;
    text-align: left;
  }
  
  .problem-statement table th {
    background-color: #334155;
    font-weight: bold;
  }
  
  .problem-statement .formula {
    font-family: 'Times New Roman', serif;
    font-style: italic;
  }
`;

const ProblemDetailPage = ({ user, onLogout }) => {
  const { contestId, index } = useParams();
  const navigate = useNavigate();
  const [problemData, setProblemData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProblemData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8000/api/contest/${contestId}/problem/${index}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch problem: ${response.status}`);
        }
        
        const data = await response.json();
        setProblemData(data);
      } catch (err) {
        console.error('Error fetching problem data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (contestId && index) {
      fetchProblemData();
    }
  }, [contestId, index]);

  // Inject custom styles for problem statement
  useEffect(() => {
    const styleId = 'problem-statement-styles';
    let styleElement = document.getElementById(styleId);
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      styleElement.textContent = problemStatementStyles;
      document.head.appendChild(styleElement);
    }
    
    // Cleanup when component unmounts
    return () => {
      const element = document.getElementById(styleId);
      if (element) {
        element.remove();
      }
    };
  }, []);

  const handleGoBack = () => {
    navigate(-1);
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Header user={user} onLogout={onLogout} />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
            <p className="text-slate-300">Loading problem...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Header user={user} onLogout={onLogout} />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4">
          <div className="bg-slate-800 rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="text-red-400 text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-slate-100 mb-2">Error Loading Problem</h2>
              <p className="text-slate-300 mb-6">{error}</p>
              <button
                onClick={handleGoBack}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!problemData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Header user={user} onLogout={onLogout} />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-100 mb-2">Problem Not Found</h2>
            <p className="text-slate-300 mb-6">The requested problem could not be found.</p>
            <button
              onClick={handleGoBack}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header user={user} onLogout={onLogout} />
      
      {/* Problem Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleGoBack}
                className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back</span>
              </button>
              <div className="h-6 w-px bg-slate-600"></div>
              <h1 className="text-xl font-semibold text-slate-100">
                Problem {index.toUpperCase()} - Contest {contestId}
              </h1>
            </div>
          </div>
        </div>

        {/* Problem Card */}
        <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden">
          {/* Problem Header */}
          <div className="bg-slate-700 px-6 py-4 border-b border-slate-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                  {problemData.index}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-100">{problemData.name}</h2>
                  <div className="flex items-center space-x-3 mt-1">
                    {problemData.rating && (
                      <>
                        <span className={`px-3 py-1 text-xs rounded-full text-white font-medium ${getDifficultyColor(problemData.rating)}`}>
                          {getDifficultyText(problemData.rating)}
                        </span>
                        <span className="text-sm text-slate-400">{problemData.rating}</span>
                      </>
                    )}
                    <div className="flex items-center space-x-1 text-slate-400">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">
                        {problemData.timeLimit || '2 seconds'}
                      </span>
                    </div>
                    <span className="text-sm text-slate-400">
                      {problemData.memoryLimit || '256 MB'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-sm text-slate-400">
                Contest {contestId}
              </div>
            </div>
          </div>

          {/* Problem Content */}
          <div className="px-6 py-8">
            <div className="space-y-6">
              {/* Problem Info */}
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-slate-200 mb-3">Problem Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Problem ID:</span>
                    <span className="ml-2 text-slate-200">{problemData.contestId}{problemData.index}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Type:</span>
                    <span className="ml-2 text-slate-200">{problemData.type || 'PROGRAMMING'}</span>
                  </div>
                  {problemData.points && (
                    <div>
                      <span className="text-slate-400">Points:</span>
                      <span className="ml-2 text-slate-200">{problemData.points}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              {problemData.tags && problemData.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-200 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {problemData.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-blue-500/20 text-blue-300 text-sm rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Problem Statement */}
              {problemData.html ? (
                <div>
                  <h3 className="text-lg font-semibold text-slate-200 mb-4">Problem Statement</h3>
                  <div className="bg-slate-700/30 rounded-lg p-6">
                    <div 
                      className="problem-statement prose prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: problemData.html }}
                    />
                  </div>
                </div>
              ) : problemData.message ? (
                <div className="bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-lg">
                  <div className="flex items-center">
                    <div className="text-amber-400 mr-3">💡</div>
                    <div>
                      <p className="text-amber-100 font-medium">Problem Statement Unavailable</p>
                      <p className="text-amber-200 text-sm">
                        {problemData.message || 'Unable to load the full problem statement. Please view it on Codeforces.'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-lg">
                  <div className="flex items-center">
                    <div className="text-amber-400 mr-3">💡</div>
                    <div>
                      <p className="text-amber-100 font-medium">View Full Problem Statement</p>
                      <p className="text-amber-200 text-sm">
                        To see the complete problem statement with examples and constraints, 
                        click "View on Codeforces" below.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <a
            href={problemData.problemUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <ExternalLink className="h-5 w-5" />
            <span>View on Codeforces</span>
          </a>
          
          <Link
            to={`/ide?contestId=${contestId}&problemIndex=${index}&problemName=${encodeURIComponent(problemData.name)}`}
            className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            <Code className="h-5 w-5" />
            <span>Solve in IDE</span>
          </Link>
          
          <button
            onClick={handleGoBack}
            className="flex items-center space-x-2 bg-slate-600 text-white px-6 py-3 rounded-lg hover:bg-slate-700 transition-colors font-medium"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProblemDetailPage;
