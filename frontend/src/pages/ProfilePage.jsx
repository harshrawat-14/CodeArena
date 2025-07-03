import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import Header from '../components/Header';

const ProfilePage = ({ user, onLogout }) => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // If no userId provided in URL, show current user's profile
        // userId from URL params will be undefined if we're on /profile route
        const targetUserId = userId || user?.uid;
        
        if (!targetUserId) {
          setError('No user ID found. Please log in to view your profile.');
          setLoading(false);
          return;
        }

        console.log('Fetching profile for userId:', targetUserId);

        // Always fetch user data from Firestore using the UID
        try {
          const userDocRef = doc(db, "users", targetUserId);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            console.log('User data found in Firestore:', userData);
            setProfileUser({
              id: userData.uid || targetUserId,
              name: userData.name || userData.displayName || 'User',
              email: userData.email,
              username: userData.username || (userData.email ? userData.email.split('@')[0] : 'user'),
              rating: userData.rating || 1200,
              solvedProblems: userData.solvedProblems || 0,
              rank: userData.rank || 'Newbie',
              photoURL: userData.photoURL || null,
              joinDate: userData.joinDate || userData.createdAt || new Date().toISOString()
            });
          } else {
            // User not found in Firestore
            console.log('User not found in Firestore for UID:', targetUserId);
            setError(`User profile not found. The user may have been deleted or does not exist.`);
          }
        } catch (firestoreError) {
          console.error('Error fetching user from Firestore:', firestoreError);
          setError('Failed to load user profile. Please try again later.');
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId, user?.uid]); // Only depend on user.uid, not the entire user object

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900">
        {/* Header with higher z-index to ensure dropdown visibility */}
        <div className="relative z-50">
          <Header user={user} onLogout={onLogout} />
        </div>
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900">
        {/* Header with higher z-index to ensure dropdown visibility */}
        <div className="relative z-50">
          <Header user={user} onLogout={onLogout} />
        </div>
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center text-white">
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold mb-4">User Not Found</h2>
            <p className="text-slate-300 mb-6 max-w-md">{error || 'Profile data could not be loaded.'}</p>
            <div className="space-x-4">
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Go Back Home
              </button>
              {!user && (
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900">
      {/* Header with higher z-index to ensure dropdown visibility */}
      <div className="relative z-50">
        <Header user={user} onLogout={onLogout} />
      </div>
      
      <div className="relative z-10">
        {/* Animated Background */}
        <div className="fixed inset-0 aurora-bg opacity-20"></div>
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900/50 via-purple-900/30 to-slate-900/50"></div>
        
        <div className="relative z-10 py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Profile Card */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
              <div className="text-center mb-8">
                {/* Profile Picture */}
                <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-6">
                  {profileUser.photoURL ? (
                    <img 
                      src={profileUser.photoURL} 
                      alt={profileUser.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-bold text-white">
                      {profileUser.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                
                {/* User Info */}
                <h1 className="text-4xl font-bold text-white mb-2">{profileUser.name}</h1>
                <p className="text-xl text-slate-300 mb-1">@{profileUser.username}</p>
                <p className="text-slate-400">{profileUser.email}</p>
                
                {/* Rank Badge */}
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-white font-semibold mt-4">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732L14.146 12.8l-1.179 4.456a1 1 0 01-1.934 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732L9.854 7.2l1.179-4.456A1 1 0 0112 2z" clipRule="evenodd" />
                  </svg>
                  {profileUser.rank}
                </div>
              </div>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white/5 rounded-2xl p-6 text-center border border-white/10">
                  <div className="text-3xl font-bold text-blue-400 mb-2">{profileUser.rating}</div>
                  <div className="text-slate-300">Current Rating</div>
                </div>
                
                <div className="bg-white/5 rounded-2xl p-6 text-center border border-white/10">
                  <div className="text-3xl font-bold text-green-400 mb-2">{profileUser.solvedProblems}</div>
                  <div className="text-slate-300">Problems Solved</div>
                </div>
                
                <div className="bg-white/5 rounded-2xl p-6 text-center border border-white/10">
                  <div className="text-3xl font-bold text-purple-400 mb-2">
                    {Math.floor(Math.random() * 50) + 1}
                  </div>
                  <div className="text-slate-300">Contest Rank</div>
                </div>
              </div>
              
              {/* Recent Activity */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {[
                    { problem: "Two Sum", difficulty: "Easy", time: "2 hours ago" },
                    { problem: "Binary Search", difficulty: "Medium", time: "1 day ago" },
                    { problem: "Merge Sort", difficulty: "Medium", time: "3 days ago" }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div>
                        <div className="text-white font-medium">{activity.problem}</div>
                        <div className="text-slate-400 text-sm">{activity.time}</div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        activity.difficulty === 'Easy' ? 'bg-green-500/20 text-green-300' :
                        activity.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {activity.difficulty}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-center space-x-4 mt-8">
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
                >
                  Back to Coding
                </button>
                
                {(profileUser.id === user?.uid || profileUser.id === user?.id) && (
                  <button
                    onClick={() => alert('Edit profile feature coming soon!')}
                    className="px-6 py-3 bg-gradient-to-r from-slate-500 to-slate-600 text-white rounded-xl font-semibold hover:from-slate-600 hover:to-slate-700 transition-all duration-300"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
