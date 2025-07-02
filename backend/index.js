const express = require("express") ; 
const {generateFile} = require("./generateFile.js") ; 
const {executeCode} = require("./executeCode.js") ;
const {generateInputFile} = require("./generateInputFile.js") ;
const {aiCodeReview} = require("./aiCodeReview.js") ;
const dotenv = require('dotenv');
const cors = require('cors');

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
                const { auth } = require('./firebaseConfig');
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

// Online compiler .........

app.listen(PORT , () =>{
    console.log("Server is running on port 8000") ; 
});
