import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ProblemDetailPage = () => {
  const { contestId, index } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/contest/${contestId}/problem/${index}`);
        if (!res.ok) throw new Error('Problem not found');
        const data = await res.json();
        setProblem(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [contestId, index]);

  if (loading) return <p className="text-center mt-8 text-white">Loading...</p>;
  if (error) return <p className="text-center mt-8 text-red-400">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto text-white p-6">
      <button onClick={() => navigate(-1)} className="mb-4 text-blue-400 hover:underline">← Back</button>

      <h1 className="text-2xl font-bold mb-2">{problem.title}</h1>
      <p className="mb-2 text-sm text-gray-400">{problem.contestName} ({problem.contestId}{problem.problemIndex})</p>

      <div dangerouslySetInnerHTML={{ __html: problem.statement }} className="prose prose-invert max-w-none" />
      
      {problem.inputSpec && (
        <>
          <h2 className="text-lg font-semibold mt-6 mb-2">Input</h2>
          <div dangerouslySetInnerHTML={{ __html: problem.inputSpec }} />
        </>
      )}

      {problem.outputSpec && (
        <>
          <h2 className="text-lg font-semibold mt-6 mb-2">Output</h2>
          <div dangerouslySetInnerHTML={{ __html: problem.outputSpec }} />
        </>
      )}

      {problem.examples && (
        <>
          <h2 className="text-lg font-semibold mt-6 mb-2">Examples</h2>
          <div dangerouslySetInnerHTML={{ __html: problem.examples }} />
        </>
      )}

      {problem.note && (
        <>
          <h2 className="text-lg font-semibold mt-6 mb-2">Note</h2>
          <div dangerouslySetInnerHTML={{ __html: problem.note }} />
        </>
      )}
    </div>
  );
};

export default ProblemDetailPage;
