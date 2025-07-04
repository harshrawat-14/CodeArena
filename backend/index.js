const express = require("express") ; 
const {generateFile} = require("./generateFile.js") ; 
const {executeCode} = require("./executeCode.js") ;
const {generateInputFile} = require("./generateInputFile.js") ;
const {aiCodeReview} = require("./aiCodeReview.js") ;
const dotenv = require('dotenv');
const cors = require('cors');
const axios = require('axios');
const scrapeProblem = require('./scrapeProblem.js');

// Import Codeforces utility functions (NEW PRODUCTION API)
const {
    getContestsByDivision,
    getContestProblems,
    getCompleteProblemData,
    searchProblems,
    getTrendingProblems,
    getProblemsByDifficulty,
    getRandomProblem,
    getSystemHealth,
    logAndFormatError,
    scrapingCircuitBreaker
} = require('./codeforcesUtils.js');

// Import Firebase authentication functions
const {
    googleAuth,
    verifyToken,
    updateUserProfile,
    getUserProfile,
    saveSubmission,
    getUserSubmissions,
    updateUserStats,
    getLeaderboard
} = require('./loginLogic.js');

const app = express() ; 

// Configure CORS properly
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json()) ; 
app.use(express.urlencoded({extended: true})) ;

app.get("/" , (req,res) =>{
    res.json({message : "online compiler is running"}) ;
});


dotenv.config() ; 

const PORT = process.env.PORT || 8000 ; 

app.post("/run" , async (req,res) =>{
    const {language='cpp' , code , input} = req.body ; 
    if(code === undefined) {
        return res.status(400).json({success : false , error: "Code is required"}) ; 
    }

    try{
        const filePath = generateFile(language,code) ;
        const inputFilePath = generateInputFile(input) ;
        const output = await executeCode(filePath , inputFilePath) ; 
        
        // If user is authenticated (has token), save the submission
        const token = req.headers.authorization?.split(' ')[1];
        if (token) {
            try {
                const { auth } = require('./firebaseConfigAdmin');
                const decodedToken = await auth.verifyIdToken(token);
                const uid = decodedToken.uid;
                
                // Save submission to Firebase
                const { saveSubmission } = require('./loginLogic.js');
                await saveSubmission({
                    body: {
                        uid,
                        language,
                        code,
                        input,
                        output,
                        status: 'executed',
                        problemId: 'practice'
                    },
                    user: { uid }
                }, { 
                    status: () => ({ json: () => {} }),
                    json: () => {}
                });
            } catch (saveError) {
                console.warn('Failed to save submission:', saveError);
                // Continue with response even if save fails
            }
        }
        
        res.json({filePath,output,inputFilePath}) ; 
    }catch(error){
        console.error("Error executing code:", error);
        return res.status(500).json({success : false , error: error.message || "Internal Server Error"}) ; 
    } 
});

// ============ FIREBASE AUTHENTICATION ROUTES ============

// Google Authentication
app.post('/auth/google', googleAuth);

// Update user profile (requires authentication)
app.put('/auth/profile/:uid', verifyToken, updateUserProfile);

// Get user profile
app.get('/auth/profile/:uid', getUserProfile);

// Save code submission (requires authentication)
app.post('/auth/submit', verifyToken, saveSubmission);

// Get user submissions (requires authentication)
app.get('/auth/submissions/:uid', verifyToken, getUserSubmissions);

// Update user stats (requires authentication)
app.put('/auth/stats', verifyToken, updateUserStats);

// Get leaderboard (public)
app.get('/leaderboard', getLeaderboard);

// Protected route example
app.get('/auth/test', verifyToken, (req, res) => {
    res.json({ 
        message: 'Authenticated successfully', 
        user: req.user 
    });
});

// ============ CODE EXECUTION ROUTES ============

app.post("/ai-review" , async(req,res)=>{
    const {code}  = req.body ; 
    if(code == undefined || code.trim() === ""){
        return res.status(400).json({
            success: false,
            error: "Code is required for AI review"
        });
    }
    try{
        const review = await aiCodeReview(code) ; 
        res.status(200).json({success: true, review}) ; 
    }catch(error){
        console.error("Error in AI review:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "Internal Server Error"
        });
    }
})

// ============ CODEFORCES API ROUTES (PRODUCTION) ============

// Get contests by division - Lightning fast Firebase response
app.get('/api/contests/:division', async (req, res) => {
    const { division } = req.params;
    const limit = parseInt(req.query.limit) || 20;

    console.log(`🏆 Fetching Div.${division} contests (limit: ${limit})`);

    try {
        const contests = await getContestsByDivision(division, limit);
        res.json({
            success: true,
            division,
            contests,
            count: contests.length,
            fetchedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Error fetching contests:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch contests',
            message: error.message
        });
    }
});

// Get contest problems - Instant Firebase response
app.get('/api/contest/:contestId/problems', async (req, res) => {
    const { contestId } = req.params;
    
    console.log(`🎯 Fetching problems for contest ${contestId}`);
    
    try {
        const problems = await getContestProblems(contestId);
        
        res.json({
            success: true,
            contestId,
            problems,
            count: problems.length,
            fetchedAt: new Date().toISOString()
        });
        
    } catch (error) {
        console.error(`❌ Error fetching problems for contest ${contestId}:`, error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch contest problems',
            message: error.message,
            contestId
        });
    }
});

// Get complete problem data with test cases - Premium feature
app.get('/api/contest/:contestId/problem/:index', async (req, res) => {
    const { contestId, index } = req.params;

    console.log(`🔍 Fetching complete data for problem ${contestId}/${index}`);

    try {
        const problemData = await getCompleteProblemData(contestId, index);
        
        res.json({
            success: true,
            problem: problemData,
            fetchedAt: new Date().toISOString()
        });
        
    } catch (error) {
        console.error(`❌ Error fetching problem ${contestId}/${index}:`, error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch problem data',
            message: error.message,
            problemId: `${contestId}/${index}`
        });
    }
});

// Advanced search - Premium feature
app.get('/api/search/problems', async (req, res) => {
    const { 
        q: query, 
        minRating, 
        maxRating, 
        tags,
        limit = 20 
    } = req.query;

    console.log(`🔍 Searching problems: "${query}"`);

    try {
        const filters = {};
        if (minRating) filters.minRating = parseInt(minRating);
        if (maxRating) filters.maxRating = parseInt(maxRating);
        if (tags) filters.tags = tags.split(',');

        const problems = await searchProblems(query, filters);
        
        res.json({
            success: true,
            query,
            filters,
            problems: problems.slice(0, limit),
            totalFound: problems.length,
            searchedAt: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Search error:', error);
        res.status(500).json({
            success: false,
            error: 'Search failed',
            message: error.message
        });
    }
});

// Trending problems - Premium feature
app.get('/api/problems/trending', async (req, res) => {
    const limit = parseInt(req.query.limit) || 20;

    console.log(`🔥 Fetching trending problems (limit: ${limit})`);

    try {
        const problems = await getTrendingProblems(limit);
        
        res.json({
            success: true,
            problems,
            count: problems.length,
            fetchedAt: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error fetching trending problems:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch trending problems',
            message: error.message
        });
    }
});

// Problems by difficulty - Premium feature
app.get('/api/problems/difficulty/:minRating/:maxRating', async (req, res) => {
    const { minRating, maxRating } = req.params;
    const limit = parseInt(req.query.limit) || 20;

    console.log(`📈 Fetching problems with rating ${minRating}-${maxRating}`);

    try {
        const problems = await getProblemsByDifficulty(
            parseInt(minRating), 
            parseInt(maxRating), 
            limit
        );
        
        res.json({
            success: true,
            difficultyRange: `${minRating}-${maxRating}`,
            problems,
            count: problems.length,
            fetchedAt: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error fetching problems by difficulty:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch problems by difficulty',
            message: error.message
        });
    }
});

// Random problem for practice - Premium feature
app.get('/api/problems/random', async (req, res) => {
    const rating = req.query.rating ? parseInt(req.query.rating) : null;

    console.log(`🎲 Fetching random problem${rating ? ` (~${rating} rating)` : ''}`);

    try {
        const problem = await getRandomProblem(rating);
        
        res.json({
            success: true,
            problem,
            targetRating: rating,
            fetchedAt: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error fetching random problem:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch random problem',
            message: error.message
        });
    }
});

// System health check
app.get('/api/health', (req, res) => {
    try {
        const health = getSystemHealth();
        
        res.json({
            success: true,
            health,
            uptime: process.uptime(),
            version: '2.0.0'
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Health check failed',
            message: error.message
        });
    }
});

// Legacy compatibility and diagnostics
app.get('/api/contest/:contestId/test', async (req, res) => {
    const { contestId } = req.params;
    
    try {
        console.log(`🧪 Testing contest ${contestId}...`);
        const problems = await getContestProblems(contestId);
        
        res.json({
            success: true,
            contestId,
            problemCount: problems.length,
            availableProblems: problems.map(p => ({ 
                index: p.index, 
                name: p.name,
                rating: p.rating 
            })),
            message: `Contest ${contestId} exists with ${problems.length} problems`
        });
        
    } catch (error) {
        res.status(404).json({
            success: false,
            error: 'Contest not found or inaccessible',
            message: error.message,
            contestId
        });
    }
});

// System diagnostics
app.get('/api/diagnostics', (req, res) => {
    const health = getSystemHealth();
    
    res.json({
        success: true,
        timestamp: new Date().toISOString(),
        system: health,
        endpoints: {
            contests: '/api/contests/:division',
            problems: '/api/contest/:contestId/problems',
            problem: '/api/contest/:contestId/problem/:index',
            search: '/api/search/problems',
            trending: '/api/problems/trending',
            difficulty: '/api/problems/difficulty/:min/:max',
            random: '/api/problems/random'
        },
        version: '2.0.0-production'
    });
});

// Reset circuit breaker (admin endpoint)
app.post('/api/admin/reset-circuit-breaker', (req, res) => {
    try {
        scrapingCircuitBreaker.onSuccess(); // Reset the circuit breaker
        
        res.json({ 
            success: true,
            message: 'Circuit breaker reset successfully',
            status: scrapingCircuitBreaker.getStatus()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to reset circuit breaker',
            message: error.message
        });
    }
});

app.post('/api/test' , async (req, res) => {
    console.log('Test endpoint is working!');
    const { contestId , index } = req.body ;
    try {
        const data = await scrapeProblem(contestId, index.toUpperCase());
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: "Failed to scrape problem", details: err.toString() });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Production Server is running on port ${PORT}`);
    console.log(`🔥 Premium Codeforces API v2.0 - Ready!`);
    console.log(`⚡ Lightning-fast Firebase-backed responses`);
    console.log(`🛡️ Advanced Puppeteer scraping with Cloudflare bypass`);
    console.log(`🎯 Endpoints: /api/health for system status`);
});