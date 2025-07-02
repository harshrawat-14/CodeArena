// Google Authentication utilities for frontend
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';

// Firebase configuration (replace with your actual config)
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Configure Google provider
googleProvider.addScope('profile');
googleProvider.addScope('email');

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Get the ID token
    const idToken = await user.getIdToken();
    
    // Send the ID token to your backend
    const response = await fetch('http://localhost:8000/auth/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Store the custom token or user data
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userData', JSON.stringify(data.user));
      
      return {
        success: true,
        user: data.user,
        token: data.token,
        isNewUser: data.isNewUser
      };
    } else {
      throw new Error(data.error || 'Authentication failed');
    }
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
};

// Sign out
export const signOutUser = async () => {
  try {
    await signOut(auth);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    return { success: true };
  } catch (error) {
    console.error('Sign-out error:', error);
    throw error;
  }
};

// Get current user data from localStorage
export const getCurrentUser = () => {
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
};

// Get auth token
export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Listen for auth state changes
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Update user profile
export const updateProfile = async (uid, profileData) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`http://localhost:8000/auth/profile/${uid}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });

    const data = await response.json();

    if (response.ok) {
      // Update localStorage with new user data
      localStorage.setItem('userData', JSON.stringify(data.user));
      return { success: true, user: data.user };
    } else {
      throw new Error(data.error || 'Profile update failed');
    }
  } catch (error) {
    console.error('Profile update error:', error);
    throw error;
  }
};

// Get user profile
export const getUserProfile = async (uid) => {
  try {
    const response = await fetch(`http://localhost:8000/auth/profile/${uid}`);
    const data = await response.json();

    if (response.ok) {
      return { success: true, user: data.user };
    } else {
      throw new Error(data.error || 'Failed to get user profile');
    }
  } catch (error) {
    console.error('Get profile error:', error);
    throw error;
  }
};

export { auth };
