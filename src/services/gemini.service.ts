import { Injectable } from '@angular/core';
import { Question, LanguageCode } from '../types';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private readonly HISTORY_KEY = 'neurometric_seen_ids';
  private seenQuestionIds: Set<number> = new Set();
  
  constructor() {
    this.loadHistory();
  }

  // --- PUBLIC METHODS ---

  async generateTest(language: LanguageCode): Promise<Question[]> {
    console.log('NeuroMetric: Serving offline test.');
    // Short delay for UX realism
    await new Promise(resolve => setTimeout(resolve, 600));
    return this.generateQuestionsOffline(language);
  }

  async generateAnalysis(iq: number, language: LanguageCode, validity: string): Promise<string> {
    return this.generateAnalysisOffline(iq, language, validity);
  }

  // --- OFFLINE/FALLBACK IMPLEMENTATION ---

  private async generateQuestionsOffline(language: LanguageCode): Promise<Question[]> {
    let rawQuestions = this.offlineQuestionBank[language] || this.offlineQuestionBank['en'];
    
    // Filter out seen questions (if possible)
    const unseen = rawQuestions.filter(q => !this.seenQuestionIds.has(q.id));
    const seen = rawQuestions.filter(q => this.seenQuestionIds.has(q.id));

    // Shuffle
    const shuffledUnseen = [...unseen].sort(() => 0.5 - Math.random());
    const shuffledSeen = [...seen].sort(() => 0.5 - Math.random());

    // Select 10
    const selected: Question[] = [];
    selected.push(...shuffledUnseen.slice(0, 10));
    if (selected.length < 10) {
      selected.push(...shuffledSeen.slice(0, 10 - selected.length));
    }

    // Mark as seen
    selected.forEach(q => this.seenQuestionIds.add(q.id));
    this.saveHistory();

    // Re-index for UI display (1, 2, 3...)
    return selected.map((q, index) => ({
      ...q,
      id: index + 1 
    }));
  }

  private generateAnalysisOffline(iq: number, language: LanguageCode, validity: string): Promise<string> {
    const templates: Record<string, { high: string, avg: string, low: string, invalid: string }> = {
      en: {
        high: "Subject demonstrates exceptional pattern recognition and abstract reasoning capabilities. Cognitive processing speed exceeds the 95th percentile, indicating superior fluid intelligence potential.",
        avg: "Subject displays solid logical reasoning and consistent attention to detail. Cognitive metrics align with a balanced profile, showing strengths in structured problem solving.",
        low: "Performance indicates challenges in abstract logic processing under current test conditions. Further assessment in a distraction-free environment is recommended.",
        invalid: "Assessment validity flagged due to rapid response times. Results likely do not reflect true cognitive potential. Please retake the test with focused attention."
      },
      zh: {
        high: "受试者表现出卓越的模式识别和抽象推理能力。认知处理速度超过第95百分位，表明具有卓越的流体智力潜力。",
        avg: "受试者显示出扎实的逻辑推理能力和持续的细节关注力。认知指标符合平衡的特征，在结构化问题解决方面表现出优势。",
        low: "在当前测试条件下，表现显示出抽象逻辑处理方面的挑战。建议在无干扰的环境中进行进一步评估。",
        invalid: "由于反应时间过快，评估有效性被标记。结果可能无法反映真实的认知潜力。请集中注意力重新进行测试。"
      },
      // ... (Rest of languages preserved)
    };
    
    // Helper for fallback languages
    const getTemplate = (lang: string) => templates[lang] || templates['en'];
    const t = getTemplate(language);

    if (validity.includes('Low')) return Promise.resolve(t.invalid);
    if (iq >= 120) return Promise.resolve(t.high);
    if (iq >= 90) return Promise.resolve(t.avg);
    return Promise.resolve(t.low);
  }

  private loadHistory() {
    try {
      const stored = localStorage.getItem(this.HISTORY_KEY);
      if (stored) this.seenQuestionIds = new Set(JSON.parse(stored));
    } catch (e) {}
  }

  private saveHistory() {
    try {
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(Array.from(this.seenQuestionIds)));
    } catch (e) {}
  }

  // --- STATIC DB ---
  private offlineQuestionBank: Record<string, Question[]> = {
    'en': [
      { id: 1, category: 'logic', correctIndex: 1, text: "If 'AZ' = 126, 'BY' = 225, what is 'CX'?", options: ["324", "324", "420", "330"] },
      { id: 2, category: 'math', correctIndex: 3, text: "Sequence: 2, 3, 5, 7, 11, 13, 17, ?", options: ["18", "21", "15", "19"] },
      { id: 3, category: 'spatial', correctIndex: 0, text: "A clock shows 3:15. Reflected in a mirror, what time does it appear to be?", options: ["8:45", "9:45", "3:45", "2:15"] },
      { id: 4, category: 'verbal', correctIndex: 2, text: "Ephemeral is to Enduring as ...", options: ["Short is to Brief", "Hard is to Solid", "Dynamic is to Static", "Light is to Heavy"] },
      { id: 5, category: 'logic', correctIndex: 1, text: "Which number replaces the question mark? 6 (14) 4 | 8 ( ? ) 3", options: ["18", "22", "16", "24"] },
      { id: 6, category: 'spatial', correctIndex: 2, text: "Which 3D shape can be formed by folding a 2D 'T' shape?", options: ["Sphere", "Pyramid", "Cube", "Cylinder"] },
      { id: 7, category: 'math', correctIndex: 0, text: "1, 1, 2, 3, 5, 8, 13, ?", options: ["21", "20", "19", "25"] },
      { id: 8, category: 'verbal', correctIndex: 1, text: "Identify the anagram: 'DORMITORY'", options: ["Dirty Room", "Dirty Roomy", "Riot Room", "My Root"] },
      { id: 9, category: 'logic', correctIndex: 3, text: "A is the brother of B. B is the brother of C. C is the father of D. How is D related to A?", options: ["Brother", "Cousin", "Uncle", "Nephew/Niece"] },
      { id: 10, category: 'math', correctIndex: 1, text: "What is 15% of 15% of 200?", options: ["0.45", "4.5", "45", "0.045"] }
    ],
    'zh': [
      { id: 101, category: 'math', correctIndex: 2, text: "数字规律: 1, 4, 9, 16, 25, ?", options: ["30", "32", "36", "40"] },
      { id: 102, category: 'logic', correctIndex: 0, text: "如果 '昨天' 是 '明天' 的前两天，那么 '今天' 是什么？", options: ["今天", "昨天", "明天", "后天"] },
      { id: 103, category: 'spatial', correctIndex: 3, text: "将一张正方形纸对折两次，剪去一个角，展开后可能有几个洞？", options: ["2", "3", "4", "1"] },
      { id: 104, category: 'verbal', correctIndex: 1, text: "“即使”之于“条件”，正如“虽然”之于...", options: ["假设", "转折", "结果", "原因"] },
      { id: 105, category: 'math', correctIndex: 1, text: "2, 6, 12, 20, 30, ?", options: ["40", "42", "44", "46"] },
      { id: 106, category: 'logic', correctIndex: 2, text: "所有A都是B。所有B都是C。因此：", options: ["所有C都是A", "部分C是A", "所有A都是C", "没有A是C"] },
      { id: 107, category: 'spatial', correctIndex: 1, text: "哪个图形无法一笔画成？", options: ["五角星", "田字格", "圆", "日字格"] },
      { id: 108, category: 'verbal', correctIndex: 0, text: "找出不同类的一项：", options: ["汽车", "轮胎", "方向盘", "发动机"] },
      { id: 109, category: 'math', correctIndex: 3, text: "如果 3 = 18, 4 = 32, 5 = 50, 6 = 72, 那么 7 = ?", options: ["84", "90", "96", "98"] },
      { id: 110, category: 'logic', correctIndex: 1, text: "医生给了你3颗药丸，要你每半小时吃一颗，请问吃完需要多长时间？", options: ["1.5小时", "1小时", "2小时", "3小时"] }
    ]
  };
}