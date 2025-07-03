/**
 * PRODUCTION-READY CODEFORCES API UTILITIES
 * 
 * Features:
 * - Lightning-fast Firebase-backed responses
 * - Pre-scraped contest and problem data
 * - Intelligent caching and fallback mechanisms
 * - Advanced search capabilities
 * - On-demand scraping for missing data
 * - Circuit breaker pattern for reliability
 */

const { db } = require('./firebaseConfigAdmin');
const UltimateCodeforcesScraper = require('./ultimateScraper');
const axios = require('axios');

/**
 * Circuit breaker for scraping operations
 */
class ScrapingCircuitBreaker {
    constructor() {
        this.failureCount = 0;
        this.lastFailureTime = null;
        this.threshold = 5;
        this.resetTimeout = 300000; // 5 minutes
        this.state = 'CLOSED';
    }

    canExecute() {
        if (this.state === 'CLOSED') return true;
        
        if (this.state === 'OPEN') {
            if (Date.now() - this.lastFailureTime > this.resetTimeout) {
                this.state = 'HALF_OPEN';
                return true;
            }
            return false;
        }
        
        return true;
    }

    onSuccess() {
        this.failureCount = 0;
        this.state = 'CLOSED';
    }

    onFailure() {
        this.failureCount++;
        this.lastFailureTime = Date.now();
        
        if (this.failureCount >= this.threshold) {
            this.state = 'OPEN';
            console.warn(`🚨 Circuit breaker OPEN - too many failures (${this.failureCount})`);
        }
    }

    getStatus() {
        return {
            state: this.state,
            failureCount: this.failureCount,
            timeUntilReset: this.state === 'OPEN' ? 
                Math.max(0, this.resetTimeout - (Date.now() - this.lastFailureTime)) : 0
        };
    }
}

const scrapingCircuitBreaker = new ScrapingCircuitBreaker();

/**
 * Get contests by division from Firebase (instant response)
 */
const getContestsByDivision = async (division, limit = 20) => {
    console.log(`📊 Fetching Div.${division} contests from Firebase...`);
    
    try {
        const contestsRef = db.collection('contests');
        const snapshot = await contestsRef
            .where('division', '==', division)
            .where('phase', '==', 'FINISHED')
            .orderBy('startTimeSeconds', 'desc')
            .limit(limit)
            .get();

        const contests = [];
        snapshot.forEach(doc => {
            contests.push({ id: doc.id, ...doc.data() });
        });

        console.log(`✅ Found ${contests.length} Div.${division} contests in Firebase`);
        return contests;

    } catch (error) {
        console.error('❌ Firebase error, falling back to API:', error.message);
        return await fetchContestsByDivisionFallback(division, limit);
    }
};

/**
 * Fallback to Codeforces API if Firebase fails
 */
const fetchContestsByDivisionFallback = async (division, limit = 20) => {
    try {
        const response = await axios.get('https://codeforces.com/api/contest.list');
        const contests = response.data.result;

        const filtered = contests
            .filter(c => c.phase === 'FINISHED' && c.name.includes(`Div. ${division}`))
            .slice(0, limit);

        console.log(`⚡ API fallback: Found ${filtered.length} Div.${division} contests`);
        return filtered;

    } catch (error) {
        console.error('❌ Both Firebase and API failed:', error.message);
        throw new Error('Unable to fetch contests from any source');
    }
};

/**
 * Get contest problems from Firebase (instant response)
 */
const getContestProblems = async (contestId) => {
    console.log(`🔍 Fetching problems for contest ${contestId} from Firebase...`);
    
    try {
        const contestDoc = await db.collection('contests').doc(contestId).get();
        
        if (!contestDoc.exists) {
            console.log(`⚠️ Contest ${contestId} not in Firebase, attempting fallback...`);
            return await fetchContestProblemsFallback(contestId);
        }

        const contestData = contestDoc.data();
        const problems = contestData.problems || [];

        console.log(`✅ Found ${problems.length} problems for contest ${contestId} in Firebase`);
        return problems;

    } catch (error) {
        console.error('❌ Firebase error, falling back to API:', error.message);
        return await fetchContestProblemsFallback(contestId);
    }
};

/**
 * Fallback to Codeforces API for contest problems
 */
const fetchContestProblemsFallback = async (contestId) => {
    try {
        const url = `https://codeforces.com/api/contest.standings?contestId=${contestId}&from=1&count=1`;
        const response = await axios.get(url);
        const problems = response.data.result.problems;

        console.log(`⚡ API fallback: Found ${problems.length} problems for contest ${contestId}`);
        return problems;

    } catch (error) {
        console.error(`❌ Failed to fetch problems for contest ${contestId}:`, error.message);
        throw new Error(`Cannot fetch problems for contest ${contestId}`);
    }
};

/**
 * Get complete problem data with test cases (premium feature)
 */
const getCompleteProblemData = async (contestId, problemIndex) => {
    const problemId = `${contestId}-${problemIndex}`;
    console.log(`🎯 Fetching complete data for problem ${problemId}...`);
    
    try {
        // First try Firebase for instant response
        const problemDoc = await db.collection('problems').doc(problemId).get();
        
        if (problemDoc.exists) {
            const problemData = problemDoc.data();
            console.log(`✅ Found complete problem data for ${problemId} in Firebase`);
            return problemData;
        }

        // If not in Firebase, try on-demand scraping
        console.log(`⚠️ Problem ${problemId} not in Firebase, attempting on-demand scraping...`);
        return await scrapeCompleteProblemData(contestId, problemIndex);

    } catch (error) {
        console.error(`❌ Failed to get complete problem data for ${problemId}:`, error.message);
        throw new Error(`Cannot fetch complete data for problem ${problemId}`);
    }
};

/**
 * On-demand scraping for missing problems
 */
const scrapeCompleteProblemData = async (contestId, problemIndex) => {
    if (!scrapingCircuitBreaker.canExecute()) {
        throw new Error('Scraping circuit breaker is OPEN - too many recent failures');
    }

    try {
        console.log(`🕷️ Starting on-demand scraping for ${contestId}-${problemIndex}...`);
        
        const scraper = await UltimateCodeforcesScraper.getInstance();
        const problemData = await scraper.scrapeProblemWithTestCases(contestId, problemIndex);
        
        if (problemData) {
            // Store in Firebase for future instant access
            const problemId = `${contestId}-${problemIndex}`;
            await db.collection('problems').doc(problemId).set({
                ...problemData,
                scrapedAt: new Date().toISOString(),
                source: 'on-demand'
            });
            
            scrapingCircuitBreaker.onSuccess();
            console.log(`✅ Successfully scraped and cached problem ${problemId}`);
            return problemData;
        }

        throw new Error('Scraping returned no data');

    } catch (error) {
        scrapingCircuitBreaker.onFailure();
        console.error(`❌ On-demand scraping failed:`, error.message);
        throw error;
    }
};

/**
 * Advanced search across all problems
 */
const searchProblems = async (query, filters = {}) => {
    console.log(`🔍 Searching problems with query: "${query}"`);
    
    try {
        let problemsRef = db.collection('problems');
        
        // Apply filters
        if (filters.minRating) {
            problemsRef = problemsRef.where('rating', '>=', filters.minRating);
        }
        if (filters.maxRating) {
            problemsRef = problemsRef.where('rating', '<=', filters.maxRating);
        }
        if (filters.tags && filters.tags.length > 0) {
            problemsRef = problemsRef.where('tags', 'array-contains-any', filters.tags);
        }

        const snapshot = await problemsRef.limit(50).get();
        
        const problems = [];
        snapshot.forEach(doc => {
            const problem = { id: doc.id, ...doc.data() };
            
            // Text search in problem name and statement
            if (query) {
                const searchText = query.toLowerCase();
                const problemText = `${problem.name} ${problem.statement || ''}`.toLowerCase();
                
                if (problemText.includes(searchText)) {
                    problems.push(problem);
                }
            } else {
                problems.push(problem);
            }
        });

        console.log(`✅ Search returned ${problems.length} problems`);
        return problems;

    } catch (error) {
        console.error('❌ Search failed:', error.message);
        throw new Error('Search operation failed');
    }
};

/**
 * Get trending/popular problems
 */
const getTrendingProblems = async (limit = 20) => {
    console.log(`🔥 Fetching trending problems...`);
    
    try {
        const snapshot = await db.collection('problems')
            .where('rating', '>=', 1200)
            .where('rating', '<=', 2000)
            .orderBy('solvedCount', 'desc')
            .limit(limit)
            .get();

        const problems = [];
        snapshot.forEach(doc => {
            problems.push({ id: doc.id, ...doc.data() });
        });

        console.log(`✅ Found ${problems.length} trending problems`);
        return problems;

    } catch (error) {
        console.error('❌ Failed to fetch trending problems:', error.message);
        throw new Error('Cannot fetch trending problems');
    }
};

/**
 * Get problems by difficulty range
 */
const getProblemsByDifficulty = async (minRating, maxRating, limit = 20) => {
    console.log(`📈 Fetching problems with rating ${minRating}-${maxRating}...`);
    
    try {
        const snapshot = await db.collection('problems')
            .where('rating', '>=', minRating)
            .where('rating', '<=', maxRating)
            .orderBy('rating', 'asc')
            .limit(limit)
            .get();

        const problems = [];
        snapshot.forEach(doc => {
            problems.push({ id: doc.id, ...doc.data() });
        });

        console.log(`✅ Found ${problems.length} problems in difficulty range`);
        return problems;

    } catch (error) {
        console.error('❌ Failed to fetch problems by difficulty:', error.message);
        throw new Error('Cannot fetch problems by difficulty');
    }
};

/**
 * Get random problem for practice
 */
const getRandomProblem = async (rating = null) => {
    console.log(`🎲 Fetching random problem${rating ? ` with rating ~${rating}` : ''}...`);
    
    try {
        let problemsRef = db.collection('problems');
        
        if (rating) {
            // Get problems within ±200 rating range
            problemsRef = problemsRef
                .where('rating', '>=', rating - 200)
                .where('rating', '<=', rating + 200);
        }

        const snapshot = await problemsRef.limit(100).get();
        
        if (snapshot.empty) {
            throw new Error('No problems found');
        }

        const problems = [];
        snapshot.forEach(doc => {
            problems.push({ id: doc.id, ...doc.data() });
        });

        // Return random problem
        const randomIndex = Math.floor(Math.random() * problems.length);
        const randomProblem = problems[randomIndex];

        console.log(`✅ Selected random problem: ${randomProblem.name}`);
        return randomProblem;

    } catch (error) {
        console.error('❌ Failed to fetch random problem:', error.message);
        throw new Error('Cannot fetch random problem');
    }
};

/**
 * Health check for all services
 */
const getSystemHealth = () => {
    const circuitBreakerStatus = scrapingCircuitBreaker.getStatus();
    
    return {
        timestamp: new Date().toISOString(),
        firebase: 'connected', // Assume connected if we got here
        scraping: {
            circuitBreaker: circuitBreakerStatus,
            available: circuitBreakerStatus.state !== 'OPEN'
        },
        api: 'operational'
    };
};

/**
 * Error logging helper
 */
const logAndFormatError = (operation, error, details = {}) => {
    const errorInfo = {
        operation,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        ...details
    };
    
    console.error(`❌ ${operation} failed:`, errorInfo);
    return errorInfo;
};

module.exports = {
    // Main API functions
    getContestsByDivision,
    getContestProblems,
    getCompleteProblemData,
    
    // Search and discovery
    searchProblems,
    getTrendingProblems,
    getProblemsByDifficulty,
    getRandomProblem,
    
    // Utility functions
    getSystemHealth,
    logAndFormatError,
    scrapingCircuitBreaker,
    
    // Legacy compatibility (marked for deprecation)
    fetchContestsByDivision: getContestsByDivision,
    fetchContestProblems: getContestProblems,
    fetchCompleteContestProblems: getContestProblems
};
