/**
 * PREMIUM CUSTOM CONTEST PAGE - ENHANCED EXPERIENCE
 * 
 * Features:
 * - Lightning-fast contest loading via Firebase
 * - Instant problem data with test cases
 * - Enhanced UI with smooth animations
 * - Smart contest recommendations
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Users, Clock, Star, Zap, ArrowRight, Search } from 'lucide-react';
import Header from '../components/Header';
import apiService from '../services/apiService';

const PremiumCustomContestPage = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedDivision, setSelectedDivision] = useState('2');
  const [contestTitle, setContestTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [systemHealth, setSystemHealth] = useState(null);

  const divisions = [
    { 
      id: '4', 
      name: 'Division 4', 
      description: 'Perfect for beginners learning algorithms', 
      color: 'bg-gradient-to-r from-green-400 to-green-600', 
      difficulty: 'Beginner',
      range: '800-1400',
      icon: '🌱'
    },
    { 
      id: '3', 
      name: 'Division 3', 
      description: 'Intermediate challenges for growing skills', 
      color: 'bg-gradient-to-r from-blue-400 to-blue-600', 
      difficulty: 'Intermediate',
      range: '1400-1900',
      icon: '🚀'
    },
    { 
      id: '2', 
      name: 'Division 2', 
      description: 'Advanced problems for experienced coders', 
      color: 'bg-gradient-to-r from-purple-400 to-purple-600', 
      difficulty: 'Advanced',
      range: '1900-2400',
      icon: '⚡'
    },
    { 
      id: '1', 
      name: 'Division 1', 
      description: 'Expert-level challenges for masters', 
      color: 'bg-gradient-to-r from-red-400 to-red-600', 
      difficulty: 'Expert',
      range: '2400+',
      icon: '👑'
    }
  ];

  // Load system health and contests on mount
  useEffect(() => {
    checkSystemHealth();
    if (selectedDivision) {
      loadContests();
    }
  }, [selectedDivision]);

  const checkSystemHealth = async () => {
    try {
      const health = await apiService.getSystemHealth();
      setSystemHealth(health);
    } catch (error) {
      console.error('Failed to check system health:', error);
    }
  };

  const loadContests = async () => {
    setLoading(true);
    try {
      const response = await apiService.getContestsByDivision(selectedDivision, 10);
      setContests(response.contests || []);
    } catch (error) {
      console.error('Failed to load contests:', error);
      setContests([]);
    } finally {
      setLoading(false);
    }
  };

  const generateRoomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const storeContestData = (roomCode, contestData) => {
    const existingContests = JSON.parse(localStorage.getItem('contestRooms') || '{}');
    existingContests[roomCode] = {
      ...contestData,
      createdAt: new Date().toISOString(),
      participants: []
    };
    localStorage.setItem('contestRooms', JSON.stringify(existingContests));
  };

  const handleCreateContest = async () => {
    if (!selectedDivision || !contestTitle) {
      alert('Please fill in all required fields');
      return;
    }

    setIsCreating(true);
    
    try {
      const division = divisions.find(d => d.id === selectedDivision);
      console.log(`Creating contest with Division ${division.id}...`);
      
      // Get contests from our premium API
      const response = await apiService.getContestsByDivision(selectedDivision, 20);
      const availableContests = response.contests || [];
      
      if (availableContests.length === 0) {
        throw new Error(`No Division ${division.id} contests available`);
      }

      // Select a random recent contest
      const selectedContest = availableContests[Math.floor(Math.random() * Math.min(5, availableContests.length))];
      
      console.log(`Selected contest: ${selectedContest.name}`);
      
      // Get problems for the selected contest
      const problemsResponse = await apiService.getContestProblems(selectedContest.id);
      const problems = problemsResponse.problems || [];
      
      if (problems.length === 0) {
        throw new Error('No problems found for this contest');
      }

      console.log(`Found ${problems.length} problems`);

      // Generate room code and create contest data
      const roomCode = generateRoomCode();
      const contestData = {
        roomCode,
        title: contestTitle,
        division: division.id,
        divisionName: division.name,
        originalContest: selectedContest,
        problems: problems.slice(0, 5), // Limit to 5 problems for custom contest
        createdBy: user?.username || user?.email || 'Anonymous',
        difficulty: division.difficulty,
        estimatedTime: '2-3 hours'
      };

      // Store contest data
      storeContestData(roomCode, contestData);

      console.log(`Contest created successfully with room code: ${roomCode}`);
      
      // Navigate to the contest
      navigate(`/customContest/${roomCode}`);
      
    } catch (error) {
      console.error('Error creating contest:', error);
      alert(`Failed to create contest: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinExistingContest = (contest) => {
    navigate(`/customContest/${contest.id}`);
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderContestCard = (contest) => (
    <div 
      key={contest.id}
      className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 border border-gray-100"
      onClick={() => handleJoinExistingContest(contest)}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">{contest.name}</h3>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {formatDate(contest.startTimeSeconds)}
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              {contest.participantCount?.toLocaleString() || 'N/A'}
            </div>
          </div>
        </div>
        <div className="ml-4">
          <span className={`px-3 py-1 rounded-full text-white text-xs font-medium ${
            divisions.find(d => d.id === selectedDivision)?.color.replace('bg-gradient-to-r', 'bg')
          }`}>
            Div {selectedDivision}
          </span>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Star className="w-4 h-4 text-yellow-500" />
          <span className="text-sm text-gray-600">Ready to solve</span>
        </div>
        <ArrowRight className="w-5 h-5 text-blue-600" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header user={user} onLogout={onLogout} />

      {/* System Health Status */}
      {systemHealth && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex">
            <Zap className="h-5 w-5 text-green-400 mt-0.5" />
            <div className="ml-3">
              <p className="text-sm text-green-700">
                🚀 Premium API v{systemHealth.version} - Lightning fast contest loading enabled
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Premium <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Contest Arena</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience lightning-fast contest creation with our premium scraping technology. 
            Instant access to thousands of problems with complete test cases.
          </p>
        </div>

        {!selectedAction ? (
          /* Action Selection */
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Create Contest */}
              <div 
                className="bg-white rounded-2xl shadow-xl p-8 cursor-pointer transform hover:scale-105 transition-all duration-300 border border-gray-100"
                onClick={() => setSelectedAction('create')}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Create Contest</h2>
                  <p className="text-gray-600 mb-6">
                    Create a custom contest with problems from any Codeforces division. 
                    Powered by our premium scraping engine for instant problem loading.
                  </p>
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium">
                    Get Started →
                  </div>
                </div>
              </div>

              {/* Browse Contests */}
              <div 
                className="bg-white rounded-2xl shadow-xl p-8 cursor-pointer transform hover:scale-105 transition-all duration-300 border border-gray-100"
                onClick={() => setSelectedAction('browse')}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Browse Contests</h2>
                  <p className="text-gray-600 mb-6">
                    Explore recent Codeforces contests with instant loading. 
                    All problems pre-scraped and ready for immediate solving.
                  </p>
                  <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-lg font-medium">
                    Browse Now →
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : selectedAction === 'create' ? (
          /* Create Contest Form */
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <Trophy className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Your Contest</h2>
                <p className="text-gray-600">Set up a custom contest with premium features</p>
              </div>

              <div className="space-y-6">
                {/* Contest Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contest Title
                  </label>
                  <input
                    type="text"
                    value={contestTitle}
                    onChange={(e) => setContestTitle(e.target.value)}
                    placeholder="Enter your contest title..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Division Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Select Division
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {divisions.map(division => (
                      <div
                        key={division.id}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedDivision === division.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedDivision(division.id)}
                      >
                        <div className="flex items-center mb-2">
                          <span className="text-2xl mr-3">{division.icon}</span>
                          <div>
                            <h3 className="font-semibold text-gray-900">{division.name}</h3>
                            <p className="text-sm text-gray-600">{division.range}</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{division.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Create Button */}
                <button
                  onClick={handleCreateContest}
                  disabled={isCreating || !contestTitle || !selectedDivision}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {isCreating ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating Contest...
                    </div>
                  ) : (
                    'Create Contest'
                  )}
                </button>

                <button
                  onClick={() => setSelectedAction(null)}
                  className="w-full py-3 text-gray-600 font-medium hover:text-gray-800 transition-colors"
                >
                  ← Back to Options
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Browse Contests */
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <Search className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Browse Recent Contests</h2>
              <p className="text-gray-600">Select a division to see available contests</p>
            </div>

            {/* Division Selector */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {divisions.map(division => (
                <button
                  key={division.id}
                  onClick={() => setSelectedDivision(division.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                    selectedDivision === division.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <span>{division.icon}</span>
                  <span>{division.name}</span>
                  <span className="text-sm opacity-75">({division.range})</span>
                </button>
              ))}
            </div>

            {/* Contests Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))
              ) : contests.length > 0 ? (
                contests.map(renderContestCard)
              ) : (
                <div className="col-span-full text-center py-12">
                  <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No contests available</h3>
                  <p className="text-gray-500">Try selecting a different division</p>
                </div>
              )}
            </div>

            <div className="text-center">
              <button
                onClick={() => setSelectedAction(null)}
                className="px-6 py-3 text-gray-600 font-medium hover:text-gray-800 transition-colors"
              >
                ← Back to Options
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PremiumCustomContestPage;
