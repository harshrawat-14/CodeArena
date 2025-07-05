const express = require("express") ; 
const {generateFile} = require("./generateFile.js") ; 
const {executeCode} = require("./executeCode.js") ;
const {generateInputFile} = require("./generateInputFile.js") ;
const {aiCodeReview} = require("./aiCodeReview.js") ;
const dotenv = require('dotenv');
const cors = require('cors');
const axios = require('axios');
const scrapeProblem = require('./scrapeProblem.js');
const getTopAccSol = require('./getTopAccSol.js');
const getAvailableLanguages = require('./getAvailableLanguages.js');
const getContestByDiv = require("./getContestByDiv.js");
const { db } = require('./firebaseConfigAdmin');
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

app.get('/api/contestInfo', async (req, res) => {
    const div = req.query.div || "Div. 2";  // Allow ?div=Div. 1, etc.

    try {
        const data = await getContestByDiv(div);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch contest info", details: err.toString() });
    }
});

const getProblemByDivID = require('./getProblemByDivID.js');

app.get('/api/problemIndices', async (req, res) => {
    const div = req.query.div || "Div. 2";
    const limit = parseInt(req.query.limit || "5");

    try {
        const data = await getProblemByDivID(div, limit);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: "Failed to get problem indexes", details: err.toString() });
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

app.get('/api/contest/:contestId/problem/:index', async (req, res) => {
  const { contestId, index } = req.params;

  try {
    const divDocs = await db.collection('contests').listDocuments();

    for (const divDoc of divDocs) {
      const divId = divDoc.id;

      const docRef = db
        .collection('contests')
        .doc(divId)
        .collection(`contest_${contestId}`)
        .doc(`problem_${index}`);

      const doc = await docRef.get();
      if (doc.exists) return res.json(doc.data());
    }
    const createdAt = data.createdAt?.toDate();
    const now = new Date();

    if (!createdAt || (now - createdAt > 2 * 60 * 60 * 1000)) {
        return res.status(403).json({ error: "Contest expired. You had 2 hours to access this contest." });
    }

    return res.status(404).json({ message: 'Problem not found' });
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error', details: err.toString() });
  }
});


app.post('/api/acceptedSol', async (req, res) => {
  const { contestId, index, language } = req.body;

  if (!contestId || !index) {
    return res.status(400).json({ error: 'Missing contestId or index.' });
  }

  try {
    const result = await getTopAccSol(contestId, index, language || 'C++');
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch solution.', details: err.message });
  }
});

// Simple health check endpoint for Docker
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Production Server is running on port ${PORT}`);
    console.log(`🔥 Premium Codeforces API v2.0 - Ready!`);
    console.log(`⚡ Lightning-fast Firebase-backed responses`);
    console.log(`🛡️ Advanced Puppeteer scraping with Cloudflare bypass`);
    console.log(`🎯 Endpoints: /api/health for system status`);
});