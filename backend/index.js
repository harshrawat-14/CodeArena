const express = require("express") ; 
const {generateFile} = require("./generateFile.js") ; 
const {executeCode} = require("./executeCode.js") ;
const {generateInputFile} = require("./generateInputFile.js") ;
const {aiCodeReview} = require("./aiCodeReview.js") ;
const dotenv = require('dotenv');

const app = express() ; 

// Add CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

app.use(express.json()) ; 
app.use(express.urlencoded({extended: true})) ;

app.get("/" , (req,res) =>{
    res.json({message : "online compiler is running"}) ;
});


dotenv.config() ; 

const PORT = process.env.PORT || 8000 ; 

app.post("/run" , async (req,res) =>{
    // res.json({output: "Code executed successfully", errors: null});
    const {language='cpp' , code , input} = req.body ; 
    if(code === undefined) {
        return res.status(400).json({success : false , error: "Code is required"}) ; 
    }

    try{
        const filePath = generateFile(language,code) ;
        const inputFilePath = generateInputFile(input) ;
        const output = await executeCode(filePath , inputFilePath) ; 
        res.json({filePath,output,inputFilePath}) ; 
    }catch(error){
        console.error("Error executing code:", error);
        return res.status(500).json({success : false , error: error.message || "Internal Server Error"}) ; 
    } 
});

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