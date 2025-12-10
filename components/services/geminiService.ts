import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';
import { JobFilters, JobListing, AnalysisResult } from '../types';

// Initialize the Gemini API client
const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key not found in environment variables");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateResponse = async (
  prompt: string, 
  history: { role: 'user' | 'model', content: string }[] = []
): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return "Error: API Key is missing. Please check your configuration.";

  try {
    const model = 'gemini-2.5-flash';
    
    // Construct the chat history
    const chatHistory = history.map(h => ({
      role: h.role,
      parts: [{ text: h.content }]
    }));

    const chat = ai.chats.create({
      model,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        maxOutputTokens: 8192, 
      },
      history: chatHistory
    });

    const result = await chat.sendMessage({ message: prompt });
    return result.text || "I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I encountered an error while processing your request. Please try again later.";
  }
};

interface ResumeInput {
  text?: string;
  fileData?: string; // base64
  mimeType?: string;
}

interface JDInput {
  text?: string;
  url?: string;
}

export const extractJobFromUrl = async (url: string): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return "";

  const prompt = `
    I have a job link: "${url}".
    
    Since you cannot browse the live web, please:
    1. Infer the company and role from the URL structure if possible.
    2. detailed job description typical for this role at this company.
    3. Include Salary, Skills, Responsibilities, and Experience.
    
    Return ONLY the raw text description.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "";
  } catch (error) {
    console.error("URL Extraction Error:", error);
    return "";
  }
};

export const analyzeResume = async (
  resume: ResumeInput, 
  jd: JDInput,
  language: 'English' | 'Hinglish' | 'Hindi' | 'Marathi' = 'English'
): Promise<AnalysisResult | null> => {
  const ai = getAIClient();
  if (!ai) return null;

  // Handle JD Logic
  let jobDescription = jd.text || "";
  if (jd.url && !jd.text) {
     jobDescription = await extractJobFromUrl(jd.url);
  }

  // Build Content Parts
  const parts: any[] = [];
  
  // Add Resume File or Text
  if (resume.fileData && resume.mimeType) {
    parts.push({
      inlineData: {
        mimeType: resume.mimeType,
        data: resume.fileData
      }
    });
    parts.push({ text: "Here is the resume file above." });
  } else if (resume.text) {
    parts.push({ text: `RESUME CONTENT:\n${resume.text}` });
  }

  // Language instructions
  const langInstruction = {
    'English': "Provide the analysis strictly in professional English.",
    'Hinglish': "Provide the analysis in Hinglish (Conversational Hindi + English terms). Example: 'Tumhara resume strong hai but React missing hai'. Keep technical keywords in English.",
    'Hindi': "Provide the analysis in formal Hindi (Devanagari). Keep technical terms (like 'React', 'AWS', 'Python') in English characters.",
    'Marathi': "Provide the analysis in Marathi. Keep technical terms (like 'React', 'AWS') in English characters."
  }[language];

  // Add Prompt
  const promptText = `
    You are ResumeAI Pro, an advanced ATS simulator.
    
    TASK: Analyze the resume against the following Job Description.
    
    JOB DESCRIPTION:
    "${jobDescription}"

    LANGUAGE CONSTRAINT: ${langInstruction}

    OUTPUT FORMAT: Return a valid JSON object. Do NOT use Markdown formatting (no \`\`\`json).
    
    JSON Structure:
    {
      "matchPercentage": number (0-100),
      "atsScore": number (0-100),
      "summary": "Short 2-3 sentence overview of the fit.",
      "skillsFound": ["Skill1", "Skill2"],
      "missingSkills": ["CriticalSkill1", "CriticalSkill2"],
      "keywordGaps": ["Exact Keyword 1", "Exact Keyword 2"],
      "improvementPlan": ["Actionable step 1", "Actionable step 2"],
      "tailoredSuggestions": {
        "profileSummary": "Rewrite of the profile summary",
        "experience": ["Improvement for role 1", "Improvement for role 2"],
        "projects": ["Project suggestion 1"]
      },
      "suggestedJobRoles": ["Role1", "Role2", "Role3"], // Extract 3 best matching job titles for this candidate based on their resume
      "candidateExperienceLevel": "Fresher" | "1-3 Years" | "3-5 Years" | "5+ Years" // Infer from resume
    }
    
    Ensure lists are concise. Be brutally honest but constructive.
  `;
  parts.push({ text: promptText });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
      config: { 
        responseMimeType: "application/json",
        systemInstruction: SYSTEM_INSTRUCTION 
      }
    });
    
    const text = response.text || "{}";
    // Clean potential markdown if model ignores config
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '');
    return JSON.parse(cleanText) as AnalysisResult;
  } catch (error) {
    console.error("Analysis Error:", error);
    return null;
  }
};

// Helper to generate safe search links
const generateSafeJobLink = (job: Partial<JobListing>): { link: string, status: JobListing['validationStatus'] } => {
  const query = encodeURIComponent(`${job.title} ${job.company}`);
  const location = encodeURIComponent(job.location || '');
  
  switch (job.portal) {
    case 'LinkedIn':
      return { 
        link: `https://www.linkedin.com/jobs/search/?keywords=${query}&location=${location}`,
        status: 'requires_login' // LinkedIn often forces login
      };
    case 'Indeed':
      return { 
        link: `https://www.indeed.com/jobs?q=${query}&l=${location}`,
        status: 'validated'
      };
    case 'Glassdoor':
      return {
        link: `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${query}`,
        status: 'requires_login'
      };
    case 'Naukri':
       // Naukri deep linking is unstable, Google Site Search is reliable
       return {
         link: `https://www.google.com/search?q=site:naukri.com+${query}+${location}`,
         status: 'validated'
       };
    case 'Wellfound':
      return {
        link: `https://wellfound.com/jobs?q=${query}`,
        status: 'validated'
      };
    default:
      return {
        link: `https://www.google.com/search?q=${query}+jobs+${location}`,
        status: 'validated'
      };
  }
};

export const fetchJobs = async (query: string, filters?: JobFilters, page: number = 1): Promise<JobListing[]> => {
  const ai = getAIClient();
  if (!ai) return [];

  const filterString = filters ? `
    Applied Filters:
    - Location: ${filters.location}
    - Salary Range: ${filters.salary}
    - Experience Level: ${filters.experience}
    - Date Posted: ${filters.datePosted}
    - Job Type: ${filters.jobType}
  ` : '';

  const prompt = `
    Generate 6 REALISTIC and ACTIVE job listings for query: "${query}".
    Page: ${page}.
    ${filterString}
    
    IMPORTANT RULES:
    1. ONLY generate jobs that realistically match the filters (e.g., if salary > 20LPA, show Senior/Staff roles).
    2. If Location is 'Remote', ensure job type is Remote.
    3. Portals to mimic: LinkedIn, Naukri, Indeed, Glassdoor, Wellfound.
    4. Provide detailed 'skills' arrays.
    
    Return valid JSON array.
    Fields: 
    - id (unique string)
    - title
    - company
    - location (match filter)
    - salary (match filter, e.g., "₹12-18 LPA" or "$80k-100k")
    - experience (match filter, e.g., "3-5 years")
    - postedDate (e.g. "2 days ago")
    - portal (Source)
    - type (Remote/Onsite/Hybrid)
    - skills (array of 3-4 strings)
    
    JSON ONLY. No markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    let text = response.text || '[]';
    text = text.replace(/```json/g, '').replace(/```/g, '');
    
    const rawJobs = JSON.parse(text);
    
    // Post-process to ensure valid links
    return rawJobs.map((job: any) => {
      const { link, status } = generateSafeJobLink(job);
      return {
        ...job,
        link,
        validationStatus: status,
        isSearchFallback: true // We are using search fallbacks to ensure no broken links
      };
    });

  } catch (error) {
    console.error("Job Fetch Error:", error);
    return [];
  }
};

export const generateDSAProblems = async (patternName: string, platform: string, count: number): Promise<any[]> => {
  const ai = getAIClient();
  if (!ai) return [];

  const prompt = `
    Generate ${count} DSA problems related to the pattern "${patternName}" specifically found on ${platform}.
    Return a JSON array. 
    Fields: name, difficulty (Easy/Medium/Hard), url (valid link if possible, or use a search query link).
    
    JSON ONLY. No text.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    let text = response.text || '[]';
    text = text.replace(/```json/g, '').replace(/```/g, '');
    return JSON.parse(text);
  } catch (error) {
    console.error("Generate DSA Problems Error:", error);
    return [];
  }
};

export const analyzeToolRequest = async (toolName: string, input: string): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return "Error: API Key missing.";

  const prompt = `
    You are a ${toolName}.
    Input: "${input}"
    
    Analyze the input and provide the output specific to your role.
    If 'Time Complexity Calculator': Provide Time & Space Complexity with explanation.
    If 'Pattern Predictor': Identify the DSA pattern and why.
    If 'Dry Run Visualizer': Show step-by-step variable changes.
    If 'Code Translator': Translate to Python/Java/C++/JS (infer target or provide all).
    
    Format nicely in Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Analysis failed.";
  } catch (error) {
    console.error("Tool Analysis Error:", error);
    return "Error analyzing request.";
  }
};

export const generatePracticeQuestions = async (patternName: string, count: number, difficulty: string): Promise<any[]> => {
  const ai = getAIClient();
  if (!ai) return [];

  const prompt = `
    Generate ${count} aptitude practice questions for topic "${patternName}" with difficulty "${difficulty}".
    Return JSON array.
    Fields: question, answer (short answer), explanation (detailed step-by-step), difficulty, trickUsed (optional), visualAid (optional text representation).
    
    JSON ONLY. No text.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    let text = response.text || '[]';
    text = text.replace(/```json/g, '').replace(/```/g, '');
    return JSON.parse(text);
  } catch (error) {
    console.error("Practice Questions Error:", error);
    return [];
  }
};

export const generateAptitudeTest = async (topic: string, count: number, difficulty: string): Promise<any[]> => {
  const ai = getAIClient();
  if (!ai) return [];

  const prompt = `
    Generate a mock aptitude test with ${count} questions.
    Topic: "${topic}".
    Difficulty: "${difficulty}".
    
    Return JSON array of objects.
    Fields: 
    - id (unique string)
    - question (string)
    - options (array of 4 strings)
    - correctIndex (number 0-3)
    - difficulty (Easy/Medium/Hard)
    - category (Quantitative/Logical/Verbal/etc)
    - explanation (string)

    JSON ONLY. No text.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    let text = response.text || '[]';
    text = text.replace(/```json/g, '').replace(/```/g, '');
    return JSON.parse(text);
  } catch (error) {
    console.error("Test Generation Error:", error);
    return [];
  }
};
