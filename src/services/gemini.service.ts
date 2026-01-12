import { Injectable } from '@angular/core';
import { GoogleGenAI, Type } from '@google/genai';
import { Question, LanguageCode } from '../types';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI | null = null;
  private apiKey: string;

  // Local Database of "Hard" questions (Validated for Difficulty) - ENGLISH ONLY
  private localBank: Question[] = [
    { id: 101, category: 'logic', correctIndex: 1, text: "If 'AZ' = 126, 'BY' = 225, what is 'CX'?", options: ["324", "323", "420", "330"] },
    { id: 102, category: 'math', correctIndex: 3, text: "Sequence: 2, 3, 5, 7, 11, 13, 17, ?", options: ["18", "21", "15", "19"] },
    { id: 103, category: 'spatial', correctIndex: 0, text: "A clock shows 3:15. Reflected in a mirror, what time does it appear to be?", options: ["8:45", "9:45", "3:45", "2:15"] },
    { id: 104, category: 'verbal', correctIndex: 2, text: "Ephemeral is to Enduring as ...", options: ["Short is to Brief", "Hard is to Solid", "Dynamic is to Static", "Light is to Heavy"] },
    { id: 105, category: 'logic', correctIndex: 1, text: "Which number replaces the question mark? 6 (14) 4 | 8 ( ? ) 3", options: ["18", "22", "16", "24"] }, 
    { id: 106, category: 'spatial', correctIndex: 2, text: "Which 3D shape can be formed by folding a 2D 'T' shape?", options: ["Sphere", "Pyramid", "Cube", "Cylinder"] },
    { id: 107, category: 'math', correctIndex: 0, text: "1, 1, 2, 3, 5, 8, 13, ?", options: ["21", "20", "19", "25"] },
    { id: 108, category: 'verbal', correctIndex: 1, text: "Identify the anagram: 'DORMITORY'", options: ["Dirty Room", "Dirty Roomy", "Riot Room", "My Root"] },
    { id: 109, category: 'logic', correctIndex: 3, text: "A is the brother of B. B is the brother of C. C is the father of D. How is D related to A?", options: ["Brother", "Cousin", "Uncle", "Nephew/Niece"] },
    { id: 110, category: 'math', correctIndex: 1, text: "What is 15% of 15% of 200?", options: ["0.45", "4.5", "45", "0.045"] },
    { id: 111, category: 'spatial', correctIndex: 0, text: "If you rotate a 'W' 180 degrees, it becomes an 'M'. What does '6' become?", options: ["9", "6", "e", "g"] },
    { id: 112, category: 'logic', correctIndex: 2, text: "Statement: All squares are rectangles. Some rectangles are red. Therefore:", options: ["All squares are red", "No squares are red", "Some squares might be red", "All red things are squares"] },
    { id: 113, category: 'verbal', correctIndex: 3, text: "Which word is the antonym of 'Obfuscate'?", options: ["Confuse", "Hide", "Complicate", "Clarify"] },
    { id: 114, category: 'math', correctIndex: 0, text: "Solve: 7 + 7 / 7 + 7 * 7 - 7", options: ["50", "0", "56", "14"] },
    { id: 115, category: 'spatial', correctIndex: 1, text: "How many edges does a Cube have?", options: ["8", "12", "6", "10"] }
  ];

  constructor() {
    // Safely access the API key to prevent 'process is not defined' crash in browsers.
    // This code is designed to work in environments where 'process' might not exist.
    this.apiKey = (typeof process !== 'undefined' && process.env && process.env.API_KEY) 
      ? process.env.API_KEY 
      : '';
    
    if (this.apiKey) {
        this.ai = new GoogleGenAI({ apiKey: this.apiKey });
    } else {
        console.warn('NeuroMetric AI Core: API_KEY not found. AI features will be disabled.');
    }
  }

  isConfigured(): boolean {
    return !!this.apiKey && !!this.ai;
  }

  async generateTest(language: LanguageCode): Promise<Question[]> {
    if (!this.isConfigured()) {
      throw new Error('Gemini API key not configured.');
    }
    
    let questions: Question[];

    if (language === 'en') {
      // For English, use a hybrid model: 5 high-quality local questions + 5 from AI
      const shuffledLocal = [...this.localBank].sort(() => 0.5 - Math.random());
      const selectedLocal = shuffledLocal.slice(0, 5);
      const aiQuestions = await this.fetchAIQuestions('en', 5);
      questions = [...selectedLocal, ...aiQuestions];
    } else {
      // For ALL other languages, fetch 10 questions directly from the AI
      // to ensure they are properly translated and culturally relevant.
      questions = await this.fetchAIQuestions(language, 10);
    }

    // Shuffle the final list and assign sequential IDs
    return questions
      .sort(() => 0.5 - Math.random())
      .map((q, index) => ({
        ...q,
        id: index + 1
      }));
  }

  private async fetchAIQuestions(language: LanguageCode, count: number): Promise<Question[]> {
    if (!this.ai) {
      throw new Error('AI client not initialized.');
    }
    const prompt = `Generate ${count} UNIQUE, HIGH LEVEL IQ questions in language '${language}'.
    Must be challenging for adults.
    Focus: Abstract Logic, Advanced Pattern Recognition.
    Return strictly JSON. 4 options per question.`;

    try {
      const aiPromise = this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.INTEGER },
                text: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctIndex: { type: Type.INTEGER },
                category: { type: Type.STRING, enum: ['logic', 'math', 'spatial', 'verbal'] }
              },
              required: ['text', 'options', 'correctIndex', 'category']
            }
          },
          thinkingConfig: { thinkingBudget: 0 }
        }
      });

      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 10000));
      const result = await Promise.race([aiPromise, timeoutPromise]);

      if (result && 'text' in result && result.text) {
        return JSON.parse(result.text) as Question[];
      } else {
        // This block handles timeout
        console.warn(`AI generation timed out for language: ${language}.`);
        if (language === 'en') {
          return this.getFallbackAIQuestions();
        }
        throw new Error('AI generation timed out.');
      }

    } catch (e) {
      console.error(`AI generation failed for language: ${language}`, e);
      if (language === 'en') {
        return this.getFallbackAIQuestions();
      }
      // For non-English languages, we must fail to avoid showing English questions.
      // This error is caught in app.component.ts, which resets the app.
      throw e;
    }
  }

  async generateAnalysis(iq: number, language: LanguageCode, validity: string): Promise<string> {
    if (!this.isConfigured()) {
        return 'Processing complete. Cognitive metrics derived from standardized performance algorithms.';
    }
    try {
      // Prompt engineered for clinical/academic tone
      let context = '';
      if (validity.includes('Low')) {
         context = 'Subject completed test too rapidly. Result suggests random guessing or lack of engagement.';
      } else if (iq < 90) {
         context = 'Subject shows cognitive challenges in abstract pattern recognition.';
      } else if (iq > 130) {
         context = 'Subject demonstrates superior cognitive function and high-speed processing.';
      }

      const prompt = `Write a clinical cognitive assessment summary (max 2 sentences) for a subject with IQ ${iq}. 
      Language: ${language}. 
      Context: ${context}. 
      Tone: Academic, Formal, Objective.`;

      const response = await this.ai!.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { thinkingConfig: { thinkingBudget: 0 } }
      });
      return response.text || 'Assessment complete. Data indicates cognitive performance consistent with calculated indices.';
    } catch {
      return 'Processing complete. Cognitive metrics derived from standardized performance algorithms.';
    }
  }

  private getFallbackAIQuestions(): Question[] {
    return [
      { id: 201, category: 'math', correctIndex: 2, text: "Which number is divisible by 3?", options: ["124", "412", "552", "601"] },
      { id: 202, category: 'logic', correctIndex: 0, text: "All A are B. No B are C. Thus:", options: ["No A are C", "Some A are C", "All C are A", "All A are C"] },
      { id: 203, category: 'spatial', correctIndex: 3, text: "Visualise a square. Cut it diagonally. What shapes do you have?", options: ["Squares", "Rectangles", "Circles", "Triangles"] },
      { id: 204, category: 'verbal', correctIndex: 1, text: "Finger is to Hand as Leaf is to...", options: ["Root", "Branch", "Flower", "Forest"] },
      { id: 205, category: 'logic', correctIndex: 2, text: "1, 8, 27, 64, ?", options: ["100", "121", "125", "144"] } 
    ];
  }
}
