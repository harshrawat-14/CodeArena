# CodeArena - Modern Code Compiler & Judge

A beautiful, modern web-based code editor and compiler inspired by LeetCode, Codeforces, and CodeChef. Features a sleek UI with real-time code execution, AI-powered code review, and competitive programming aesthetics.

## ✨ Features

### 🎨 Modern UI/UX
- **Dark Theme Code Editor** with syntax highlighting
- **Glassmorphism Design** with smooth animations
- **Responsive Layout** that works on all devices
- **Professional IDE Look** with line numbers and status bar
- **LeetCode/Codeforces Inspired** interface design

### 💻 Code Editor
- **Multi-language Support**: C++, C, Python, Java, JavaScript
- **Real-time Syntax Highlighting** with Prism.js
- **Line Numbers** and code statistics
- **Auto-completion** and error detection
- **Custom Input** for testing programs

### ⚡ Code Execution
- **Fast Judge System** with Docker containerization
- **Multiple Output Tabs** (Output, Errors, Debug)
- **Execution Statistics** (time, memory, lines)
- **Real-time Status Updates** with loading animations

### 🤖 AI Code Review
- **Intelligent Code Analysis** using Google Generative AI
- **Performance Optimization** suggestions
- **Best Practices** recommendations
- **Code Quality Scoring** with detailed feedback
- **Markdown Rendering** for rich review content

### 🔐 Authentication
- **Modern Auth System** with sign in/sign up
- **User Profiles** with ratings and statistics
- **Secure Session** management with localStorage
- **Beautiful Auth UI** with gradient backgrounds

### 🎯 Problem Solving
- **Interactive Problem Statements** with examples
- **Multiple Tabs**: Problem, Examples, Constraints
- **Difficulty Levels** with color coding
- **Success Rates** and user statistics

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Docker (for code execution)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd OJ
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd ../backend
   npm install
   ```

4. **Set up Environment Variables**
   
   Frontend (`.env`):
   ```env
   VITE_BACKEND_URL=8000
   GENAI_API_URL=http://localhost:8000/ai-review
   ```
   
   Backend (`.env`):
   ```env
   PORT=8000
   GEMINI_API_KEY=your_google_ai_api_key_here
   ```

5. **Start the Backend**
   ```bash
   cd backend
   npm start
   ```

6. **Start the Frontend**
   ```bash
   cd frontend
   npm run dev
   ```

7. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:8000

## 🐳 Docker Deployment

### Build and Run with Docker

1. **Build the Backend Docker Image**
   ```bash
   cd backend
   docker build -t code-judge-backend .
   ```

2. **Run the Backend Container**
   ```bash
   docker run -p 8000:8000 -v /var/run/docker.sock:/var/run/docker.sock code-judge-backend
   ```

3. **Start Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```

### Production Build

```bash
# Build frontend for production
cd frontend
npm run build

# Serve with a static file server
npm install -g serve
serve -s dist -l 3000
```

## 🎯 Usage

### Writing and Running Code

1. **Select Language**: Choose from C++, Python, Java, JavaScript, or C
2. **Write Code**: Use the professional IDE-style editor with syntax highlighting
3. **Add Input**: Enter test input in the custom input section (optional)
4. **Run Code**: Click the "Run Code" button or use Ctrl+Enter
5. **View Results**: Check output in the multi-tab result panel

### AI Code Review

1. **Write Your Code**: Complete your solution in the editor
2. **Request Review**: Click "Analyze Code" in the AI Review panel
3. **Get Feedback**: Receive detailed analysis including:
   - Code quality assessment
   - Performance optimization tips
   - Best practices suggestions
   - Detailed scoring (1-10)

### Problem Solving

1. **Read Problem**: Study the problem statement, examples, and constraints
2. **Plan Solution**: Think through the algorithm and approach
3. **Implement**: Write your solution in the code editor
4. **Test**: Run with sample inputs and custom test cases
5. **Review**: Use AI assistance to improve your code quality

## 🛠️ Architecture

### Frontend Stack
- **React 19** with functional components and hooks
- **Vite** for fast development and building
- **Tailwind CSS** for modern styling
- **React Simple Code Editor** for code editing
- **Prism.js** for syntax highlighting
- **React Markdown** for AI review rendering
- **Axios** for API communication

### Backend Stack
- **Node.js** with Express.js framework
- **Docker** for secure code execution
- **Google Generative AI** for code review
- **File System** for temporary code storage
- **CORS** enabled for cross-origin requests

### Security Features
- **Docker Isolation**: All code runs in isolated containers
- **Input Sanitization**: Prevents code injection attacks
- **File Cleanup**: Temporary files are automatically removed
- **Resource Limits**: Execution time and memory constraints

## 📁 Project Structure

```
OJ/
├── frontend/                   # React frontend application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── Auth.jsx      # Authentication component
│   │   │   ├── Header.jsx    # Navigation header
│   │   │   ├── CodeEditor.jsx # Code editor component
│   │   │   ├── OutputPanel.jsx # Results display
│   │   │   ├── AIReviewPanel.jsx # AI review interface
│   │   │   ├── ProblemStatement.jsx # Problem display
│   │   │   ├── LanguageSelector.jsx # Language picker
│   │   │   ├── StatusBar.jsx # Bottom status bar
│   │   │   └── KeyboardShortcuts.jsx # Shortcuts help
│   │   ├── App.jsx           # Main application component
│   │   ├── App.css           # Global styles
│   │   └── main.jsx          # Application entry point
│   ├── package.json          # Frontend dependencies
│   └── .env                  # Environment variables
├── backend/                   # Node.js backend server
│   ├── index.js              # Express server setup
│   ├── executeCode.js        # Code execution logic
│   ├── generateFile.js       # File generation utilities
│   ├── aiCodeReview.js       # AI integration
│   ├── Dockerfile           # Docker configuration
│   ├── package.json         # Backend dependencies
│   └── .env                 # Backend environment
└── README.md                # This file
```

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + Enter` | Run Code |
| `Ctrl + S` | Save Code |
| `Ctrl + /` | Toggle Comment |
| `Alt + R` | Get AI Review |
| `Ctrl + K` | Clear Output |
| `F11` | Toggle Fullscreen |
| `Ctrl + +` | Increase Font Size |
| `Ctrl + -` | Decrease Font Size |

## 🎨 Customization

### Themes
The application uses a modern dark theme with:
- **Code Editor**: Dark slate background with syntax highlighting
- **UI Components**: Clean white cards with subtle shadows
- **Gradients**: Blue to purple gradients for interactive elements
- **Icons**: Emoji and SVG icons for visual appeal

### Color Scheme
```css
:root {
  --primary-color: #3b82f6;    /* Blue */
  --secondary-color: #8b5cf6;  /* Purple */
  --success-color: #10b981;    /* Green */
  --warning-color: #f59e0b;    /* Yellow */
  --error-color: #ef4444;      /* Red */
  --dark-bg: #0f172a;          /* Dark slate */
  --light-bg: #f8fafc;         /* Light gray */
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **LeetCode** for UI/UX inspiration
- **Codeforces** for competitive programming aesthetics
- **CodeChef** for problem presentation ideas
- **Tailwind CSS** for the beautiful styling system
- **Google AI** for intelligent code review capabilities

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](../../issues) page
2. Create a new issue with detailed information
3. Include screenshots and error messages
4. Specify your environment (OS, Node.js version, etc.)

---

**Made with ❤️ for the competitive programming community**
"# CodeArena" 
