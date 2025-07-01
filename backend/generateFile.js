const fs = require('fs');
const path = require('path');
const {v4 : uuid} = require("uuid") ; 

const dirCodes = path.join(__dirname, 'codes') ; 

if(!fs.existsSync(dirCodes)){
    fs.mkdirSync(dirCodes , {recursive: true}) ; 
}

const generateFile = (language , code) =>{
    console.log(dirCodes) ; 
    const jobID = uuid() ; 
    const fileName = `${jobID}.${language}` ;
    const filePath = path.join(dirCodes , fileName) ; 
    
    fs.writeFileSync(filePath , code) ;
    return filePath ;  
} ; 

module.exports = {
    generateFile
}