import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../firebaseConfig';
import firebaseService from './firebaseService';
import localStorageService from './localStorageService';
import axios from 'axios';

// Configure axios with base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Check if we should use local storage instead of Firestore
const USE_LOCAL_STORAGE = import.meta.env.VITE_USE_LOCAL_STORAGE === 'true';

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

class AuthService {
  constructor() {
    this.currentUser = null;
    this.isAuthenticated = false;
    this.authToken = null;
  }

  // Monitor auth state changes
  onAuthStateChange(callback) {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        this.currentUser = user;
        this.isAuthenticated = true;
        this.authToken = await user.getIdToken();
        
        // Create/update user profile in Firestore or Local Storage
        try {
          if (USE_LOCAL_STORAGE) {
            await localStorageService.createUserProfile(user);
          } else {
            await firebaseService.createUserProfile(user);
          }
          callback(user);
        } catch (error) {
          console.error('Error creating user profile:', error);
          callback(user); // Still call callback even if profile creation fails
        }
      } else {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.authToken = null;
        callback(null);
      }
    });
  }

  // Sign up with email and password
  async signUp(email, password, displayName) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name
      if (displayName) {
        await updateProfile(result.user, { displayName });
      }
      
      return {
        success: true,
        user: result.user,
        message: 'Account created successfully!'
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  // Sign in with email and password
  async signIn(email, password) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return {
        success: true,
        user: result.user,
        message: 'Signed in successfully!'
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  // Sign in with Google
  async signInWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return {
        success: true,
        user: result.user,
        message: 'Signed in with Google successfully!'
      };
    } catch (error) {
      console.error('Google sign-in error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error.code),
        originalError: error.message
      };
    }
  }

  // Sign out
  async signOut() {
    try {
      await signOut(auth);
      return {
        success: true,
        message: 'Signed out successfully!'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to sign out'
      };
    }
  }

  // Create user profile in backend
  async createUserProfile(user) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/profile`, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      });
      return response.data;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  // Get user profile from backend or local storage
  async getUserProfile(uid) {
    try {
      if (USE_LOCAL_STORAGE) {
        return localStorageService.getUserProfile(uid);
      } else {
        return await firebaseService.getUserProfile(uid);
      }
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  // Save code submission
  async saveSubmission(submissionData) {
    try {
      if (USE_LOCAL_STORAGE) {
        if (!this.currentUser) throw new Error('User not authenticated');
        return await localStorageService.saveSubmission(this.currentUser.uid, submissionData);
      } else {
        if (!this.currentUser) throw new Error('User not authenticated');
        return await firebaseService.saveSubmission(this.currentUser.uid, submissionData);
      }
    } catch (error) {
      console.error('Error saving submission:', error);
      throw error;
    }
  }

  // Get user submissions
  async getUserSubmissions(uid, limit = 50) {
    try {
      if (USE_LOCAL_STORAGE) {
        return localStorageService.getUserSubmissions(uid, limit);
      } else {
        return await firebaseService.getUserSubmissions(uid, limit);
      }
    } catch (error) {
      console.error('Error getting user submissions:', error);
      throw error;
    }
  }

  // Update user stats
  async updateUserStats(statsData) {
    try {
      const token = await this.currentUser?.getIdToken();
      const response = await axios.put(`${API_BASE_URL}/auth/stats`, statsData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating user stats:', error);
      throw error;
    }
  }

  // Get leaderboard
  async getLeaderboard(limit = 100) {
    try {
      const response = await axios.get(`${API_BASE_URL}/leaderboard?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      throw error;
    }
  }

  // Get current auth token
  async getAuthToken() {
    if (this.currentUser) {
      return await this.currentUser.getIdToken();
    }
    return null;
  }

  // Helper method to get user-friendly error messages
  getErrorMessage(errorCode) {
    const errorMessages = {
      'auth/user-not-found': 'No account found with this email address.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/weak-password': 'Password should be at least 6 characters long.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      'auth/network-request-failed': 'Network error. Please check your connection.',
      'auth/popup-closed-by-user': 'Sign-in popup was closed. Please try again.',
      'auth/cancelled-popup-request': 'Only one popup request is allowed at a time.',
      'auth/configuration-not-found': 'Firebase Authentication is not configured properly.',
      'auth/invalid-api-key': 'Invalid Firebase API key.',
      'auth/project-not-found': 'Firebase project not found. Please check your configuration.'
    };

    return errorMessages[errorCode] || 'An unexpected error occurred. Please try again.';
  }
}

// Create and export a singleton instance
const authService = new AuthService();
export default authService;
