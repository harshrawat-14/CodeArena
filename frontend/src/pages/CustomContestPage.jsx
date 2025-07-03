import React, { useState } from 'react';
import Header from '../components/Header';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CustomContestPage = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [selectedAction, setSelectedAction] = useState(null); // 'join' or 'create'
  const [selectedDivision, setSelectedDivision] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [contestTitle, setContestTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const divisions = [
    { id: 'div4', name: 'Division 4', description: 'Beginner level (800-1400 rating)', color: 'bg-green-500', difficulty: 'Easy', divNumber: 4 },
    { id: 'div3', name: 'Division 3', description: 'Intermediate level (1400-1900 rating)', color: 'bg-blue-500', difficulty: 'Medium', divNumber: 3 },
    { id: 'div2', name: 'Division 2', description: 'Advanced level (1900-2400 rating)', color: 'bg-purple-500', difficulty: 'Hard', divNumber: 2 },
    { id: 'div1', name: 'Division 1', description: 'Expert level (2400+ rating)', color: 'bg-red-500', difficulty: 'Expert', divNumber: 1 }
  ];

  // Generate a random 6-character room code
  const generateRoomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Store contest data in localStorage (in a real app, this would be in a database)
  const storeContestData = (roomCode, contestData) => {
    const existingContests = JSON.parse(localStorage.getItem('contestRooms') || '{}');
    existingContests[roomCode] = {
      ...contestData,
      createdAt: new Date().toISOString(),
      participants: []
    };
    localStorage.setItem('contestRooms', JSON.stringify(existingContests));
  };

  // Retrieve contest data by room code
  const getContestByRoomCode = (roomCode) => {
    const existingContests = JSON.parse(localStorage.getItem('contestRooms') || '{}');
    return existingContests[roomCode] || null;
  };

  // Fetch problem statement from backend scraping service
  const fetchProblemStatements = async (problems) => {
    try {
      console.log('Fetching problem statements from backend...');
      
      const response = await axios.post('http://localhost:8000/api/scrape-contest-problems', {
        contestId: problems[0].contestId,
        problems: problems
      });
      
      if (response.data.success) {
        console.log('Successfully fetched problem statements:', response.data.problems.length);
        return response.data.problems;
      } else {
        throw new Error(response.data.error || 'Failed to fetch problem statements');
      }
    } catch (error) {
      console.error('Error fetching problem statements:', error);
      
      // Fallback: return original problems with basic statement
      return problems.map(problem => ({
        ...problem,
        statement: `Problem ${problem.index}. ${problem.name}\n\nComplete problem statement available on Codeforces. Click "View Problem" to see full details.`,
        problemUrl: `https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`,
        timeLimit: "2 seconds",
        memoryLimit: "256 megabytes",
        hasFullStatement: false
      }));
    }
  };

  const handleCreateContest = async () => {
    if (!selectedDivision || !contestTitle) {
      alert('Please fill in all required fields');
      return;
    }

    setIsCreating(true);
    
    try {
      const division = divisions.find(d => d.id === selectedDivision);
      
      console.log('Fetching contests from Codeforces...');
      
      // Fetch recent contests from Codeforces API
      const response = await axios.get('https://codeforces.com/api/contest.list');
      const contests = response.data.result;
      
      // Filter contests by division and get the most recent finished one
      const divisionContests = contests.filter(contest => 
        contest.phase === "FINISHED" && 
        contest.name.includes(`Div. ${division.divNumber}`)
      );
      
      if (divisionContests.length === 0) {
        throw new Error(`No Div. ${division.divNumber} contests found`);
      }
      
      const recentContest = divisionContests[0]; // Most recent contest
      console.log('Selected contest:', recentContest);
      
      // Fetch problems for this contest
      console.log('Fetching problems...');
      const problemsResponse = await axios.get(
        `https://codeforces.com/api/contest.standings?contestId=${recentContest.id}&from=1&count=1`
      );
      
      const problems = problemsResponse.data.result.problems;
      console.log('Found problems:', problems);
      
      // Fetch problem statements using backend scraping service
      console.log('Fetching problem statements...');
      const problemsWithStatements = await fetchProblemStatements(problems);
      
      const roomCode = generateRoomCode();
      const contestId = `${selectedDivision}_${Date.now()}`;
      
      // Store contest data with problem statements
      const contestData = {
        contestId,
        roomCode,
        title: contestTitle,
        division: selectedDivision,
        divisionName: division.name,
        codeforcesContestId: recentContest.id,
        codeforcesContestName: recentContest.name,
        problems: problemsWithStatements,
        creator: user?.email || 'Anonymous',
        status: 'active',
        createdAt: new Date().toISOString()
      };
      
      storeContestData(roomCode, contestData);
      
      console.log('Contest created successfully:', contestData);
      console.log('Navigating to:', `/customContest/${contestId}`);
      console.log('Room Code:', roomCode);
      
      // Show success message with room code
      alert(`Contest "${contestTitle}" created successfully!\n\nRoom Code: ${roomCode}\nProblems: ${problemsWithStatements.length}\n\nShare this room code with participants!`);
      
      // Set loading to false before navigation
      setIsCreating(false);
      
      // Navigate to the contest problems page
      navigate(`/customContest/${contestId}`, { replace: true });
      
    } catch (error) {
      console.error("Error creating contest:", error);
      alert(`Failed to create contest: ${error.message}`);
      setIsCreating(false);
    }
  };

  const handleJoinContest = () => {
    if (!roomCode) {
      alert('Please enter a room code');
      return;
    }
    
    const contestData = getContestByRoomCode(roomCode);
    
    if (!contestData) {
      alert(`Contest with room code "${roomCode}" not found. Please check the code and try again.`);
      return;
    }
    
    // Add user to participants (in a real app, this would update the database)
    const existingContests = JSON.parse(localStorage.getItem('contestRooms') || '{}');
    if (existingContests[roomCode]) {
      const userEmail = user?.email || 'Anonymous';
      if (!existingContests[roomCode].participants.includes(userEmail)) {
        existingContests[roomCode].participants.push(userEmail);
        localStorage.setItem('contestRooms', JSON.stringify(existingContests));
      }
    }
    
    console.log('Joining contest:', contestData);
    alert(`Successfully joined contest: ${contestData.title}`);
    
    // Navigate to the contest problems page
    navigate(`/customContest/${contestData.contestId}`);
  };

  const resetSelection = () => {
    setSelectedAction(null);
    setSelectedDivision('');
    setRoomCode('');
    setContestTitle('');
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
              🏆 Custom Contest Arena
            </h1>
            <p className="text-xl text-slate-300">
              Create or join coding contests with friends and compete together!
            </p>
          </div>

          {/* Debug info */}
          <div className="mb-8 p-4 bg-blue-500/20 rounded-xl text-center">
            <p className="text-white">
              Selected Action: {selectedAction || 'None'} | 
              Division: {selectedDivision || 'None'} | 
              Room Code: {roomCode || 'None'} | 
              Creating: {isCreating ? 'Yes' : 'No'}
            </p>
          </div>

          {!selectedAction ? (
            /* Initial Selection: Join or Create */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Join Contest Card */}
              <div 
                onClick={() => setSelectedAction('join')}
                className="group bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 hover:bg-white/15 transition-all duration-500 cursor-pointer transform hover:-translate-y-2 hover:shadow-3xl"
              >
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Join Contest</h3>
                  <p className="text-slate-300 mb-6">
                    Enter a room code to join an existing contest created by your friends
                  </p>
                  <div className="bg-blue-500/20 rounded-xl p-4 border border-blue-400/30">
                    <div className="flex items-center justify-center space-x-2 text-blue-300">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-6 6c-3 0-5.5-1.5-5.5-4a3.5 3.5 0 00-3.5-3.5M9 10a6 6 0 016-6c1.654 0 3.15.63 4.27 1.66" />
                      </svg>
                      <span className="font-medium">Quick & Easy</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Create Contest Card */}
              <div 
                onClick={() => setSelectedAction('create')}
                className="group bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 hover:bg-white/15 transition-all duration-500 cursor-pointer transform hover:-translate-y-2 hover:shadow-3xl"
              >
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Create Contest</h3>
                  <p className="text-slate-300 mb-6">
                    Set up a new contest for your friends with custom difficulty levels
                  </p>
                  <div className="bg-pink-500/20 rounded-xl p-4 border border-pink-400/30">
                    <div className="flex items-center justify-center space-x-2 text-pink-300">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span className="font-medium">Full Control</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : selectedAction === 'join' ? (
            /* Join Contest Form */
            <div className="max-w-md mx-auto">
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Join Contest</h3>
                  <p className="text-slate-300">Enter the room code provided by the contest host</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Room Code
                    </label>
                    <input
                      type="text"
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                      placeholder="Enter 6-digit room code"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      maxLength={6}
                    />
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={resetSelection}
                      className="flex-1 px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-xl transition-all duration-300"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleJoinContest}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-all duration-300"
                    >
                      Join Contest
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Create Contest Form */
            <div className="max-w-2xl mx-auto">
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Create Contest</h3>
                  <p className="text-slate-300">Set up your custom contest parameters</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Contest Title
                    </label>
                    <input
                      type="text"
                      value={contestTitle}
                      onChange={(e) => setContestTitle(e.target.value)}
                      placeholder="Enter contest name"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-4">
                      Select Division
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {divisions.map((division) => (
                        <div
                          key={division.id}
                          onClick={() => setSelectedDivision(division.id)}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                            selectedDivision === division.id
                              ? 'border-white bg-white/20'
                              : 'border-white/20 bg-white/5 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${division.color}`}></div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-white">{division.name}</h4>
                              <p className="text-xs text-slate-400">{division.description}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              division.difficulty === 'Easy' ? 'bg-green-500/20 text-green-300' :
                              division.difficulty === 'Medium' ? 'bg-blue-500/20 text-blue-300' :
                              division.difficulty === 'Hard' ? 'bg-purple-500/20 text-purple-300' :
                              'bg-red-500/20 text-red-300'
                            }`}>
                              {division.difficulty}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={resetSelection}
                      className="flex-1 px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-xl transition-all duration-300"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleCreateContest}
                      disabled={isCreating}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-300 flex items-center justify-center"
                    >
                      {isCreating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating...
                        </>
                      ) : (
                        'Create Contest'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomContestPage;
