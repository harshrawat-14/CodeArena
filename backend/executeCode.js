const fs = require('fs');
const path = require('path');
const {exec} = require("child_process");

const outputPath = path.join(__dirname, 'outputs') ;
if(!fs.existsSync(outputPath)){
    fs.mkdirSync(outputPath , {recursive : true});
}

const executeCode = (filePath , inputFilePath) =>{
    const jobID = path.basename(filePath).split('.')[0] ;
    const output_filename = `${jobID}` ;  // No .exe extension for Linux
    const outPath = path.join(outputPath , output_filename) ; 
    
    return new Promise((resolve, reject) =>{
        // Use Unix-style paths for Docker/Linux containers
        const command = `g++ "${filePath}" -o "${outPath}" && cd "${outputPath}" && ./${output_filename} < "${inputFilePath}"`;
        
        exec(command, (error, stdout, stderr) => {
            if(error){
                reject({error , stderr}) ; 
            }
            if(stderr){
                reject(stderr) ; 
            }
            resolve(stdout || "Program executed successfully with no output") ; 
        });
    });
    
    console.log(outPath) ; 
};

module.exports = {
    executeCode 
};