
export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  isLoading?: boolean;
}

export type AppView = 'home' | 'patterns' | 'aptitude' | 'guide' | 'tools' | 'resume-analyzer' | 'job-search' | 'interview-prep' | 'mock-test' | 'developed-by' | 'profile';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  profileImage: string;
  authProvider: 'google' | 'email';
  createdAt: string;
  lastLogin: string;
}

export interface Company {
  name: string;
  logo: string;
}

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  experience: string;
  postedDate: string;
  portal: string;
  link: string;
  type: 'Full-time' | 'Internship' | 'Contract' | 'Remote' | 'Hybrid';
  skills?: string[];
  matchScore?: number;
  validationStatus: 'validated' | 'requires_login' | 'archived' | 'unknown';
  isSearchFallback: boolean;
}

export interface JobFilters {
  location: string;
  salary: string;
  experience: string;
  datePosted: string;
  jobType: string;
}

export interface AnalysisResult {
  matchPercentage: number;
  atsScore: number;
  summary: string;
  skillsFound: string[];
  missingSkills: string[];
  keywordGaps: string[];
  improvementPlan: string[];
  tailoredSuggestions: {
    profileSummary: string;
    experience: string[];
    projects: string[];
  };
  suggestedJobRoles: string[];
  candidateExperienceLevel: string;
}

export interface Pattern {
  id: string;
  name: string;
  description: string;
  coreIntuition?: string;
  whenToUse: string[];
  examples: {
    name: string;
    platform: 'LeetCode' | 'GFG' | 'HackerRank' | 'CodeChef';
    difficulty: 'Easy' | 'Medium' | 'Hard';
    url?: string;
  }[];
  visualAid?: string;
}

export interface ToolResult {
  output: string;
}

export interface AptitudeQuestion {
  id?: string;
  question: string;
  answer: string;
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  trickUsed?: string;
  visualAid?: string;
}

export interface AptitudePattern {
  id: string;
  name: string;
  category: 'Quantitative' | 'Logical';
  description: string;
  tricks: string[];
  strategy: string[];
  visualAid?: string;
  sampleQuestions: AptitudeQuestion[];
}

export interface TestConfig {
  mode: 'Practice' | 'FullMock' | 'Company';
  topic: string;
  questionCount: number;
  timeLimit: number;
}

export interface TestQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  explanation: string;
}

export interface TestResultDetails {
  questionId: string;
  userAnswerIndex: number | null;
  correctIndex: number;
  isCorrect: boolean;
}

export interface TestResult {
  score: number;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  unattemptedCount: number;
  timeTaken: number;
  details: TestResultDetails[];
}
