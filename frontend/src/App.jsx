import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { Toaster } from 'react-hot-toast';
import { auth } from './firebaseConfig';
import './App.css';

// Import page components
import LoadingPage from './pages/LoadingPage';
import LoginPage from './pages/LoginPage';
import MainPageNew from './pages/MainPageNew'; // Updated premium main page
import ProfilePage from './pages/ProfilePage';
import LeaderboardPage from './pages/LeaderboardPage';
import ErrorPage from './pages/ErrorPage';
import SignUpPage from './pages/SignUp';
import IDEPage from './pages/IDEPage';
import CustomContestPageNew from './pages/CustomContestPageNew'; // Updated premium contest page
import ContestProblemsPage from './pages/liveContestPage';
import ProblemDetailPageNew from './pages/ProblemDetailPageNew'; // Updated premium problem page

// Import services
import apiService from './services/apiService';

// Error Boundary Component
// class ErrorBoundary extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = { hasError: false, error: null };
//   }

//   static getDerivedStateFromError(error) {
//     return { hasError: true, error };
//   }

//   componentDidCatch(error, errorInfo) {
//     console.error('App Error Boundary caught an error:', error, errorInfo);
//   }

//   render() {
//     if (this.state.hasError) {
//       return (
//         <ErrorPage 
//           error={this.state.error} 
//           onRetry={() => this.setState({ hasError: false, error: null })} 
//         />
//       );
//     }

//     return this.props.children;
//   }
// }

// // Protected Route Component
// const ProtectedRoute = ({ children, user, isLoading }) => {
//   if (isLoading) {
//     return <LoadingPage />;
//   }
  
//   if (!user) {
//     return <Navigate to="/login" replace />;
//   }
  
//   return children;
// };

// // Public Route Component (redirects to main if logged in)
// const PublicRoute = ({ children, user, isLoading }) => {
//   if (isLoading) {
//     return <LoadingPage />;
//   }
  
//   if (user) {
//     return <Navigate to="/" replace />;
//   }
  
//   return children;
// };

function App() {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Initialize API service error handler
  useEffect(() => {
    apiService.showErrorToast = (message) => {
      // Toast notifications will be handled by react-hot-toast
      console.error('API Error:', message);
    };
  }, []);

  // Set up Firebase auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Convert Firebase user to our user format
        const userData = {
          uid: firebaseUser.uid,
          id: firebaseUser.uid, // Keep both for compatibility
          username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'user',
          email: firebaseUser.email,
          name: firebaseUser.displayName || 'User',
          photoURL: firebaseUser.photoURL
        };
        setUser(userData);
      } else {
        setUser(null);
      }
      setIsAuthLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      console.log('Logging out user...');
      await auth.signOut();
      setUser(null);
      console.log('User logged out successfully');
      // No need to navigate here, the auth state change will handle routing
    } catch (error) {
      console.error('Logout error:', error);
      alert('Failed to logout. Please try again.');
    }
  };

  if (isAuthLoading) {
    return <LoadingPage />;
  }

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/login' element={<LoginPage/>}  />
          <Route path='/signup' element={<SignUpPage/>} />
          <Route path='/ide' element={<IDEPage user={user} onLogout={handleLogout} />} />
          <Route path='/customContest' element={<CustomContestPageNew user={user} onLogout={handleLogout} />} />
          <Route path='/customContest/:contestId' element={<ContestProblemsPage user={user} onLogout={handleLogout} />} />
          <Route path='/problem/:contestId/:index' element={<ProblemDetailPageNew user={user} onLogout={handleLogout} />} />
          <Route path='/profile' element={<ProfilePage user={user} onLogout={handleLogout} />} />
          <Route path='/profile/:userId' element={<ProfilePage user={user} onLogout={handleLogout} />} />
          <Route path='/leaderboard' element={<LeaderboardPage user={user} onLogout={handleLogout} />} />
          <Route path='/' element={<MainPageNew user={user} onLogout={handleLogout} />} />
        </Routes>
      </BrowserRouter>
      
      {/* Toast Notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </>
  );
}

export default App;
