import React, { useState, useEffect } from 'react';
import { 
  signInWithGoogle, 
  signOutUser, 
  getCurrentUser, 
  updateProfile,
  onAuthStateChange 
} from '../auth/googleAuth';

const GoogleAuthComponent = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: '',
    bio: '',
    location: '',
    website: '',
    githubUsername: '',
    linkedinUsername: ''
  });

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setProfileData({
        displayName: currentUser.displayName || '',
        bio: currentUser.bio || '',
        location: currentUser.location || '',
        website: currentUser.website || '',
        githubUsername: currentUser.githubUsername || '',
        linkedinUsername: currentUser.linkedinUsername || ''
      });
    }

    // Listen for auth state changes
    const unsubscribe = onAuthStateChange((firebaseUser) => {
      if (!firebaseUser && user) {
        // User signed out
        setUser(null);
        setEditMode(false);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      setUser(result.user);
      
      if (result.isNewUser) {
        alert('Welcome! Your account has been created successfully.');
      } else {
        alert('Welcome back!');
      }
    } catch (error) {
      alert('Sign-in failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      setUser(null);
      setEditMode(false);
      alert('Signed out successfully');
    } catch (error) {
      alert('Sign-out failed: ' + error.message);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await updateProfile(user.uid, profileData);
      setUser(result.user);
      setEditMode(false);
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Profile update failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h1 className="text-2xl font-bold text-center mb-6">
            Welcome to Online Judge
          </h1>
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center disabled:opacity-50"
          >
            {loading ? (
              'Signing in...'
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">User Profile</h1>
            <button
              onClick={handleSignOut}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Sign Out
            </button>
          </div>

          <div className="flex items-center mb-6">
            <img
              src={user.photoURL || '/default-avatar.png'}
              alt="Profile"
              className="w-20 h-20 rounded-full mr-4"
            />
            <div>
              <h2 className="text-xl font-semibold">{user.displayName}</h2>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-500">
                Rating: {user.rating} | Rank: {user.rank}
              </p>
              <p className="text-sm text-gray-500">
                Problems Solved: {user.solvedProblems}
              </p>
            </div>
          </div>

          {!editMode ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-700">Bio</h3>
                <p className="text-gray-600">{user.bio || 'No bio provided'}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">Location</h3>
                <p className="text-gray-600">{user.location || 'Not specified'}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">Website</h3>
                <p className="text-gray-600">{user.website || 'Not specified'}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">GitHub</h3>
                <p className="text-gray-600">{user.githubUsername || 'Not specified'}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">LinkedIn</h3>
                <p className="text-gray-600">{user.linkedinUsername || 'Not specified'}</p>
              </div>
              
              <button
                onClick={() => setEditMode(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Edit Profile
              </button>
            </div>
          ) : (
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Display Name</label>
                <input
                  type="text"
                  name="displayName"
                  value={profileData.displayName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Bio</label>
                <textarea
                  name="bio"
                  value={profileData.bio}
                  onChange={handleInputChange}
                  rows="3"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <input
                  type="text"
                  name="location"
                  value={profileData.location}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Website</label>
                <input
                  type="url"
                  name="website"
                  value={profileData.website}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">GitHub Username</label>
                <input
                  type="text"
                  name="githubUsername"
                  value={profileData.githubUsername}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">LinkedIn Username</label>
                <input
                  type="text"
                  name="linkedinUsername"
                  value={profileData.linkedinUsername}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                />
              </div>
              
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoogleAuthComponent;
