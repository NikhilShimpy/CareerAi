# 🌟 CareerAI


[![View Live](https://img.shields.io/badge/View-Live-green?style=for-the-badge&logo=web)](https://career-ai-chi.vercel.app/)

**CareerAI** is an AI-powered placement preparation platform built using **React + TypeScript + Vite + Tailwind + Firebase + Gemini 3 Pro**.  
It integrates **DSA learning, aptitude practice, resume scoring, mock tests, job search, and a smart AI chatbot** into one platform, helping students prepare faster and smarter for campus placements.

---

## 📌 Features

| Feature | Description |
|---------|-------------|
| **Visual DSA Pattern Library** | 22 core DSA patterns including Sliding Window, Two Pointers, Graphs, DP, Heaps, Backtracking. Interactive learning and problem-solving interface. |
| **AI Resume & ATS Analyzer** | Upload resume & job description, get ATS score, skill alignment, improvement suggestions, and AI-based job recommendations. |
| **AI Mock Interview Coach** | Simulates HR & technical rounds, adaptive questions, multi-language support, instant feedback. |
| **Mock Test Engine** | Generate custom tests (5–30 questions), company-specific test sets, detailed solutions & scoring. |
| **Aptitude & Logical Reasoning Module** | Covers Time & Work, Profit & Loss, Probability, DI, Number Systems, Blood Relations, Coding-Decoding, Directions, Series, Puzzles. |
| **AI Power Tools Suite** | Time Complexity Analyzer, Pattern Predictor, Code Dry Run Visualizer, Code Translator across programming languages. |
| **Ask Nik – AI Doubt Solver** | Gemini 3 Pro-powered chatbot for concept explanation, code debugging, examples, and personalized guidance. |

---

## 💻 Tech Stack

**Frontend**
- React.js (TypeScript)
- Vite
- TailwindCSS

**Backend / Cloud**
- Firebase Authentication
- Firestore Database
- Firebase Storage (optional)

**AI / ML Layer**
- Gemini 3 Pro API
- Custom `geminiService.ts` for AI prompt handling

**Tools**
- Node.js & npm
- Git / GitHub
- VS Code

---

## 🗂 Project Structure

```bash
src/
├── App.tsx
├── index.tsx
├── components/
│     ├── AptitudeLibrary.tsx
│     ├── AptitudeTest.tsx
│     ├── AvatarSelection.tsx
│     ├── Chatbot.tsx
│     ├── DevelopedBy.tsx
│     ├── Guide.tsx
│     ├── JobSearch.tsx
│     ├── Login.tsx
│     ├── PatternLibrary.tsx
│     ├── Profile.tsx
│     ├── ResumeAnalyzer.tsx
│     ├── Sidebar.tsx
│     ├── Tools.tsx
│     └── services/
│            ├── firebase.ts
│            └── geminiService.ts
├── constants.ts
├── index.html
└── metadata.json

```


## 🚀 Installation & Run Locally

### Prerequisites
- **Node.js** (v18 or above recommended)
- **npm** (comes with Node.js)

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/CareerAI.git
cd CareerAI
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Environment Setup

Create a .env.local file in the root directory and add your Gemini API key:

```bash 
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4️⃣ Run the Development Server

```bash
npm run dev
```

### Open in Browser

```bash
http://localhost:5173
```


🎉 CareerAI is now running locally!


## 📽️ Live Demo / Video

- 🌐 [GitHub Repository](https://github.com/NikhilShimpy/SwapSkills.git)  
- 📹 [Demo Video](https://youtu.be/hJ5Hinj04VQ?si=tjazgiBLHrpBn3fI) 

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙌 Author

**Nikhil Shimpy**  
- 💼 [LinkedIn](https://www.linkedin.com/in/nikhilshimpy/)  
- 🐙 [GitHub](https://github.com/NikhilShimpy)  
- 📸 [Instagram](https://www.instagram.com/nikhilshimpyy/?hl=en)
- 🔗 [LinkTree](https://linktr.ee/nikhilshimpyy)
- 🖥️ [Portfolio](https://nikhilshimpyyportfolio.vercel.app/)