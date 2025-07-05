import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    Send, 
    Clock, 
    Trophy, 
    Code, 
    Filter,
    Download,
    Eye,
    Calendar,
    Target,
    TrendingUp,
    CheckCircle,
    XCircle,
    AlertCircle,
    Search,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    FileText,
    BarChart3,
    Award,
    Zap
} from 'lucide-react';

const MySubmissionsPage = ({ user, onLogout }) => {
    const navigate = useNavigate();
    
    // Submission data
    const [submissions, setSubmissions] = useState([]);
    const [filteredSubmissions, setFilteredSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [languageFilter, setLanguageFilter] = useState('all');
    const [sortBy, setSortBy] = useState('submittedAt');
    const [sortOrder, setSortOrder] = useState('desc');
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(20);
    
    // Statistics
    const [stats, setStats] = useState({
        total: 0,
        accepted: 0,
        wrongAnswer: 0,
        timeLimit: 0,
        runtimeError: 0,
        acceptanceRate: 0
    });

    // Selected submission for viewing
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [showCodeModal, setShowCodeModal] = useState(false);

    useEffect(() => {
        loadSubmissions();
    }, [user]);

    useEffect(() => {
        filterSubmissions();
    }, [submissions, searchTerm, statusFilter, languageFilter, sortBy, sortOrder]);

    const loadSubmissions = async () => {
        try {
            setLoading(true);
            
            // Load submissions from localStorage (contest submissions)
            const contestRooms = JSON.parse(localStorage.getItem('contestRooms') || '{}');
            const allContestSubmissions = [];
            
            Object.values(contestRooms).forEach(contest => {
                const contestSubmissions = JSON.parse(localStorage.getItem(`contest_${contest.contestId}_submissions`) || '[]');
                contestSubmissions.forEach(submission => {
                    allContestSubmissions.push({
                        ...submission,
                        contestTitle: contest.title,
                        contestId: contest.contestId,
                        type: 'contest'
                    });
                });
            });

            // Load practice submissions from Firebase (if available)
            let practiceSubmissions = [];
            if (user?.uid) {
                try {
                    const response = await axios.get(`http://localhost:8000/auth/submissions/${user.uid}`, {
                        headers: {
                            'Authorization': `Bearer ${await user.getIdToken()}`
                        }
                    });
                    practiceSubmissions = response.data.submissions.map(submission => ({
                        ...submission,
                        type: 'practice'
                    }));
                } catch (error) {
                    console.warn('Could not load practice submissions:', error);
                }
            }

            const allSubmissions = [...allContestSubmissions, ...practiceSubmissions];
            setSubmissions(allSubmissions);
            calculateStats(allSubmissions);
            
        } catch (error) {
            console.error('Error loading submissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (submissions) => {
        const total = submissions.length;
        const accepted = submissions.filter(s => s.verdict === 'Accepted').length;
        const wrongAnswer = submissions.filter(s => s.verdict === 'Wrong Answer').length;
        const timeLimit = submissions.filter(s => s.verdict === 'Time Limit Exceeded').length;
        const runtimeError = submissions.filter(s => s.verdict === 'Runtime Error').length;
        const acceptanceRate = total > 0 ? Math.round((accepted / total) * 100) : 0;

        setStats({
            total,
            accepted,
            wrongAnswer,
            timeLimit,
            runtimeError,
            acceptanceRate
        });
    };

    const filterSubmissions = () => {
        let filtered = [...submissions];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(submission => 
                submission.problemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                submission.problemIndex?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                submission.contestTitle?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(submission => submission.verdict === statusFilter);
        }

        // Language filter
        if (languageFilter !== 'all') {
            filtered = filtered.filter(submission => submission.language === languageFilter);
        }

        // Sort
        filtered.sort((a, b) => {
            let aValue = a[sortBy];
            let bValue = b[sortBy];
            
            if (sortBy === 'submittedAt') {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            }
            
            if (sortOrder === 'desc') {
                return bValue > aValue ? 1 : -1;
            } else {
                return aValue > bValue ? 1 : -1;
            }
        });

        setFilteredSubmissions(filtered);
        setCurrentPage(1);
    };

    const getVerdictColor = (verdict) => {
        switch (verdict) {
            case 'Accepted': return 'text-green-500 bg-green-500/10';
            case 'Wrong Answer': return 'text-red-500 bg-red-500/10';
            case 'Time Limit Exceeded': return 'text-yellow-500 bg-yellow-500/10';
            case 'Runtime Error': return 'text-orange-500 bg-orange-500/10';
            case 'Pending': return 'text-blue-500 bg-blue-500/10';
            default: return 'text-gray-500 bg-gray-500/10';
        }
    };

    const getVerdictIcon = (verdict) => {
        switch (verdict) {
            case 'Accepted': return <CheckCircle className="w-4 h-4" />;
            case 'Wrong Answer': return <XCircle className="w-4 h-4" />;
            case 'Time Limit Exceeded': return <Clock className="w-4 h-4" />;
            case 'Runtime Error': return <AlertCircle className="w-4 h-4" />;
            case 'Pending': return <Clock className="w-4 h-4 animate-spin" />;
            default: return <AlertCircle className="w-4 h-4" />;
        }
    };

    const getUniqueLanguages = () => {
        const languages = [...new Set(submissions.map(s => s.language))];
        return languages.filter(Boolean);
    };

    const getUniqueVerdicts = () => {
        const verdicts = [...new Set(submissions.map(s => s.verdict))];
        return verdicts.filter(Boolean);
    };

    const viewSubmissionCode = (submission) => {
        setSelectedSubmission(submission);
        setShowCodeModal(true);
    };

    const downloadSubmission = (submission) => {
        const element = document.createElement('a');
        const file = new Blob([submission.code], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `${submission.problemIndex}_${submission.language}_${new Date(submission.submittedAt).getTime()}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    // Pagination
    const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentSubmissions = filteredSubmissions.slice(startIndex, endIndex);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white text-xl">Loading submissions...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header */}
            <div className="bg-gray-800 border-b border-gray-700 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button 
                                onClick={() => navigate('/')}
                                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                                <span>Back to Home</span>
                            </button>
                            <div className="flex items-center space-x-3">
                                <Send className="w-8 h-8 text-blue-400" />
                                <div>
                                    <h1 className="text-2xl font-bold">My Submissions</h1>
                                    <p className="text-gray-400">Track your coding progress</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <div className="bg-gray-700 rounded-lg p-4">
                                <div className="flex items-center space-x-2">
                                    <Trophy className="w-5 h-5 text-yellow-500" />
                                    <span className="font-medium">Acceptance Rate</span>
                                </div>
                                <div className="text-2xl font-bold text-green-400">{stats.acceptanceRate}%</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="max-w-7xl mx-auto p-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    <div className="bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                            <BarChart3 className="w-5 h-5 text-blue-400" />
                            <span className="text-sm text-gray-400">Total</span>
                        </div>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </div>
                    
                    <div className="bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            <span className="text-sm text-gray-400">Accepted</span>
                        </div>
                        <div className="text-2xl font-bold text-green-400">{stats.accepted}</div>
                    </div>
                    
                    <div className="bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                            <XCircle className="w-5 h-5 text-red-400" />
                            <span className="text-sm text-gray-400">Wrong Answer</span>
                        </div>
                        <div className="text-2xl font-bold text-red-400">{stats.wrongAnswer}</div>
                    </div>
                    
                    <div className="bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                            <Clock className="w-5 h-5 text-yellow-400" />
                            <span className="text-sm text-gray-400">Time Limit</span>
                        </div>
                        <div className="text-2xl font-bold text-yellow-400">{stats.timeLimit}</div>
                    </div>
                    
                    <div className="bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                            <AlertCircle className="w-5 h-5 text-orange-400" />
                            <span className="text-sm text-gray-400">Runtime Error</span>
                        </div>
                        <div className="text-2xl font-bold text-orange-400">{stats.runtimeError}</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-gray-800 rounded-lg p-4 mb-6">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center space-x-2">
                            <Search className="w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search problems..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Statuses</option>
                            {getUniqueVerdicts().map(verdict => (
                                <option key={verdict} value={verdict}>{verdict}</option>
                            ))}
                        </select>
                        
                        <select
                            value={languageFilter}
                            onChange={(e) => setLanguageFilter(e.target.value)}
                            className="bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Languages</option>
                            {getUniqueLanguages().map(language => (
                                <option key={language} value={language}>{language.toUpperCase()}</option>
                            ))}
                        </select>
                        
                        <select
                            value={`${sortBy}-${sortOrder}`}
                            onChange={(e) => {
                                const [field, order] = e.target.value.split('-');
                                setSortBy(field);
                                setSortOrder(order);
                            }}
                            className="bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="submittedAt-desc">Newest First</option>
                            <option value="submittedAt-asc">Oldest First</option>
                            <option value="problemIndex-asc">Problem A-Z</option>
                            <option value="problemIndex-desc">Problem Z-A</option>
                        </select>
                    </div>
                </div>

                {/* Submissions Table */}
                <div className="bg-gray-800 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Problem
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Language
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Verdict
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Time
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Submitted
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {currentSubmissions.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                                            <Send className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                            <p className="text-lg">No submissions found</p>
                                            <p className="text-sm">Start solving problems to see your submissions here!</p>
                                        </td>
                                    </tr>
                                ) : (
                                    currentSubmissions.map((submission) => (
                                        <tr key={submission.id} className="hover:bg-gray-700/50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="font-medium">
                                                            {submission.problemIndex}
                                                        </span>
                                                        <span className="text-gray-400">
                                                            {submission.problemName}
                                                        </span>
                                                    </div>
                                                    {submission.contestTitle && (
                                                        <div className="text-sm text-gray-500 mt-1">
                                                            {submission.contestTitle}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="bg-gray-600 text-xs px-2 py-1 rounded">
                                                    {submission.language?.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center space-x-2 px-2 py-1 rounded text-xs font-medium ${getVerdictColor(submission.verdict)}`}>
                                                    {getVerdictIcon(submission.verdict)}
                                                    <span>{submission.verdict}</span>
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                                {submission.timeUsed ? `${submission.timeUsed}ms` : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                                {new Date(submission.submittedAt).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => viewSubmissionCode(submission)}
                                                        className="text-blue-400 hover:text-blue-300 transition-colors"
                                                        title="View Code"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => downloadSubmission(submission)}
                                                        className="text-green-400 hover:text-green-300 transition-colors"
                                                        title="Download"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6">
                        <div className="text-sm text-gray-400">
                            Showing {startIndex + 1} to {Math.min(endIndex, filteredSubmissions.length)} of {filteredSubmissions.length} submissions
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setCurrentPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 px-3 py-2 rounded-lg transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                <span>Previous</span>
                            </button>
                            
                            <div className="flex items-center space-x-1">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`px-3 py-2 rounded-lg transition-colors ${
                                            currentPage === i + 1
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            
                            <button
                                onClick={() => setCurrentPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 px-3 py-2 rounded-lg transition-colors"
                            >
                                <span>Next</span>
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Code Modal */}
            {showCodeModal && selectedSubmission && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold">
                                {selectedSubmission.problemIndex} - {selectedSubmission.problemName}
                            </h3>
                            <button
                                onClick={() => setShowCodeModal(false)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="mb-4">
                            <div className="flex items-center space-x-4 text-sm text-gray-400">
                                <span>{selectedSubmission.language?.toUpperCase()}</span>
                                <span className={getVerdictColor(selectedSubmission.verdict)}>
                                    {selectedSubmission.verdict}
                                </span>
                                <span>{new Date(selectedSubmission.submittedAt).toLocaleString()}</span>
                            </div>
                        </div>
                        
                        <div className="bg-gray-900 rounded-lg p-4">
                            <pre className="text-sm text-gray-300 overflow-x-auto">
                                <code>{selectedSubmission.code}</code>
                            </pre>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MySubmissionsPage;
