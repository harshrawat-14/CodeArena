import React, { useState } from 'react';
import { auth } from "../firebaseConfig";
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Sign in with email and password
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      
      console.log('Login successful, redirecting to profile...');
      navigate('/profile');
    } catch (error) {
      console.error('Authentication error:', error);
      if (error.code === 'auth/user-not-found') {
        setError("No account found with this email. Please sign up first.");
      } else if (error.code === 'auth/wrong-password') {
        setError("Incorrect password. Please try again.");
      } else if (error.code === 'auth/invalid-email') {
        setError("Invalid email address.");
      } else {
        setError(error.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const googleProvider = new GoogleAuthProvider();
  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      console.log('Google login successful, redirecting to profile...');
      navigate("/profile");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-purple-900">
      <div className="relative w-full">
        {/* Animated Background Effects */}
        <div className="fixed inset-0 aurora-bg opacity-20"></div>
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900/50 via-purple-900/30 to-slate-900/50"></div>
        
        {/* Floating Particles */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-blue-400/30 rounded-full animate-float"></div>
          <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-purple-400/30 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-1/4 left-1/3 w-5 h-5 bg-pink-400/30 rounded-full animate-float" style={{animationDelay: '4s'}}></div>
          <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-cyan-400/30 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-1/3 right-1/4 w-6 h-6 bg-indigo-400/30 rounded-full animate-float" style={{animationDelay: '3s'}}></div>
        </div>

        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>

        {/* Main Content */}
        <div className="relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold gradient-text mb-4">
              Welcome Back to CodeJudge
            </h1>
            <p className="text-xl text-slate-300 mb-2">
              Sign in to access your coding dashboard
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-slate-400">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                Real-time Code Execution
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></div>
                AI-Powered Code Review
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-400 rounded-full mr-2 animate-pulse"></div>
                Global Leaderboards
              </div>
            </div>
          </div>
          
          {/* Login Card */}
          <div className="flex items-center justify-center p-4">
            <div className="w-full max-w-md">
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 hover:shadow-purple-500/20 transition-all duration-500">
                {/* Logo/Title */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                    Sign In
                  </h2>
                  <p className="text-white/70 mt-2">
                    Welcome back! Please sign in to your account
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 text-sm backdrop-blur-sm">
                    {error}
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 backdrop-blur-sm transition-all duration-300"
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 backdrop-blur-sm transition-all duration-300"
                      placeholder="Enter your password"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing In...
                      </div>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                </form>

                {/* Google Sign In */}
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/20"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-transparent text-white/60">Or continue with</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="mt-4 w-full flex items-center justify-center px-4 py-3 border border-white/20 rounded-xl bg-white/10 text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm transition-all duration-300"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Sign in with Google
                  </button>
                </div>

                {/* Sign Up Link */}
                <div className="mt-6 text-center">
                  <p className="text-white/60">
                    Don't have an account?
                    <button
                      type="button"
                      onClick={() => navigate('/signup')}
                      className="ml-2 text-purple-300 hover:text-purple-200 font-medium transition-colors duration-300"
                    >
                      Sign up
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Additional Information */}
          <div className="mt-12 text-center">
            <div className="max-w-4xl mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="text-3xl mb-4">🚀</div>
                  <h3 className="text-lg font-semibold text-white mb-2">Lightning Fast</h3>
                  <p className="text-slate-300 text-sm">Execute your code in milliseconds with our optimized judge system</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="text-3xl mb-4">🧠</div>
                  <h3 className="text-lg font-semibold text-white mb-2">AI Assistant</h3>
                  <p className="text-slate-300 text-sm">Get intelligent code reviews and optimization suggestions</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="text-3xl mb-4">🏆</div>
                  <h3 className="text-lg font-semibold text-white mb-2">Compete</h3>
                  <p className="text-slate-300 text-sm">Join contests and climb the global leaderboards</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;