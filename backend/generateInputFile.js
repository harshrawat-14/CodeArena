const fs = require('fs');
const path = require('path');
const {v4 : uuid} = require("uuid") ; 

const dirInput = path.join(__dirname, 'input') ; 

if(!fs.existsSync(dirInput)){
    fs.mkdirSync(dirInput , {recursive: true}) ; 
}

const generateInputFile = (input) =>{

    const jobID = uuid() ; 
    const inputFileName = `${jobID}.txt` ;
    const inputFilePath = path.join(dirInput , inputFileName) ; 
    
    fs.writeFileSync(inputFilePath , input) ;
    return inputFilePath ;  
} ; 

module.exports = {
    generateInputFile
}