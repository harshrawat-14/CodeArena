const {GoogleGenerativeAI} = require('@google/generative-ai');
const dotenv = require("dotenv") ; 

dotenv.config(); 
const genAI = new GoogleGenerativeAI("AIzaSyDaAQGnt27fWVRsiJwi0-TmUszqTMCOVyc");

const aiCodeReview = async (code) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const prompt = `Analyze the following code and provide a short and concise review:

${code}

Please provide feedback on:
1. Code quality and best practices
2. Potential improvements
3. Any bugs or issues you notice`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        console.log(text) ; 
        return text;
    } catch (error) {
        console.error('Error in AI review:', error);
        throw error;
    }
};

module.exports = {
    aiCodeReview,
}