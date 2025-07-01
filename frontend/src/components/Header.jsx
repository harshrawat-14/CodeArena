import React, { useState } from 'react';

const Header = ({ user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getRatingColor = (rating) => {
    if (rating >= 2100) return 'text-red-600';
    if (rating >= 1900) return 'text-orange-500';
    if (rating >= 1600) return 'text-purple-600';
    if (rating >= 1400) return 'text-blue-600';
    if (rating >= 1200) return 'text-green-600';
    return 'text-gray-600';
  };

  return (
    <header className="relative bg-white/95 glass-morphism backdrop-blur-xl shadow-2xl border-b border-white/20">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 animate-gradient-x"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center group" data-aos="fade-right">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-500 premium-shadow">
                <span className="text-white font-bold text-xl animate-pulse">&lt;/&gt;</span>
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent font-display">
                  CodeArena
                </h1>
                <p className="text-xs text-gray-500 -mt-1 font-medium">Elite Programming Platform</p>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex space-x-2" data-aos="fade-down" data-aos-delay="200">
              <a href="#" className="group relative px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-all duration-300 rounded-lg hover:bg-blue-50/50">
                <span className="relative z-10">Problemset</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-blue-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </a>
              <a href="#" className="group relative px-4 py-2 text-gray-700 hover:text-purple-600 font-medium transition-all duration-300 rounded-lg hover:bg-purple-50/50">
                <span className="relative z-10">Contests</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-purple-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </a>
              <a href="#" className="group relative px-4 py-2 text-gray-700 hover:text-pink-600 font-medium transition-all duration-300 rounded-lg hover:bg-pink-50/50">
                <span className="relative z-10">Gym</span>
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/0 to-pink-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </a>
              <a href="#" className="relative px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden group">
                <span className="relative z-10">IDE</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </a>
            </nav>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-6" data-aos="fade-left" data-aos-delay="300">
            {/* Notifications */}
            <button className="group relative p-3 text-gray-400 hover:text-blue-600 transition-all duration-300 rounded-lg hover:bg-blue-50/50">
              <svg className="h-6 w-6 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5V8a3 3 0 016 0v9z" />
              </svg>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            </button>

            {/* User Profile */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="group flex items-center space-x-3 text-sm bg-white/50 glass-morphism rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/30 premium-shadow hover:shadow-2xl transition-all duration-500 p-2"
              >
                <div className="flex items-center space-x-3 px-2 py-1">
                  <div className="relative w-10 h-10 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transform group-hover:scale-110 transition-all duration-300">
                    <span className="text-white font-bold text-sm">
                      {user.username?.charAt(0).toUpperCase() || user.name?.charAt(0).toUpperCase()}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl"></div>
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold text-gray-900">{user.username || user.name}</p>
                    <p className={`text-xs font-medium ${getRatingColor(user.rating || 1200)} flex items-center`}>
                      <span className="w-2 h-2 rounded-full bg-current mr-1 animate-pulse"></span>
                      {user.rank || 'Newbie'} ({user.rating || 1200})
                    </p>
                  </div>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Enhanced Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-3 w-72 bg-white/95 glass-morphism backdrop-blur-xl rounded-2xl shadow-2xl premium-shadow border border-white/20 z-50 overflow-hidden animate-fadeIn">
                  <div className="py-2">
                    <div className="px-6 py-4 border-b border-gray-100/50 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold">
                            {user.username?.charAt(0).toUpperCase() || user.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          <div className="flex items-center mt-1">
                            <span className={`text-xs font-medium ${getRatingColor(user.rating || 1200)} flex items-center`}>
                              <span className="w-2 h-2 rounded-full bg-current mr-1"></span>
                              {user.rank || 'Newbie'}
                            </span>
                            <span className="text-xs text-gray-400 ml-2">Rating: {user.rating || 1200}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <a href="#" className="group flex items-center px-6 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-300">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-200 transition-colors">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium">Profile</div>
                        <div className="text-xs text-gray-500">Manage your account</div>
                      </div>
                    </a>
                    
                    <a href="#" className="group flex items-center px-6 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 transition-all duration-300">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-purple-200 transition-colors">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium">Submissions</div>
                        <div className="text-xs text-gray-500">View your solutions</div>
                      </div>
                    </a>
                    
                    <a href="#" className="group flex items-center px-6 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-pink-50/50 hover:to-red-50/50 transition-all duration-300">
                      <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-pink-200 transition-colors">
                        <svg className="w-4 h-4 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium">Settings</div>
                        <div className="text-xs text-gray-500">Preferences & more</div>
                      </div>
                    </a>
                    
                    <div className="border-t border-gray-100/50 mt-2">
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          onLogout();
                        }}
                        className="group w-full flex items-center px-6 py-3 text-sm text-red-700 hover:bg-gradient-to-r hover:from-red-50/50 hover:to-pink-50/50 transition-all duration-300"
                      >
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-red-200 transition-colors">
                          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium">Sign out</div>
                          <div className="text-xs text-gray-500">End your session</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
