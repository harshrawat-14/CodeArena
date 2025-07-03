import React, { useState, useEffect } from 'react';
// import firestoreService from '../services/firestoreService';

const UserProfile = ({ user, onClose }) => {
  const [profile, setProfile] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  // useEffect(() => {
  //   const loadUserData = async () => {
  //     try {
  //       setLoading(true);
        
  //       // Load user profile and submissions
  //       const [userProfile, userSubmissions] = await Promise.all([
  //         firestoreService.getUserProfile(user.id),
  //         firestoreService.getUserSubmissions(user.id)
  //       ]);
        
  //       setProfile(userProfile);
  //       setSubmissions(userSubmissions);
  //     } catch (error) {
  //       console.error('Error loading user data:', error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   if (user) {
  //     loadUserData();
  //   }
  // }, [user]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLanguageColor = (language) => {
    const colors = {
      cpp: 'bg-blue-500',
      java: 'bg-orange-500',
      python: 'bg-green-500',
      javascript: 'bg-yellow-500',
      c: 'bg-gray-500'
    };
    return colors[language] || 'bg-purple-500';
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-white/20">
        {/* Header */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">User Profile</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex space-x-4 mt-6">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 rounded-xl transition-colors ${
                activeTab === 'profile'
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`px-4 py-2 rounded-xl transition-colors ${
                activeTab === 'submissions'
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              Submissions ({submissions.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* User Info Card */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="flex items-center space-x-4">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.name}
                      className="w-16 h-16 rounded-full border-2 border-purple-500"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold text-white">
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-white">{user.name}</h3>
                    <p className="text-white/60">@{user.username}</p>
                    <p className="text-white/60">{user.email}</p>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              {profile && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/10 text-center">
                    <div className="text-3xl font-bold text-purple-400">{profile.rating || 1200}</div>
                    <div className="text-white/60">Rating</div>
                    <div className="text-sm text-white/40 mt-1">{profile.rank || 'Newbie'}</div>
                  </div>
                  
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/10 text-center">
                    <div className="text-3xl font-bold text-green-400">{profile.solvedProblems || 0}</div>
                    <div className="text-white/60">Problems Solved</div>
                  </div>
                  
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/10 text-center">
                    <div className="text-3xl font-bold text-blue-400">{profile.totalSubmissions || 0}</div>
                    <div className="text-white/60">Total Submissions</div>
                  </div>
                </div>
              )}

              {/* Additional Stats */}
              {profile?.stats && (
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <h4 className="text-lg font-semibold text-white mb-4">Problem Statistics</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">{profile.stats.easy || 0}</div>
                      <div className="text-white/60 text-sm">Easy</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400">{profile.stats.medium || 0}</div>
                      <div className="text-white/60 text-sm">Medium</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-400">{profile.stats.hard || 0}</div>
                      <div className="text-white/60 text-sm">Hard</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'submissions' && (
            <div className="space-y-4">
              {submissions.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-white/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <p className="text-white/60">No submissions yet</p>
                  <p className="text-white/40 text-sm">Start coding to see your submissions here!</p>
                </div>
              ) : (
                submissions.map((submission, index) => (
                  <div key={index} className="bg-white/5 rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getLanguageColor(submission.language)}`}>
                          {submission.language.toUpperCase()}
                        </span>
                        <span className="text-white/60 text-sm">
                          {formatDate(submission.timestamp)}
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        submission.status === 'executed' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                      }`}>
                        {submission.status}
                      </span>
                    </div>
                    
                    <div className="bg-black/20 rounded-xl p-3 mb-3">
                      <pre className="text-sm text-white/80 font-mono overflow-x-auto">
                        {submission.code.substring(0, 200)}
                        {submission.code.length > 200 && '...'}
                      </pre>
                    </div>
                    
                    {submission.problemId && (
                      <div className="text-white/60 text-sm">
                        Problem: {submission.problemId}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
