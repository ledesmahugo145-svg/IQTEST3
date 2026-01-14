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
    console.log(`NeuroMetric: Serving offline test for [${language}].`);
    // Short delay for UX realism
    await new Promise(resolve => setTimeout(resolve, 600));
    return this.generateQuestionsOffline(language);
  }

  async generateAnalysis(iq: number, language: LanguageCode, validity: string): Promise<string> {
    return this.generateAnalysisOffline(iq, language, validity);
  }

  // --- OFFLINE/FALLBACK IMPLEMENTATION ---

  private async generateQuestionsOffline(language: LanguageCode): Promise<Question[]> {
    // Fallback to English ONLY if the specific language key is strictly missing
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
      es: {
        high: "El sujeto demuestra capacidades excepcionales de reconocimiento de patrones y razonamiento abstracto. La velocidad de procesamiento cognitivo supera el percentil 95.",
        avg: "El sujeto muestra un razonamiento lógico sólido y una atención constante a los detalles. Las métricas cognitivas se alinean con un perfil equilibrado.",
        low: "El rendimiento indica desafíos en el procesamiento lógico abstracto bajo las condiciones de prueba actuales.",
        invalid: "Validez de la evaluación marcada debido a tiempos de respuesta rápidos. Es probable que los resultados no reflejen el verdadero potencial cognitivo."
      },
      fr: {
        high: "Le sujet démontre des capacités exceptionnelles de reconnaissance de formes et de raisonnement abstrait. La vitesse de traitement cognitif dépasse le 95e centile.",
        avg: "Le sujet fait preuve d'un raisonnement logique solide et d'une attention constante aux détails. Les métriques cognitives s'alignent sur un profil équilibré.",
        low: "La performance indique des défis dans le traitement de la logique abstraite dans les conditions actuelles du test.",
        invalid: "Validité de l'évaluation signalée en raison de temps de réponse rapides. Les résultats ne reflètent probablement pas le véritable potentiel cognitif."
      },
      de: {
        high: "Die Testperson zeigt außergewöhnliche Fähigkeiten in Mustererkennung und abstraktem Denken. Die kognitive Verarbeitungsgeschwindigkeit liegt über dem 95. Perzentil.",
        avg: "Die Testperson zeigt solides logisches Denken und beständige Aufmerksamkeit für Details. Kognitive Metriken entsprechen einem ausgewogenen Profil.",
        low: "Die Leistung deutet auf Herausforderungen bei der abstrakten Logikverarbeitung unter den aktuellen Testbedingungen hin.",
        invalid: "Die Gültigkeit der Bewertung wurde aufgrund schneller Reaktionszeiten markiert. Die Ergebnisse spiegeln wahrscheinlich nicht das wahre kognitive Potenzial wider."
      },
      ja: {
        high: "被験者は並外れたパターン認識と抽象的推論能力を示しています。認知処理速度は95パーセンタイルを超えており、優れた流動性知能の可能性を示しています。",
        avg: "被験者は確かな論理的推論と一貫した細部への注意を示しています。認知指標はバランスの取れたプロファイルと一致しています。",
        low: "現在のテスト条件下では、抽象的な論理処理に課題があることが示されています。",
        invalid: "応答時間が速すぎるため、評価の妥当性にフラグが立てられました。結果は真の認知能力を反映していない可能性があります。"
      },
      hi: {
        high: "विषय असाधारण पैटर्न मान्यता और अमूर्त तर्क क्षमता प्रदर्शित करता है। संज्ञानात्मक प्रसंस्करण गति 95वें प्रतिशतक से अधिक है।",
        avg: "विषय ठोस तार्किक तर्क और विवरण पर निरंतर ध्यान प्रदर्शित करता है। संज्ञानात्मक मैट्रिक्स एक संतुलित प्रोफ़ाइल के साथ संरेखित होते हैं।",
        low: "प्रदर्शन वर्तमान परीक्षण स्थितियों के तहत अमूर्त तर्क प्रसंस्करण में चुनौतियों का संकेत देता है।",
        invalid: "तेजी से प्रतिक्रिया समय के कारण मूल्यांकन वैधता को चिह्नित किया गया। परिणाम संभवतः वास्तविक संज्ञानात्मक क्षमता को प्रतिबिंबित नहीं करते हैं।"
      },
      ar: {
        high: "يظهر الشخص قدرات استثنائية في التعرف على الأنماط والتفكير المجرد. تتجاوز سرعة المعالجة المعرفية الشريحة المئوية 95.",
        avg: "يظهر الشخص تفكيرًا منطقيًا قويًا واهتمامًا ثابتًا بالتفاصيل. تتماشى المقاييس المعرفية مع ملف تعريف متوازن.",
        low: "يشير الأداء إلى تحديات في معالجة المنطق المجرد في ظل ظروف الاختبار الحالية.",
        invalid: "تم الإبلاغ عن صلاحية التقييم بسبب أوقات الاستجابة السريعة. النتائج على الأرجح لا تعكس الإمكانات المعرفية الحقيقية."
      },
      pt: {
        high: "O sujeito demonstra capacidades excepcionais de reconhecimento de padrões e raciocínio abstrato. A velocidade de processamento cognitivo excede o 95º percentil.",
        avg: "O sujeito exibe raciocínio lógico sólido e atenção consistente aos detalhes. As métricas cognitivas alinham-se com um perfil equilibrado.",
        low: "O desempenho indica desafios no processamento de lógica abstrata nas atuais condições de teste.",
        invalid: "Validade da avaliação sinalizada devido a tempos de resposta rápidos. Os resultados provavelmente não refletem o verdadeiro potencial cognitivo."
      },
      ru: {
        high: "Субъект демонстрирует исключительные способности к распознаванию образов и абстрактному мышлению. Скорость когнитивной обработки превышает 95-й процентиль.",
        avg: "Субъект проявляет твердое логическое мышление и устойчивое внимание к деталям. Когнитивные метрики соответствуют сбалансированному профилю.",
        low: "Результаты указывают на трудности в обработке абстрактной логики в текущих условиях тестирования.",
        invalid: "Валидность оценки поставлена под сомнение из-за быстрого времени ответа. Результаты, вероятно, не отражают истинный когнитивный потенциал."
      }
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
    ],
    'es': [
      { id: 201, category: 'math', correctIndex: 2, text: "Secuencia: 1, 4, 9, 16, 25, ?", options: ["30", "32", "36", "40"] },
      { id: 202, category: 'logic', correctIndex: 0, text: "Si 'Ayer' fue dos días antes de 'Mañana', ¿qué día es 'Hoy'?", options: ["Hoy", "Ayer", "Mañana", "Pasado mañana"] },
      { id: 203, category: 'spatial', correctIndex: 3, text: "¿Qué forma 3D se puede formar doblando una forma de 'T' en 2D?", options: ["Esfera", "Pirámide", "Cilindro", "Cubo"] },
      { id: 204, category: 'verbal', correctIndex: 2, text: "Efímero es a Duradero como...", options: ["Corto es a Breve", "Duro es a Sólido", "Dinámico es a Estático", "Ligero es a Pesado"] },
      { id: 205, category: 'math', correctIndex: 1, text: "2, 6, 12, 20, 30, ?", options: ["40", "42", "44", "46"] },
      { id: 206, category: 'logic', correctIndex: 2, text: "Todos los A son B. Todos los B son C. Por lo tanto:", options: ["Todos los C son A", "Algunos C son A", "Todos los A son C", "Ningún A es C"] },
      { id: 207, category: 'spatial', correctIndex: 0, text: "Un reloj marca las 3:15. En un espejo, ¿qué hora parece ser?", options: ["8:45", "9:45", "3:45", "2:15"] },
      { id: 208, category: 'verbal', correctIndex: 0, text: "Encuentra la palabra diferente:", options: ["Coche", "Rueda", "Volante", "Motor"] },
      { id: 209, category: 'math', correctIndex: 3, text: "Si 3 = 18, 4 = 32, 5 = 50, 6 = 72, entonces 7 = ?", options: ["84", "90", "96", "98"] },
      { id: 210, category: 'logic', correctIndex: 1, text: "¿Qué número reemplaza el signo de interrogación? 6 (14) 4 | 8 ( ? ) 3", options: ["18", "22", "16", "24"] }
    ],
    'fr': [
      { id: 301, category: 'math', correctIndex: 2, text: "Suite : 1, 4, 9, 16, 25, ?", options: ["30", "32", "36", "40"] },
      { id: 302, category: 'logic', correctIndex: 3, text: "A est le frère de B. B est le frère de C. C est le père de D. Quel est le lien entre D et A ?", options: ["Frère", "Cousin", "Oncle", "Neveu/Nièce"] },
      { id: 303, category: 'spatial', correctIndex: 2, text: "Quelle forme 3D peut être formée en pliant une forme en 'T' 2D ?", options: ["Sphère", "Pyramide", "Cube", "Cylindre"] },
      { id: 304, category: 'verbal', correctIndex: 2, text: "Éphémère est à Durable ce que...", options: ["Court est à Bref", "Dur est à Solide", "Dynamique est à Statique", "Léger est à Lourd"] },
      { id: 305, category: 'math', correctIndex: 1, text: "2, 6, 12, 20, 30, ?", options: ["40", "42", "44", "46"] },
      { id: 306, category: 'logic', correctIndex: 2, text: "Tous les A sont B. Tous les B sont C. Donc :", options: ["Tous les C sont A", "Certains C sont A", "Tous les A sont C", "Aucun A n'est C"] },
      { id: 307, category: 'spatial', correctIndex: 0, text: "Une horloge indique 3:15. Reflétée dans un miroir, quelle heure est-il ?", options: ["8:45", "9:45", "3:45", "2:15"] },
      { id: 308, category: 'verbal', correctIndex: 0, text: "Trouvez l'intrus :", options: ["Voiture", "Roue", "Volant", "Moteur"] },
      { id: 309, category: 'math', correctIndex: 3, text: "Si 3 = 18, 4 = 32, 5 = 50, 6 = 72, alors 7 = ?", options: ["84", "90", "96", "98"] },
      { id: 310, category: 'logic', correctIndex: 1, text: "Quel est 15% de 15% de 200 ?", options: ["0.45", "4.5", "45", "0.045"] }
    ],
    'de': [
      { id: 401, category: 'math', correctIndex: 2, text: "Folge: 1, 4, 9, 16, 25, ?", options: ["30", "32", "36", "40"] },
      { id: 402, category: 'logic', correctIndex: 0, text: "Wenn 'Gestern' zwei Tage vor 'Morgen' war, was ist dann 'Heute'?", options: ["Heute", "Gestern", "Morgen", "Übermorgen"] },
      { id: 403, category: 'spatial', correctIndex: 2, text: "Welche 3D-Form entsteht durch Falten einer 2D-'T'-Form?", options: ["Kugel", "Pyramide", "Würfel", "Zylinder"] },
      { id: 404, category: 'verbal', correctIndex: 2, text: "Vergänglich verhält sich zu Dauerhaft wie...", options: ["Kurz zu Knapp", "Hart zu Fest", "Dynamisch zu Statisch", "Leicht zu Schwer"] },
      { id: 405, category: 'math', correctIndex: 1, text: "2, 6, 12, 20, 30, ?", options: ["40", "42", "44", "46"] },
      { id: 406, category: 'logic', correctIndex: 2, text: "Alle A sind B. Alle B sind C. Deshalb:", options: ["Alle C sind A", "Einige C sind A", "Alle A sind C", "Kein A ist C"] },
      { id: 407, category: 'spatial', correctIndex: 0, text: "Eine Uhr zeigt 3:15. Im Spiegel, wie spät ist es?", options: ["8:45", "9:45", "3:45", "2:15"] },
      { id: 408, category: 'verbal', correctIndex: 0, text: "Finde das abweichende Wort:", options: ["Auto", "Rad", "Lenkrad", "Motor"] },
      { id: 409, category: 'math', correctIndex: 3, text: "Wenn 3 = 18, 4 = 32, 5 = 50, 6 = 72, dann 7 = ?", options: ["84", "90", "96", "98"] },
      { id: 410, category: 'logic', correctIndex: 1, text: "Was ist 15% von 15% von 200?", options: ["0.45", "4.5", "45", "0.045"] }
    ],
    'ja': [
      { id: 501, category: 'math', correctIndex: 2, text: "数列: 1, 4, 9, 16, 25, ?", options: ["30", "32", "36", "40"] },
      { id: 502, category: 'logic', correctIndex: 0, text: "「昨日」が「明日」の2日前だった場合、「今日」は？", options: ["今日", "昨日", "明日", "明後日"] },
      { id: 503, category: 'spatial', correctIndex: 2, text: "2Dの「T」字型を折ってできる3D形状は？", options: ["球", "ピラミッド", "立方体", "円柱"] },
      { id: 504, category: 'verbal', correctIndex: 2, text: "「一時的」と「永続的」の関係は、「動的」と...の関係と同じ", options: ["短い", "硬い", "静的", "重い"] },
      { id: 505, category: 'math', correctIndex: 1, text: "2, 6, 12, 20, 30, ?", options: ["40", "42", "44", "46"] },
      { id: 506, category: 'logic', correctIndex: 2, text: "すべてのAはBである。すべてのBはCである。したがって：", options: ["すべてのCはA", "一部のCはA", "すべてのAはC", "AはCではない"] },
      { id: 507, category: 'spatial', correctIndex: 0, text: "時計は3:15を示しています。鏡に映ると何時に見えますか？", options: ["8:45", "9:45", "3:45", "2:15"] },
      { id: 508, category: 'verbal', correctIndex: 0, text: "仲間外れを選んでください：", options: ["車", "タイヤ", "ハンドル", "エンジン"] },
      { id: 509, category: 'math', correctIndex: 3, text: "3 = 18, 4 = 32, 5 = 50, 6 = 72 の場合, 7 = ?", options: ["84", "90", "96", "98"] },
      { id: 510, category: 'logic', correctIndex: 1, text: "200の15%の15%はいくつですか？", options: ["0.45", "4.5", "45", "0.045"] }
    ],
    'hi': [
      { id: 601, category: 'math', correctIndex: 2, text: "अनुक्रम: 1, 4, 9, 16, 25, ?", options: ["30", "32", "36", "40"] },
      { id: 602, category: 'logic', correctIndex: 0, text: "यदि 'कल' (बीता हुआ) 'कल' (आने वाला) से दो दिन पहले था, तो 'आज' क्या है?", options: ["आज", "बीता हुआ कल", "आने वाला कल", "परसों"] },
      { id: 603, category: 'spatial', correctIndex: 2, text: "2D 'T' आकार को मोड़ने पर कौन सा 3D आकार बन सकता है?", options: ["गोला", "पिरामिड", "घन (Cube)", "बेलन"] },
      { id: 604, category: 'verbal', correctIndex: 2, text: "अल्पकालिक का संबंध स्थायी से वैसे ही है जैसे गतिशील का...", options: ["संक्षिप्त", "ठोस", "स्थिर", "भारी"] },
      { id: 605, category: 'math', correctIndex: 1, text: "2, 6, 12, 20, 30, ?", options: ["40", "42", "44", "46"] },
      { id: 606, category: 'logic', correctIndex: 2, text: "सभी A, B हैं। सभी B, C हैं। इसलिए:", options: ["सभी C, A हैं", "कुछ C, A हैं", "सभी A, C हैं", "कोई A, C नहीं है"] },
      { id: 607, category: 'spatial', correctIndex: 0, text: "एक घड़ी 3:15 दिखाती है। दर्पण में यह क्या समय दिखेगा?", options: ["8:45", "9:45", "3:45", "2:15"] },
      { id: 608, category: 'verbal', correctIndex: 0, text: "विषम शब्द चुनें:", options: ["कार", "पहिया", "स्टीयरिंग व्हील", "इंजन"] },
      { id: 609, category: 'math', correctIndex: 3, text: "यदि 3 = 18, 4 = 32, 5 = 50, 6 = 72, तो 7 = ?", options: ["84", "90", "96", "98"] },
      { id: 610, category: 'logic', correctIndex: 1, text: "200 के 15% का 15% क्या है?", options: ["0.45", "4.5", "45", "0.045"] }
    ],
    'ar': [
      { id: 701, category: 'math', correctIndex: 2, text: "التسلسل: 1, 4, 9, 16, 25, ؟", options: ["30", "32", "36", "40"] },
      { id: 702, category: 'logic', correctIndex: 0, text: "إذا كان 'الأمس' قبل يومين من 'الغد'، فما هو 'اليوم'؟", options: ["اليوم", "الأمس", "الغد", "بعد غد"] },
      { id: 703, category: 'spatial', correctIndex: 2, text: "ما الشكل ثلاثي الأبعاد الذي يمكن تشكيله بطي شكل 'T' ثنائي الأبعاد؟", options: ["كرة", "هرم", "مكعب", "اسطوانة"] },
      { id: 704, category: 'verbal', correctIndex: 2, text: "الزائل بالنسبة للدائم مثل الديناميكي بالنسبة لـ...", options: ["قصير", "صلب", "ثابت", "ثقيل"] },
      { id: 705, category: 'math', correctIndex: 1, text: "2, 6, 12, 20, 30, ؟", options: ["40", "42", "44", "46"] },
      { id: 706, category: 'logic', correctIndex: 2, text: "كل A هي B. كل B هي C. إذن:", options: ["كل C هي A", "بعض C هي A", "كل A هي C", "لا توجد A هي C"] },
      { id: 707, category: 'spatial', correctIndex: 0, text: "تظهر الساعة 3:15. في المرآة، كم يبدو الوقت؟", options: ["8:45", "9:45", "3:45", "2:15"] },
      { id: 708, category: 'verbal', correctIndex: 0, text: "أوجد الكلمة المختلفة:", options: ["سيارة", "عجلة", "مقود", "محرك"] },
      { id: 709, category: 'math', correctIndex: 3, text: "إذا كان 3 = 18، 4 = 32، 5 = 50، 6 = 72، فإن 7 = ؟", options: ["84", "90", "96", "98"] },
      { id: 710, category: 'logic', correctIndex: 1, text: "ما هو 15% من 15% من 200؟", options: ["0.45", "4.5", "45", "0.045"] }
    ],
    'pt': [
      { id: 801, category: 'math', correctIndex: 2, text: "Sequência: 1, 4, 9, 16, 25, ?", options: ["30", "32", "36", "40"] },
      { id: 802, category: 'logic', correctIndex: 0, text: "Se 'Ontem' foi dois dias antes de 'Amanhã', o que é 'Hoje'?", options: ["Hoje", "Ontem", "Amanhã", "Depois de amanhã"] },
      { id: 803, category: 'spatial', correctIndex: 2, text: "Que forma 3D pode ser formada dobrando uma forma 'T' 2D?", options: ["Esfera", "Pirâmide", "Cubo", "Cilindro"] },
      { id: 804, category: 'verbal', correctIndex: 2, text: "Efêmero está para Duradouro assim como Dinâmico está para...", options: ["Curto", "Duro", "Estático", "Pesado"] },
      { id: 805, category: 'math', correctIndex: 1, text: "2, 6, 12, 20, 30, ?", options: ["40", "42", "44", "46"] },
      { id: 806, category: 'logic', correctIndex: 2, text: "Todo A é B. Todo B é C. Portanto:", options: ["Todo C é A", "Algum C é A", "Todo A é C", "Nenhum A é C"] },
      { id: 807, category: 'spatial', correctIndex: 0, text: "Um relógio mostra 3:15. Refletido num espelho, que horas parecem ser?", options: ["8:45", "9:45", "3:45", "2:15"] },
      { id: 808, category: 'verbal', correctIndex: 0, text: "Encontre o intruso:", options: ["Carro", "Roda", "Volante", "Motor"] },
      { id: 809, category: 'math', correctIndex: 3, text: "Se 3 = 18, 4 = 32, 5 = 50, 6 = 72, então 7 = ?", options: ["84", "90", "96", "98"] },
      { id: 810, category: 'logic', correctIndex: 1, text: "Quanto é 15% de 15% de 200?", options: ["0.45", "4.5", "45", "0.045"] }
    ],
    'ru': [
      { id: 901, category: 'math', correctIndex: 2, text: "Последовательность: 1, 4, 9, 16, 25, ?", options: ["30", "32", "36", "40"] },
      { id: 902, category: 'logic', correctIndex: 0, text: "Если 'Вчера' было за два дня до 'Завтра', то что такое 'Сегодня'?", options: ["Сегодня", "Вчера", "Завтра", "Послезавтра"] },
      { id: 903, category: 'spatial', correctIndex: 2, text: "Какую 3D-фигуру можно получить, сложив 2D-фигуру 'Т'?", options: ["Сфера", "Пирамида", "Куб", "Цилиндр"] },
      { id: 904, category: 'verbal', correctIndex: 2, text: "Эфемерный относится к Долговечному, как Динамичный к...", options: ["Короткому", "Твердому", "Статичному", "Тяжелому"] },
      { id: 905, category: 'math', correctIndex: 1, text: "2, 6, 12, 20, 30, ?", options: ["40", "42", "44", "46"] },
      { id: 906, category: 'logic', correctIndex: 2, text: "Все А — это В. Все В — это С. Следовательно:", options: ["Все С — это А", "Некоторые С — это А", "Все А — это С", "Ни одно А не является С"] },
      { id: 907, category: 'spatial', correctIndex: 0, text: "Часы показывают 3:15. Сколько времени в зеркальном отражении?", options: ["8:45", "9:45", "3:45", "2:15"] },
      { id: 908, category: 'verbal', correctIndex: 0, text: "Найдите лишнее слово:", options: ["Машина", "Колесо", "Руль", "Двигатель"] },
      { id: 909, category: 'math', correctIndex: 3, text: "Если 3 = 18, 4 = 32, 5 = 50, 6 = 72, то 7 = ?", options: ["84", "90", "96", "98"] },
      { id: 910, category: 'logic', correctIndex: 1, text: "Сколько будет 15% от 15% от 200?", options: ["0.45", "4.5", "45", "0.045"] }
    ]
  };
}