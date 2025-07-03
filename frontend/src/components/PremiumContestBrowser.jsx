/**
 * PREMIUM CONTEST BROWSER - LIGHTNING FAST EXPERIENCE
 * 
 * Features:
 * - Instant contest loading via Firebase
 * - Advanced filtering and search
 * - Trending problems showcase
 * - Difficulty-based recommendations
 * - Random practice generator
 */

import React, { useState, useEffect } from 'react';
import { Search, Trophy, TrendingUp, Shuffle, Filter, Clock, Users, Star } from 'lucide-react';
import apiService from '../services/apiService';

const PremiumContestBrowser = ({ onSelectContest, onSelectProblem }) => {
    const [activeTab, setActiveTab] = useState('contests');
    const [selectedDivision, setSelectedDivision] = useState('2');
    const [contests, setContests] = useState([]);
    const [trendingProblems, setTrendingProblems] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [difficultyRange, setDifficultyRange] = useState({ min: 800, max: 2000 });

    const divisions = [
        { id: '4', name: 'Div 4', color: 'bg-green-100 text-green-800', range: '800-1400' },
        { id: '3', name: 'Div 3', color: 'bg-blue-100 text-blue-800', range: '1400-1900' },
        { id: '2', name: 'Div 2', color: 'bg-purple-100 text-purple-800', range: '1900-2400' },
        { id: '1', name: 'Div 1', color: 'bg-red-100 text-red-800', range: '2400+' }
    ];

    const tabs = [
        { id: 'contests', name: 'Contests', icon: Trophy },
        { id: 'trending', name: 'Trending', icon: TrendingUp },
        { id: 'search', name: 'Search', icon: Search },
        { id: 'practice', name: 'Practice', icon: Shuffle }
    ];

    // Load contests for selected division
    useEffect(() => {
        if (activeTab === 'contests') {
            loadContests();
        }
    }, [selectedDivision, activeTab]);

    // Load trending problems
    useEffect(() => {
        if (activeTab === 'trending') {
            loadTrendingProblems();
        }
    }, [activeTab]);

    const loadContests = async () => {
        setLoading(true);
        try {
            const response = await apiService.getContestsByDivision(selectedDivision, 15);
            setContests(response.contests || []);
        } catch (error) {
            console.error('Failed to load contests:', error);
            setContests([]);
        } finally {
            setLoading(false);
        }
    };

    const loadTrendingProblems = async () => {
        setLoading(true);
        try {
            const response = await apiService.getTrendingProblems(20);
            setTrendingProblems(response.problems || []);
        } catch (error) {
            console.error('Failed to load trending problems:', error);
            setTrendingProblems([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        
        setLoading(true);
        try {
            const response = await apiService.searchProblems(searchQuery, {
                minRating: difficultyRange.min,
                maxRating: difficultyRange.max
            });
            setSearchResults(response.problems || []);
        } catch (error) {
            console.error('Search failed:', error);
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleRandomProblem = async () => {
        setLoading(true);
        try {
            const rating = difficultyRange.min + Math.floor((difficultyRange.max - difficultyRange.min) / 2);
            const response = await apiService.getRandomProblem(rating);
            if (response.problem) {
                onSelectProblem?.(response.problem);
            }
        } catch (error) {
            console.error('Failed to get random problem:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (timestamp) => {
        return new Date(timestamp * 1000).toLocaleDateString();
    };

    const getDifficultyColor = (rating) => {
        if (rating < 1200) return 'text-green-600';
        if (rating < 1600) return 'text-blue-600';
        if (rating < 2000) return 'text-purple-600';
        if (rating < 2400) return 'text-red-600';
        return 'text-gray-800';
    };

    const renderContestCard = (contest) => (
        <div 
            key={contest.id}
            className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
            onClick={() => onSelectContest?.(contest)}
        >
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-900 text-sm">{contest.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    divisions.find(d => d.id === selectedDivision)?.color
                }`}>
                    {divisions.find(d => d.id === selectedDivision)?.name}
                </span>
            </div>
            <div className="flex items-center text-xs text-gray-600 space-x-4">
                <div className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatDate(contest.startTimeSeconds)}
                </div>
                <div className="flex items-center">
                    <Users className="w-3 h-3 mr-1" />
                    {contest.participantCount?.toLocaleString() || 'N/A'}
                </div>
            </div>
        </div>
    );

    const renderProblemCard = (problem) => (
        <div 
            key={problem.id || `${problem.contestId}-${problem.index}`}
            className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
            onClick={() => onSelectProblem?.(problem)}
        >
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-900 text-sm">{problem.name}</h3>
                <div className="flex items-center space-x-2">
                    {problem.rating && (
                        <span className={`text-xs font-medium ${getDifficultyColor(problem.rating)}`}>
                            {problem.rating}
                        </span>
                    )}
                    <Star className="w-3 h-3 text-yellow-500" />
                </div>
            </div>
            <div className="flex items-center text-xs text-gray-600 space-x-2">
                <span>Contest {problem.contestId}</span>
                <span>•</span>
                <span>Problem {problem.index}</span>
                {problem.solvedCount && (
                    <>
                        <span>•</span>
                        <span>{problem.solvedCount} solved</span>
                    </>
                )}
            </div>
            {problem.tags && problem.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                    {problem.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            {tag}
                        </span>
                    ))}
                    {problem.tags.length > 3 && (
                        <span className="text-xs text-gray-500">+{problem.tags.length - 3} more</span>
                    )}
                </div>
            )}
        </div>
    );

    return (
        <div className="bg-gray-50 rounded-xl p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Premium Contest Browser</h2>
                <p className="text-gray-600">Lightning-fast access to contests and problems</p>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-1 mb-6 bg-gray-200 rounded-lg p-1">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                activeTab === tab.id
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            <span>{tab.name}</span>
                        </button>
                    );
                })}
            </div>

            {/* Content based on active tab */}
            {activeTab === 'contests' && (
                <div>
                    {/* Division Selector */}
                    <div className="flex space-x-2 mb-4">
                        {divisions.map(div => (
                            <button
                                key={div.id}
                                onClick={() => setSelectedDivision(div.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    selectedDivision === div.id
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                                }`}
                            >
                                {div.name} ({div.range})
                            </button>
                        ))}
                    </div>

                    {/* Contests Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {loading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                                </div>
                            ))
                        ) : (
                            contests.map(renderContestCard)
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'trending' && (
                <div>
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">🔥 Trending Problems</h3>
                        <p className="text-gray-600 text-sm">Most popular problems right now</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {loading ? (
                            Array.from({ length: 9 }).map((_, i) => (
                                <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            ))
                        ) : (
                            trendingProblems.map(renderProblemCard)
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'search' && (
                <div>
                    {/* Search Controls */}
                    <div className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
                        <div className="flex space-x-4 mb-4">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    placeholder="Search problems by name, tags, or topic..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <button
                                onClick={handleSearch}
                                disabled={loading}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                            >
                                <Search className="w-4 h-4" />
                                <span>Search</span>
                            </button>
                        </div>

                        {/* Difficulty Range */}
                        <div className="flex items-center space-x-4">
                            <Filter className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700">Difficulty:</span>
                            <input
                                type="range"
                                min="800"
                                max="3500"
                                value={difficultyRange.min}
                                onChange={(e) => setDifficultyRange(prev => ({ ...prev, min: parseInt(e.target.value) }))}
                                className="flex-1"
                            />
                            <span className="text-sm text-gray-700 w-20">{difficultyRange.min} - {difficultyRange.max}</span>
                            <input
                                type="range"
                                min="800"
                                max="3500"
                                value={difficultyRange.max}
                                onChange={(e) => setDifficultyRange(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                                className="flex-1"
                            />
                        </div>
                    </div>

                    {/* Search Results */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {searchResults.map(renderProblemCard)}
                    </div>
                </div>
            )}

            {activeTab === 'practice' && (
                <div>
                    <div className="bg-white rounded-lg p-6 text-center shadow-sm border border-gray-200">
                        <Shuffle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Random Practice</h3>
                        <p className="text-gray-600 mb-4">Get a random problem based on your preferred difficulty</p>
                        
                        <div className="flex items-center justify-center space-x-4 mb-6">
                            <span className="text-sm text-gray-700">Difficulty Range:</span>
                            <input
                                type="range"
                                min="800"
                                max="3500"
                                value={difficultyRange.min}
                                onChange={(e) => setDifficultyRange(prev => ({ ...prev, min: parseInt(e.target.value) }))}
                                className="flex-1 max-w-xs"
                            />
                            <span className="text-sm text-gray-700 w-24">{difficultyRange.min} - {difficultyRange.max}</span>
                            <input
                                type="range"
                                min="800"
                                max="3500"
                                value={difficultyRange.max}
                                onChange={(e) => setDifficultyRange(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                                className="flex-1 max-w-xs"
                            />
                        </div>

                        <button
                            onClick={handleRandomProblem}
                            disabled={loading}
                            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 flex items-center space-x-2 mx-auto"
                        >
                            <Shuffle className="w-5 h-5" />
                            <span>{loading ? 'Finding Problem...' : 'Get Random Problem'}</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PremiumContestBrowser;
