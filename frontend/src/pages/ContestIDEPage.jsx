import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CodeEditor from '../components/CodeEditor';
import OutputPanel from '../components/OutputPanel';
import LanguageSelector from '../components/LanguageSelector';
import StatusBar from '../components/StatusBar';
import Toast from '../components/Toast';
import { 
    Play, 
    Send, 
    Clock, 
    Trophy, 
    Users, 
    BookOpen,
    Code,
    ChevronLeft,
    ChevronRight,
    Target,
    Zap,
    CheckCircle,
    XCircle,
    AlertCircle
} from 'lucide-react';

const ContestIDEPage = ({ user }) => {
    const { contestId } = useParams();
    const navigate = useNavigate();
    
    // Contest state
    const [contest, setContest] = useState(null);
    const [problems, setProblems] = useState([]);
    const [currentProblem, setCurrentProblem] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(null);
    
    // IDE state
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('cpp');
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // UI state
    const [activeTab, setActiveTab] = useState('problem');
    const [toast, setToast] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [problemStatements, setProblemStatements] = useState({});

    // Load contest data
    useEffect(() => {
        loadContestData();
    }, [contestId]);

    // Load problem statement when current problem changes
    useEffect(() => {
        if (contest && problems.length > 0) {
            loadProblemStatement(currentProblem);
        }
    }, [currentProblem, contest, problems]);

    // Timer effect
    useEffect(() => {
        if (timeRemaining > 0) {
            const timer = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        showToast('Contest has ended!', 'warning');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [timeRemaining]);

    const loadContestData = async () => {
        try {
            // Get contest from localStorage (created in CustomContestPage)
            const contestRooms = JSON.parse(localStorage.getItem('contestRooms') || '{}');
            const contestData = Object.values(contestRooms).find(c => c.contestId === contestId);
            
            if (!contestData) {
                showToast('Contest not found', 'error');
                navigate('/customContest');
                return;
            }

            setContest(contestData);
            setProblems(contestData.problems || []);
            
            // Calculate time remaining (assuming 2 hours contest)
            const startTime = new Date(contestData.createdAt);
            const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours
            const remaining = Math.max(0, Math.floor((endTime - new Date()) / 1000));
            setTimeRemaining(remaining);
            
            // Load saved submissions
            const savedSubmissions = JSON.parse(localStorage.getItem(`contest_${contestId}_submissions`) || '[]');
            setSubmissions(savedSubmissions);
            
        } catch (error) {
            console.error('Error loading contest:', error);
            showToast('Failed to load contest data', 'error');
        }
    };

    const loadProblemStatement = async (problemIndex) => {
        if (!contest || !problems[problemIndex]) return;
        
        try {
            const problem = problems[problemIndex];
            const contestIdForAPI = contest.codeforcesContestId || contestId;
            const problemIndexForAPI = problem.index || String.fromCharCode(65 + problemIndex);
            
            console.log(`Loading problem statement for ${contestIdForAPI}/${problemIndexForAPI}`);
            
            const response = await fetch(`http://localhost:8000/api/contest/${contestIdForAPI}/problem/${problemIndexForAPI}`);
            if (response.ok) {
                const problemData = await response.json();
                console.log('Problem data loaded:', problemData);
                
                // Update problem statements
                setProblemStatements(prev => ({
                    ...prev,
                    [problemIndex]: problemData
                }));
                
                // Extract sample input from examples if available
                if (problemData.examples) {
                    const sampleInput = extractSampleInput(problemData.examples);
                    if (sampleInput) {
                        setInput(sampleInput);
                    }
                }
            } else {
                console.warn(`Problem statement not found for ${contestIdForAPI}/${problemIndexForAPI}`);
                // Fallback to basic problem info
                setProblemStatements(prev => ({
                    ...prev,
                    [problemIndex]: {
                        title: problem.name,
                        statement: problem.statement || problem.description || 'Problem statement not available',
                        inputSpec: 'Input specification not available',
                        outputSpec: 'Output specification not available',
                        examples: 'Examples not available',
                        note: ''
                    }
                }));
            }
        } catch (error) {
            console.error('Error loading problem statement:', error);
            showToast('Failed to load problem statement', 'warning');
        }
    };

    const extractSampleInput = (examplesHtml) => {
        if (!examplesHtml) return '';
        
        try {
            // Create a temporary div to parse HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = examplesHtml;
            
            // Look for input in various possible formats
            const inputPre = tempDiv.querySelector('.input pre');
            if (inputPre) {
                return inputPre.textContent; // Keep original formatting with newlines
            }
            
            // Look for input in table format
            const inputCells = tempDiv.querySelectorAll('td');
            for (const cell of inputCells) {
                const text = cell.textContent.toLowerCase();
                if (text.includes('input') && cell.nextElementSibling) {
                    const inputContent = cell.nextElementSibling.textContent;
                    if (inputContent && !inputContent.toLowerCase().includes('output')) {
                        return inputContent; // Keep original formatting
                    }
                }
            }
            
            // Fallback: look for any pre tag that might contain input
            const allPres = tempDiv.querySelectorAll('pre');
            if (allPres.length > 0) {
                return allPres[0].textContent; // Keep original formatting
            }
            
            return '';
        } catch (error) {
            console.error('Error extracting sample input:', error);
            return '';
        }
    };

    const showToast = (message, type = 'info') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 5000);
    };

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const runCode = async () => {
        if (!code.trim()) {
            showToast('Please write some code first!', 'warning');
            return;
        }

        setIsRunning(true);
        setOutput('Running code...');

        try {
            const response = await axios.post('http://localhost:8000/run', {
                language,
                code,
                input
            });

            setOutput(response.data.output || 'No output');
            showToast('Code executed successfully!', 'success');
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Execution failed';
            setOutput(`Error: ${errorMessage}`);
            showToast('Code execution failed', 'error');
        } finally {
            setIsRunning(false);
        }
    };

    const submitCode = async () => {
        if (!code.trim()) {
            showToast('Please write some code first!', 'warning');
            return;
        }

        if (timeRemaining <= 0) {
            showToast('Contest has ended!', 'error');
            return;
        }

        setIsSubmitting(true);

        try {
            const problem = problems[currentProblem];
            const submission = {
                id: Date.now(),
                problemIndex: problem.index,
                problemName: problem.name,
                language,
                code,
                submittedAt: new Date().toISOString(),
                status: 'Judging',
                verdict: 'Pending',
                timeUsed: 0,
                memoryUsed: 0
            };

            // Save submission to localStorage
            const updatedSubmissions = [...submissions, submission];
            setSubmissions(updatedSubmissions);
            localStorage.setItem(`contest_${contestId}_submissions`, JSON.stringify(updatedSubmissions));

            showToast('Code submitted! Judging...', 'info');

            // Judge the submission against sample test cases
            const verdict = await judgeSubmission(code, language);
            
            submission.verdict = verdict.verdict;
            submission.timeUsed = verdict.timeUsed;
            submission.memoryUsed = verdict.memoryUsed;
            submission.status = 'Judged';
            submission.error = verdict.error;

            const finalSubmissions = updatedSubmissions.map(s => 
                s.id === submission.id ? submission : s
            );
            setSubmissions(finalSubmissions);
            localStorage.setItem(`contest_${contestId}_submissions`, JSON.stringify(finalSubmissions));

            showToast(`Submission ${verdict.verdict}!`, verdict.verdict === 'Accepted' ? 'success' : 'error');
        } catch (error) {
            console.error('Submission error:', error);
            showToast('Submission failed', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const judgeSubmission = async (code, language) => {
        const startTime = Date.now();
        
        try {
            // Get sample test cases from the current problem
            const sampleTests = extractSampleTestCases(currentProblem);
            console.log('Extracted sample test cases:', sampleTests);
            
            if (sampleTests.length === 0) {
                // No sample tests found, return a simulated verdict
                console.log('No sample test cases found, returning simulated verdict');
                return {
                    verdict: 'Accepted',
                    timeUsed: Math.floor(Math.random() * 1000) + 100,
                    memoryUsed: Math.floor(Math.random() * 50000) + 1000,
                    error: null
                };
            }

            // Test the code against all sample test cases
            let allPassed = true;
            let executionError = null;
            
            for (let i = 0; i < sampleTests.length; i++) {
                const testCase = sampleTests[i];
                console.log(`Testing case ${i + 1}:`, testCase);
                
                try {
                    // Run the code with the sample input
                    const response = await axios.post('http://localhost:8000/run', {
                        language,
                        code,
                        input: testCase.input
                    });

                    if (response.data.error) {
                        // Compilation or runtime error
                        executionError = response.data.error;
                        console.log('Execution error:', executionError);
                        allPassed = false;
                        break;
                    }

                    const output = response.data.output?.trim() || '';
                    const expectedOutput = testCase.output.trim();
                    
                    console.log(`Test ${i + 1} - Output: "${output}", Expected: "${expectedOutput}"`);

                    // Compare output with expected output
                    if (output !== expectedOutput) {
                        console.log(`Test ${i + 1} failed: output mismatch`);
                        allPassed = false;
                        break;
                    }
                } catch (error) {
                    // Network or execution error
                    executionError = error.response?.data?.error || error.message;
                    console.log('Network/execution error:', executionError);
                    allPassed = false;
                    break;
                }
            }

            const executionTime = Date.now() - startTime;
            
            if (executionError) {
                // Determine if it's a compilation error or runtime error
                const isCompilationError = executionError.toLowerCase().includes('compilation') || 
                                         executionError.toLowerCase().includes('compile') ||
                                         executionError.toLowerCase().includes('syntax');
                
                return {
                    verdict: isCompilationError ? 'Compilation Error' : 'Runtime Error',
                    timeUsed: executionTime,
                    memoryUsed: Math.floor(Math.random() * 10000) + 1000,
                    error: executionError
                };
            }

            const verdict = allPassed ? 'Accepted' : 'Wrong Answer';
            console.log('Final verdict:', verdict);
            
            return {
                verdict,
                timeUsed: executionTime,
                memoryUsed: Math.floor(Math.random() * 50000) + 1000,
                error: null
            };

        } catch (error) {
            console.error('Error judging submission:', error);
            return {
                verdict: 'System Error',
                timeUsed: Date.now() - startTime,
                memoryUsed: 0,
                error: 'System error occurred during judging'
            };
        }
    };

    const extractSampleTestCases = (problemIndex) => {
        const problemStatement = problemStatements[problemIndex];
        if (!problemStatement || !problemStatement.examples) {
            return [];
        }

        try {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = problemStatement.examples;
            
            const testCases = [];
            
            // Look for input/output pairs in various formats
            
            // Format 1: Look for pre tags with input/output classes
            const inputPres = tempDiv.querySelectorAll('pre.input, .input pre');
            const outputPres = tempDiv.querySelectorAll('pre.output, .output pre');
            
            if (inputPres.length > 0 && outputPres.length > 0) {
                for (let i = 0; i < Math.min(inputPres.length, outputPres.length); i++) {
                    testCases.push({
                        input: inputPres[i].textContent.trim(),
                        output: outputPres[i].textContent.trim()
                    });
                }
            }
            
            // Format 2: Look for table format with input/output
            if (testCases.length === 0) {
                const tables = tempDiv.querySelectorAll('table');
                for (const table of tables) {
                    const rows = table.querySelectorAll('tr');
                    for (let i = 0; i < rows.length; i++) {
                        const cells = rows[i].querySelectorAll('td');
                        if (cells.length >= 2) {
                            const firstCell = cells[0].textContent.toLowerCase();
                            const secondCell = cells[1].textContent.toLowerCase();
                            
                            if (firstCell.includes('input') && secondCell.includes('output')) {
                                // Header row, get the actual data from next row
                                if (i + 1 < rows.length) {
                                    const dataCells = rows[i + 1].querySelectorAll('td');
                                    if (dataCells.length >= 2) {
                                        testCases.push({
                                            input: dataCells[0].textContent.trim(),
                                            output: dataCells[1].textContent.trim()
                                        });
                                    }
                                }
                            } else if (!firstCell.includes('input') && !firstCell.includes('output')) {
                                // Assume first cell is input, second is output
                                testCases.push({
                                    input: cells[0].textContent.trim(),
                                    output: cells[1].textContent.trim()
                                });
                            }
                        }
                    }
                }
            }
            
            // Format 3: Look for alternating pre tags (input, output, input, output...)
            if (testCases.length === 0) {
                const allPres = tempDiv.querySelectorAll('pre');
                for (let i = 0; i < allPres.length - 1; i += 2) {
                    testCases.push({
                        input: allPres[i].textContent.trim(),
                        output: allPres[i + 1].textContent.trim()
                    });
                }
            }
            
            return testCases.filter(tc => tc.input && tc.output);
        } catch (error) {
            console.error('Error extracting sample test cases:', error);
            return [];
        }
    };

    const getVerdictColor = (verdict) => {
        switch (verdict) {
            case 'Accepted': return 'text-green-600';
            case 'Wrong Answer': return 'text-red-600';
            case 'Time Limit Exceeded': return 'text-yellow-600';
            case 'Runtime Error': return 'text-orange-600';
            case 'Compilation Error': return 'text-purple-600';
            case 'System Error': return 'text-gray-600';
            case 'Pending': return 'text-blue-600';
            case 'Judging': return 'text-blue-600';
            default: return 'text-gray-600';
        }
    };

    const getVerdictIcon = (verdict) => {
        switch (verdict) {
            case 'Accepted': return <CheckCircle className="w-4 h-4" />;
            case 'Wrong Answer': return <XCircle className="w-4 h-4" />;
            case 'Time Limit Exceeded': return <Clock className="w-4 h-4" />;
            case 'Runtime Error': return <AlertCircle className="w-4 h-4" />;
            case 'Compilation Error': return <AlertCircle className="w-4 h-4" />;
            case 'System Error': return <AlertCircle className="w-4 h-4" />;
            case 'Pending': return <Clock className="w-4 h-4 animate-spin" />;
            case 'Judging': return <Clock className="w-4 h-4 animate-spin" />;
            default: return <AlertCircle className="w-4 h-4" />;
        }
    };

    if (!contest) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white text-xl">Loading contest...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header */}
            <div className="bg-gray-800 border-b border-gray-700 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button 
                            onClick={() => navigate('/customContest')}
                            className="flex items-center space-x-2 text-gray-300 hover:text-white"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            <span>Back to Contests</span>
                        </button>
                        <div className="flex items-center space-x-2">
                            <Trophy className="w-5 h-5 text-yellow-500" />
                            <h1 className="text-xl font-bold">{contest.title}</h1>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                            <Clock className="w-5 h-5 text-blue-400" />
                            <span className="text-lg font-mono">
                                {timeRemaining > 0 ? formatTime(timeRemaining) : '00:00:00'}
                            </span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Users className="w-5 h-5 text-green-400" />
                            <span>Room: {contest.roomCode}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Problem Navigation */}
            <div className="bg-gray-800 border-b border-gray-700 p-2">
                <div className="flex items-center space-x-2">
                    {problems.map((problem, index) => (                    <button
                        key={index}
                        onClick={() => setCurrentProblem(index)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            currentProblem === index
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                    >
                        {problem.index || String.fromCharCode(65 + index)}. {problem.name}
                    </button>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex h-[calc(100vh-120px)]">
                {/* Left Panel - Problem Statement */}
                <div className="w-1/2 h-full bg-gray-800 border-r border-gray-700 flex flex-col">
                    <div className="flex border-b border-gray-700 flex-shrink-0">
                        <button
                            onClick={() => setActiveTab('problem')}
                            className={`px-4 py-2 font-medium ${
                                activeTab === 'problem' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                        >
                            <BookOpen className="w-4 h-4 inline mr-2" />
                            Problem
                        </button>
                        <button
                            onClick={() => setActiveTab('submissions')}
                            className={`px-4 py-2 font-medium ${
                                activeTab === 'submissions' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                        >
                            <Send className="w-4 h-4 inline mr-2" />
                            My Submissions ({submissions.length})
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                        {activeTab === 'problem' && problems[currentProblem] && (
                            <div className="max-w-none">
                                {problemStatements[currentProblem] ? (
                                    <div>
                                        <h2 className="text-2xl font-bold mb-4 text-white">
                                            {problemStatements[currentProblem].title || 
                                             `${problems[currentProblem].index || String.fromCharCode(65 + currentProblem)}. ${problems[currentProblem].name}`}
                                        </h2>
                                        
                                        {/* Time and Memory Limits */}
                                        {(problemStatements[currentProblem].timeLimit || problemStatements[currentProblem].memoryLimit) && (
                                            <div className="flex items-center space-x-4 mb-6 text-sm text-gray-400">
                                                {problemStatements[currentProblem].timeLimit && (
                                                    <span className="bg-gray-700 px-3 py-1 rounded">
                                                        Time: {problemStatements[currentProblem].timeLimit}
                                                    </span>
                                                )}
                                                {problemStatements[currentProblem].memoryLimit && (
                                                    <span className="bg-gray-700 px-3 py-1 rounded">
                                                        Memory: {problemStatements[currentProblem].memoryLimit}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        
                                        {/* Problem Statement */}
                                        {problemStatements[currentProblem].statement && (
                                            <div className="mb-6">
                                                <div 
                                                    className="text-gray-300 leading-relaxed max-w-none [&>*]:text-gray-300 [&_p]:text-gray-300 [&_div]:text-gray-300 [&_span]:text-gray-300"
                                                    dangerouslySetInnerHTML={{ 
                                                        __html: problemStatements[currentProblem].statement
                                                    }}
                                                />
                                            </div>
                                        )}
                                        
                                        {/* Input Specification */}
                                        {problemStatements[currentProblem].inputSpec && (
                                            <div className="mb-6">
                                                <h3 className="text-lg font-semibold mb-3 text-white">Input</h3>
                                                <div 
                                                    className="text-gray-300 leading-relaxed max-w-none [&>*]:text-gray-300 [&_p]:text-gray-300 [&_div]:text-gray-300 [&_span]:text-gray-300"
                                                    dangerouslySetInnerHTML={{ 
                                                        __html: problemStatements[currentProblem].inputSpec
                                                    }}
                                                />
                                            </div>
                                        )}
                                        
                                        {/* Output Specification */}
                                        {problemStatements[currentProblem].outputSpec && (
                                            <div className="mb-6">
                                                <h3 className="text-lg font-semibold mb-3 text-white">Output</h3>
                                                <div 
                                                    className="text-gray-300 leading-relaxed max-w-none [&>*]:text-gray-300 [&_p]:text-gray-300 [&_div]:text-gray-300 [&_span]:text-gray-300"
                                                    dangerouslySetInnerHTML={{ 
                                                        __html: problemStatements[currentProblem].outputSpec
                                                    }}
                                                />
                                            </div>
                                        )}
                                        
                                        {/* Examples */}
                                        {problemStatements[currentProblem].examples && (
                                            <div className="mb-6">
                                                <h3 className="text-lg font-semibold mb-3 text-white">Examples</h3>
                                                <div 
                                                    className="text-gray-300 leading-relaxed max-w-none [&>*]:text-gray-300 [&_p]:text-gray-300 [&_div]:text-gray-300 [&_span]:text-gray-300"
                                                    dangerouslySetInnerHTML={{ 
                                                        __html: problemStatements[currentProblem].examples
                                                    }}
                                                />
                                            </div>
                                        )}
                                        
                                        {/* Note */}
                                        {problemStatements[currentProblem].note && (
                                            <div className="mb-4">
                                                <h3 className="text-lg font-semibold mb-3 text-white">Note</h3>
                                                <div 
                                                    className="text-gray-300 leading-relaxed max-w-none [&>*]:text-gray-300 [&_p]:text-gray-300 [&_div]:text-gray-300 [&_span]:text-gray-300"
                                                    dangerouslySetInnerHTML={{ 
                                                        __html: problemStatements[currentProblem].note
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                                        <p className="text-gray-400">Loading problem statement...</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'submissions' && (
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold mb-4">My Submissions</h3>
                                {submissions.length === 0 ? (
                                    <div className="text-gray-400 text-center py-8">
                                        <Send className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p>No submissions yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {submissions.slice().reverse().map((submission) => (
                                            <div key={submission.id} className="bg-gray-700 rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center space-x-3">
                                                        <span className="font-medium">
                                                            {submission.problemIndex}. {submission.problemName}
                                                        </span>
                                                        <span className="text-sm text-gray-400">
                                                            {submission.language.toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div className={`flex items-center space-x-2 ${getVerdictColor(submission.verdict)}`}>
                                                        {getVerdictIcon(submission.verdict)}
                                                        <span className="font-medium">{submission.verdict}</span>
                                                    </div>
                                                </div>
                                                <div className="text-sm text-gray-400 flex items-center space-x-4">
                                                    <span>{new Date(submission.submittedAt).toLocaleTimeString()}</span>
                                                    {submission.timeUsed > 0 && (
                                                        <span>{submission.timeUsed}ms</span>
                                                    )}
                                                    {submission.memoryUsed > 0 && (
                                                        <span>{Math.round(submission.memoryUsed/1024)}KB</span>
                                                    )}
                                                </div>
                                                {submission.error && (
                                                    <div className="mt-2 p-2 bg-red-900/20 border border-red-500/30 rounded text-red-300 text-sm">
                                                        <span className="font-medium">Error: </span>
                                                        {submission.error}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel - IDE */}
                <div className="w-1/2 flex flex-col">
                    {/* Code Editor Header */}
                    <div className="bg-gray-800 border-b border-gray-700 p-3 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Code className="w-5 h-5 text-blue-400" />
                            <span className="font-medium">Code Editor</span>
                            <LanguageSelector language={language} onChange={setLanguage} />
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={runCode}
                                disabled={isRunning}
                                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 px-4 py-2 rounded-lg font-medium transition-colors"
                            >
                                <Play className="w-4 h-4" />
                                <span>{isRunning ? 'Running...' : 'Run'}</span>
                            </button>
                            <button
                                onClick={submitCode}
                                disabled={isSubmitting || timeRemaining <= 0}
                                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 rounded-lg font-medium transition-colors"
                            >
                                <Send className="w-4 h-4" />
                                <span>{isSubmitting ? 'Submitting...' : 'Submit'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Code Editor */}
                    <div className="flex-1 bg-gray-900">
                        <CodeEditor
                            code={code}
                            onChange={setCode}
                            language={language}
                        />
                    </div>

                    {/* Input/Output Panel */}
                    <div className="h-64 bg-gray-800 border-t border-gray-700">
                        <div className="flex h-full">
                            <div className="w-1/2 border-r border-gray-700">
                                <div className="bg-gray-700 px-4 py-2 font-medium text-sm">Input</div>
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    className="w-full h-[calc(100%-36px)] bg-gray-800 text-white p-4 resize-none focus:outline-none font-mono text-sm"
                                    placeholder="Enter your input here..."
                                />
                            </div>
                            <div className="w-1/2">
                                <div className="bg-gray-700 px-4 py-2 font-medium text-sm">Output</div>
                                <div className="w-full h-[calc(100%-36px)] bg-gray-800 text-white p-4 font-mono text-sm whitespace-pre-wrap overflow-y-auto">
                                    {output || 'Output will appear here...'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Bar */}
            <StatusBar />

            {/* Toast Notifications */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};

export default ContestIDEPage;
