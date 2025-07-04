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
    const fetchProblem = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/contest/${contestId}/problem/${index}`);
        if (!res.ok) throw new Error('Problem not found');
        const data = await res.json();
        setProblemData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Header user={user} onLogout={onLogout} />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <p className="text-center text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Header user={user} onLogout={onLogout} />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <p className="text-center text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header user={user} onLogout={onLogout} />
      
      {/* Problem Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-white">
        {/* Navigation Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>
          
          <h1 className="text-2xl font-bold mb-2">{problemData.title}</h1>
          <p className="mb-2 text-sm text-gray-400">
            {problemData.contestName} ({problemData.contestId}{problemData.problemIndex})
          </p>
        </div>

        {/* Problem Statement */}
        <div className="bg-slate-800 rounded-lg shadow-lg p-6 mb-6">
          <div 
            dangerouslySetInnerHTML={{ __html: problemData.statement }} 
            className="prose prose-invert max-w-none problem-statement" 
          />
        </div>
        
        {/* Input Specification */}
        {problemData.inputSpec && (
          <div className="bg-slate-800 rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Input</h2>
            <div dangerouslySetInnerHTML={{ __html: problemData.inputSpec }} />
          </div>
        )}

        {/* Output Specification */}
        {problemData.outputSpec && (
          <div className="bg-slate-800 rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Output</h2>
            <div dangerouslySetInnerHTML={{ __html: problemData.outputSpec }} />
          </div>
        )}

        {/* Examples */}
        {problemData.examples && (
          <div className="bg-slate-800 rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Examples</h2>
            <div dangerouslySetInnerHTML={{ __html: problemData.examples }} />
          </div>
        )}

        {/* Note */}
        {problemData.note && (
          <div className="bg-slate-800 rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Note</h2>
            <div dangerouslySetInnerHTML={{ __html: problemData.note }} />
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <a
            href={`https://codeforces.com/problemset/problem/${contestId}/${index}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <ExternalLink className="h-5 w-5" />
            <span>View on Codeforces</span>
          </a>
          
          <Link
            to={`/ide?contestId=${contestId}&problemIndex=${index}&problemName=${encodeURIComponent(problemData.title || problemData.name)}`}
            className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            <Code className="h-5 w-5" />
            <span>Solve in IDE</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProblemDetailPage;
