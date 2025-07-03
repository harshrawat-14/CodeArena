import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';

const LeaderboardPage = ({ user, onLogout }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/leaderboard');
        if (response.ok) {
          const data = await response.json();
          setLeaderboard(data.leaderboard || []);
        } else {
          throw new Error('Failed to fetch leaderboard');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getRankColor = (rank) => {
    if (rank === 1) return 'text-yellow-400';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-orange-400';
    return 'text-slate-300';
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return '👑';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900">
      {/* Header with higher z-index to ensure dropdown visibility */}
      <div className="relative z-50">
        <Header user={user} onLogout={onLogout} />
      </div>
      
      {/* Animated Background */}
      <div className="fixed inset-0 aurora-bg opacity-20"></div>
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900/50 via-purple-900/30 to-slate-900/50"></div>
      
      <div className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold gradient-text mb-4">
              🏆 Global Leaderboard
            </h1>
            <p className="text-xl text-slate-300">
              Top coders competing for glory
            </p>
          </div>

          {/* Leaderboard Content */}
          <div className="bg-white/95 glass-morphism rounded-2xl shadow-2xl overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-slate-600">Loading leaderboard...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="text-red-500 mb-4">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <p className="text-red-600 font-semibold">Error loading leaderboard</p>
                  <p className="text-slate-600">{error}</p>
                </div>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="text-slate-400 mb-4">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-slate-600">No data available yet</p>
                  <p className="text-sm text-slate-500">Start solving problems to appear on the leaderboard!</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-slate-800 to-slate-700 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left">Rank</th>
                      <th className="px-6 py-4 text-left">User</th>
                      <th className="px-6 py-4 text-center">Rating</th>
                      <th className="px-6 py-4 text-center">Rank Badge</th>
                      <th className="px-6 py-4 text-center">Problems Solved</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {leaderboard.map((participant) => (
                      <tr 
                        key={participant.uid} 
                        className={`hover:bg-slate-50 transition-colors ${
                          participant.uid === user?.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className={`text-2xl font-bold ${getRankColor(participant.rank)}`}>
                            {getRankIcon(participant.rank)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold mr-3">
                              {participant.photoURL ? (
                                <img 
                                  src={participant.photoURL} 
                                  alt={participant.displayName}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                participant.displayName?.charAt(0)?.toUpperCase() || '?'
                              )}
                            </div>
                            <div>
                              <Link 
                                to={`/profile/${participant.uid}`}
                                className="font-semibold text-slate-800 hover:text-blue-600 transition-colors"
                              >
                                {participant.displayName || 'Anonymous'}
                              </Link>
                              {participant.uid === user?.id && (
                                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                  You
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="font-bold text-lg text-slate-800">
                            {participant.rating || 1200}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            participant.rating >= 2400 ? 'bg-red-100 text-red-800' :
                            participant.rating >= 2100 ? 'bg-orange-100 text-orange-800' :
                            participant.rating >= 1900 ? 'bg-purple-100 text-purple-800' :
                            participant.rating >= 1600 ? 'bg-blue-100 text-blue-800' :
                            participant.rating >= 1400 ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {participant.rank || 'Newbie'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="font-semibold text-slate-800">
                            {participant.solvedProblems || 0}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Stats Section */}
          {leaderboard.length > 0 && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/95 glass-morphism rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {leaderboard.length}
                </div>
                <div className="text-slate-600">Total Participants</div>
              </div>
              <div className="bg-white/95 glass-morphism rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {leaderboard.reduce((sum, user) => sum + (user.solvedProblems || 0), 0)}
                </div>
                <div className="text-slate-600">Problems Solved</div>
              </div>
              <div className="bg-white/95 glass-morphism rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {Math.round(leaderboard.reduce((sum, user) => sum + (user.rating || 1200), 0) / leaderboard.length)}
                </div>
                <div className="text-slate-600">Average Rating</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
