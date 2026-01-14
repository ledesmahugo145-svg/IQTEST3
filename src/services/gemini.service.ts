import { Injectable } from '@angular/core';
import { Question, LanguageCode } from '../types';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  // OFFLINE MODE: No API Key required.
  // This service mimics AI behavior using a curated local database.

  private readonly HISTORY_KEY = 'neurometric_seen_ids';
  private seenQuestionIds: Set<number> = new Set();

  // --- STATIC DATABASE (EXPANDED TO 180+ GLOBAL QUESTIONS) ---
  // Ensuring >15 questions per language to allow at least one full unique retake (10 questions per test)
  private questionBank: Record<string, Question[]> = {
    // English (25 Questions)
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
      { id: 10, category: 'math', correctIndex: 1, text: "What is 15% of 15% of 200?", options: ["0.45", "4.5", "45", "0.045"] },
      { id: 11, category: 'logic', correctIndex: 2, text: "Some kings are queens. All queens are beautiful. Therefore:", options: ["All kings are beautiful", "No kings are beautiful", "Some kings are beautiful", "All beautiful things are kings"] },
      { id: 12, category: 'math', correctIndex: 0, text: "If 5 machines take 5 minutes to make 5 widgets, how long would it take 100 machines to make 100 widgets?", options: ["5 minutes", "100 minutes", "20 minutes", "1 minute"] },
      { id: 13, category: 'spatial', correctIndex: 3, text: "Which letter is the odd one out logically? A, E, I, O, K", options: ["A", "E", "I", "K"] },
      { id: 14, category: 'verbal', correctIndex: 1, text: "Finger is to Hand as Leaf is to...", options: ["Tree", "Branch", "Blossom", "Bark"] },
      { id: 15, category: 'math', correctIndex: 2, text: "Which number is next? 144, 121, 100, 81, 64, ?", options: ["50", "40", "49", "36"] },
      { id: 16, category: 'logic', correctIndex: 0, text: "If you rearrange the letters 'CIFAIPC', you would have the name of a(n):", options: ["Ocean", "Country", "Animal", "City"] },
      { id: 17, category: 'spatial', correctIndex: 1, text: "How many degrees does the minute hand move in 20 minutes?", options: ["90", "120", "180", "60"] },
      { id: 18, category: 'math', correctIndex: 3, text: "Solve: (8 / 4) * (6 - 2) + 1", options: ["10", "12", "5", "9"] },
      { id: 19, category: 'verbal', correctIndex: 0, text: "Which word means the same as 'Ubiquitous'?", options: ["Omnipresent", "Rare", "Unique", "Hidden"] },
      { id: 20, category: 'logic', correctIndex: 2, text: "Tom is taller than Peter. Peter is shorter than John. John is taller than Tom. Who is the tallest?", options: ["Tom", "Peter", "John", "Cannot determine"] },
      { id: 21, category: 'math', correctIndex: 1, text: "A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much is the ball?", options: ["$0.10", "$0.05", "$0.01", "$0.50"] },
      { id: 22, category: 'spatial', correctIndex: 0, text: "Identify the missing part of the pattern: O, T, T, F, F, S, S, E, ?", options: ["N (Nine)", "T (Ten)", "E (Eight)", "O (One)"] },
      { id: 23, category: 'logic', correctIndex: 3, text: "Which conclusion follows? All flowers are plants. No plants are stones.", options: ["No flowers are plants", "Some stones are flowers", "All stones are plants", "No flowers are stones"] },
      { id: 24, category: 'math', correctIndex: 2, text: "If x + y = 10 and x - y = 4, what is x?", options: ["5", "6", "7", "8"] },
      { id: 25, category: 'verbal', correctIndex: 1, text: "Candid is to Frank as Secretive is to...", options: ["Open", "Reticent", "Honest", "Bold"] }
    ],

    // Chinese (25 Questions)
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
      { id: 110, category: 'logic', correctIndex: 1, text: "医生给了你3颗药丸，要你每半小时吃一颗，请问吃完需要多长时间？", options: ["1.5小时", "1小时", "2小时", "3小时"] },
      { id: 111, category: 'math', correctIndex: 0, text: "池塘里的睡莲每天面积扩大一倍。如果第30天长满池塘，第几天时长满一半？", options: ["第29天", "第15天", "第28天", "第20天"] },
      { id: 112, category: 'verbal', correctIndex: 2, text: "“南辕北辙”最接近的意思是：", options: ["行动缓慢", "迷失方向", "行动与目的相反", "固执己见"] },
      { id: 113, category: 'logic', correctIndex: 1, text: "甲乙丙丁四人。甲说：乙在撒谎。乙说：丙在撒谎。丙说：甲乙都在撒谎。丁说：乙在说真话。只有一个人说真话，是谁？", options: ["甲", "乙", "丙", "丁"] },
      { id: 114, category: 'spatial', correctIndex: 0, text: "时钟在3点30分时，时针和分针的夹角是多少度？", options: ["75度", "90度", "105度", "60度"] },
      { id: 115, category: 'math', correctIndex: 3, text: "1/2, 1/4, 1/8, 1/16, ... 下一个数是？", options: ["1/18", "1/24", "1/30", "1/32"] },
      { id: 116, category: 'logic', correctIndex: 1, text: "如果“所有金属都导电”为真，那么“有些金属不导电”是：", options: ["真", "假", "不确定", "无意义"] },
      { id: 117, category: 'verbal', correctIndex: 2, text: "找出下列成语中的错别字：“按布就班”", options: ["按", "布 (应为部)", "就", "班"] },
      { id: 118, category: 'math', correctIndex: 0, text: "某商品先提价20%，又降价20%，现价与原价相比：", options: ["降低了", "升高了", "不变", "无法比较"] },
      { id: 119, category: 'spatial', correctIndex: 2, text: "正方体有几个顶点？", options: ["6", "12", "8", "4"] },
      { id: 120, category: 'math', correctIndex: 1, text: "找规律：88, 64, 24, ... ?", options: ["12", "8", "10", "6"] },
      { id: 121, category: 'verbal', correctIndex: 3, text: "与“虽然...但是...”关系最相似的是：", options: ["因为...所以...", "如果...就...", "不但...而且...", "尽管...还是..."] },
      { id: 122, category: 'logic', correctIndex: 0, text: "如果 A > B, B = C, C < D，则必然：", options: ["A > C", "A < D", "B > D", "A = D"] },
      { id: 123, category: 'math', correctIndex: 2, text: "鸡兔同笼，共35头，94足。问鸡有几只？", options: ["12", "20", "23", "30"] },
      { id: 124, category: 'verbal', correctIndex: 0, text: "“罄竹难书”通常用来形容：", options: ["罪行极多", "文章优美", "竹子茂密", "历史悠久"] },
      { id: 125, category: 'spatial', correctIndex: 1, text: "圆柱体展开后的侧面是什么形状？", options: ["圆形", "长方形/正方形", "三角形", "椭圆形"] }
    ],

    // Spanish (20 Questions)
    'es': [
      { id: 201, category: 'math', correctIndex: 2, text: "Secuencia: 2, 4, 8, 16, ?", options: ["24", "30", "32", "36"] },
      { id: 202, category: 'logic', correctIndex: 0, text: "Si 3 gatos cazan 3 ratones en 3 minutos, ¿cuántos gatos cazan 100 ratones en 100 minutos?", options: ["3", "100", "30", "1"] },
      { id: 203, category: 'spatial', correctIndex: 1, text: "¿Cuántos lados tiene un hexágono?", options: ["5", "6", "8", "7"] },
      { id: 204, category: 'verbal', correctIndex: 3, text: "Agua es a Tubería como Electricidad es a...", options: ["Rayo", "Corriente", "Bombilla", "Cable"] },
      { id: 205, category: 'math', correctIndex: 1, text: "100 - 10 / 2 = ?", options: ["45", "95", "50", "90"] },
      { id: 206, category: 'logic', correctIndex: 2, text: "¿Qué número sigue? 1, 1, 2, 3, 5, 8...", options: ["11", "12", "13", "14"] },
      { id: 207, category: 'verbal', correctIndex: 0, text: "Sinónimo de 'Efímero'", options: ["Breve", "Eterno", "Fuerte", "Largo"] },
      { id: 208, category: 'math', correctIndex: 3, text: "¿Cuál es el 20% de 500?", options: ["50", "20", "200", "100"] },
      { id: 209, category: 'spatial', correctIndex: 0, text: "¿Qué objeto no pertenece al grupo?", options: ["Cubo", "Triángulo", "Esfera", "Pirámide"] },
      { id: 210, category: 'logic', correctIndex: 1, text: "Pedro es más alto que Juan. Juan es más alto que Luis. ¿Quién es más bajo?", options: ["Pedro", "Luis", "Juan", "Todos igual"] },
      { id: 211, category: 'math', correctIndex: 2, text: "5 x 5 + 5 - 5 = ?", options: ["20", "30", "25", "5"] },
      { id: 212, category: 'verbal', correctIndex: 0, text: "Madrid es a España como París es a...", options: ["Francia", "Europa", "Italia", "Londres"] },
      { id: 213, category: 'logic', correctIndex: 3, text: "Ningún pez es perro. Todo perro es mamífero. Por lo tanto:", options: ["Todo pez es mamífero", "Algún pez es mamífero", "Todo mamífero es pez", "Algún mamífero no es pez"] },
      { id: 214, category: 'spatial', correctIndex: 1, text: "Si giras un cuadrado 45 grados, obtienes un...", options: ["Círculo", "Rombo", "Triángulo", "Rectángulo"] },
      { id: 215, category: 'math', correctIndex: 0, text: "Siguiente primo: 2, 3, 5, 7, 11, ?", options: ["13", "15", "17", "19"] },
      { id: 216, category: 'verbal', correctIndex: 2, text: "Luz es a Oscuridad como Ruido es a...", options: ["Sonido", "Música", "Silencio", "Oído"] },
      { id: 217, category: 'math', correctIndex: 1, text: "¿Cuánto es la mitad de 2 más 2?", options: ["2", "3", "4", "1"] },
      { id: 218, category: 'logic', correctIndex: 0, text: "El padre de Ana tiene 5 hijas: Nana, Nene, Nini, Nono. ¿Cómo se llama la quinta?", options: ["Ana", "Nunu", "Nina", "No se sabe"] },
      { id: 219, category: 'spatial', correctIndex: 3, text: "¿Qué figura tiene 4 lados iguales y 4 ángulos rectos?", options: ["Rombo", "Trapecio", "Rectángulo", "Cuadrado"] },
      { id: 220, category: 'logic', correctIndex: 2, text: "Si A = 1, B = 2, C = 3, entonces A + B + C = ?", options: ["5", "4", "6", "7"] }
    ],

    // French (20 Questions)
    'fr': [
      { id: 301, category: 'math', correctIndex: 3, text: "Suite logique : 3, 6, 12, 24, ?", options: ["30", "36", "42", "48"] },
      { id: 302, category: 'verbal', correctIndex: 1, text: "Lequel est l'intrus ?", options: ["Pomme", "Carotte", "Banane", "Raisin"] },
      { id: 303, category: 'logic', correctIndex: 0, text: "Tous les A sont B. Certains B sont C. Donc :", options: ["On ne peut rien conclure", "Certains A sont C", "Tous les A sont C", "Aucun A n'est C"] },
      { id: 304, category: 'spatial', correctIndex: 2, text: "Combien de faces possède un cube ?", options: ["4", "8", "6", "12"] },
      { id: 305, category: 'math', correctIndex: 1, text: "Quel est le quart de la moitié de 16 ?", options: ["4", "2", "1", "8"] },
      { id: 306, category: 'verbal', correctIndex: 2, text: "Livre est à Lire comme Couteau est à...", options: ["Manger", "Fourchette", "Couper", "Table"] },
      { id: 307, category: 'math', correctIndex: 0, text: "8 + 8 / 8 + 8 * 8 - 8 = ?", options: ["65", "0", "72", "16"] },
      { id: 308, category: 'logic', correctIndex: 3, text: "Marie court plus vite que Sophie. Sophie court plus vite que Jeanne. Qui est la plus lente ?", options: ["Marie", "Sophie", "Personne", "Jeanne"] },
      { id: 309, category: 'spatial', correctIndex: 1, text: "Quelle figure complète la série : Cercle, Triangle, Carré, ... ?", options: ["Ligne", "Pentagone", "Point", "Ovale"] },
      { id: 310, category: 'verbal', correctIndex: 0, text: "Antonyme de 'Sombre' ?", options: ["Lumineux", "Triste", "Noir", "Nuit"] },
      { id: 311, category: 'math', correctIndex: 2, text: "Si 1 = 5, 2 = 25, 3 = 125, 4 = 625, 5 = ?", options: ["3125", "5", "1", "0"] },
      { id: 312, category: 'logic', correctIndex: 1, text: "Quelle lettre suit ? A, C, E, G, ...", options: ["H", "I", "J", "K"] },
      { id: 313, category: 'math', correctIndex: 0, text: "Combien font 7 x 8 ?", options: ["56", "48", "64", "54"] },
      { id: 314, category: 'verbal', correctIndex: 3, text: "Trouvez l'intrus :", options: ["Paris", "Londres", "Rome", "Europe"] },
      { id: 315, category: 'spatial', correctIndex: 1, text: "La somme des angles d'un triangle est :", options: ["90°", "180°", "360°", "270°"] },
      { id: 316, category: 'logic', correctIndex: 2, text: "Si hier était demain, aujourd'hui serait samedi. Quel jour sommes-nous ?", options: ["Samedi", "Dimanche", "Lundi", "Mardi"] },
      { id: 317, category: 'math', correctIndex: 0, text: "La racine carrée de 81 est :", options: ["9", "8", "7", "6"] },
      { id: 318, category: 'verbal', correctIndex: 2, text: "Lequel n'est pas une couleur ?", options: ["Azur", "Pourpre", "Transparent", "Cramoisi"] },
      { id: 319, category: 'spatial', correctIndex: 3, text: "Quelle forme a un ballon de football classique (motifs) ?", options: ["Carrés", "Triangles", "Cercles", "Hexagones et Pentagones"] },
      { id: 320, category: 'logic', correctIndex: 1, text: "Pierre a 10 ans. Sa sœur a la moitié de son âge. Quand Pierre aura 50 ans, quel âge aura sa sœur ?", options: ["25", "45", "40", "50"] }
    ],

    // German (18 Questions)
    'de': [
      { id: 401, category: 'math', correctIndex: 0, text: "Welche Zahl folgt? 81, 27, 9, ?", options: ["3", "6", "1", "0"] },
      { id: 402, category: 'logic', correctIndex: 1, text: "Montag ist zu Dienstag wie Januar zu...", options: ["März", "Februar", "Winter", "Jahr"] },
      { id: 403, category: 'spatial', correctIndex: 2, text: "Wie viele Ecken hat ein Würfel?", options: ["6", "12", "8", "4"] },
      { id: 404, category: 'verbal', correctIndex: 3, text: "Gegenteil von 'Optimistisch'?", options: ["Glücklich", "Traurig", "Realistisch", "Pessimistisch"] },
      { id: 405, category: 'math', correctIndex: 2, text: "15 + 15 / 3 = ?", options: ["10", "30", "20", "5"] },
      { id: 406, category: 'logic', correctIndex: 0, text: "Wenn A > B und B > C, dann ist...", options: ["A > C", "A < C", "A = C", "Unklar"] },
      { id: 407, category: 'math', correctIndex: 1, text: "Wurzel aus 64?", options: ["6", "8", "4", "12"] },
      { id: 408, category: 'spatial', correctIndex: 3, text: "Welches passt nicht? Kreis, Oval, Kugel, Dreieck", options: ["Kreis", "Oval", "Kugel", "Dreieck"] },
      { id: 409, category: 'verbal', correctIndex: 0, text: "Hand ist zu Handschuh wie Fuß zu...", options: ["Socke", "Zeh", "Bein", "Gehen"] },
      { id: 410, category: 'logic', correctIndex: 2, text: "1, 1, 2, 3, 5, 8, ...?", options: ["11", "12", "13", "14"] },
      { id: 411, category: 'math', correctIndex: 1, text: "Ein Auto fährt 60 km/h. Wie weit kommt es in 20 Minuten?", options: ["10 km", "20 km", "30 km", "40 km"] },
      { id: 412, category: 'spatial', correctIndex: 0, text: "Wie viel Grad hat ein rechter Winkel?", options: ["90", "180", "45", "360"] },
      { id: 413, category: 'verbal', correctIndex: 1, text: "Welches Wort passt nicht?", options: ["Gehen", "Stuhl", "Laufen", "Rennen"] },
      { id: 414, category: 'math', correctIndex: 3, text: "3 mal 3 plus 3?", options: ["9", "6", "15", "12"] },
      { id: 415, category: 'logic', correctIndex: 0, text: "Der Vater von Monika hat 4 Töchter: Lala, Lele, Lili... Wie heißt die vierte?", options: ["Monika", "Lolo", "Lulu", "Susanne"] },
      { id: 416, category: 'spatial', correctIndex: 2, text: "Welche Form hat ein Stoppschild?", options: ["Sechseck", "Kreis", "Achteck", "Quadrat"] },
      { id: 417, category: 'verbal', correctIndex: 1, text: "Brot ist zu Bäcker wie Haus ist zu...", options: ["Mauer", "Architekt", "Stein", "Dach"] },
      { id: 418, category: 'math', correctIndex: 0, text: "Wie viel ist 10% von 1000?", options: ["100", "10", "50", "1"] }
    ],

    // Japanese (18 Questions)
    'ja': [
      { id: 501, category: 'math', correctIndex: 1, text: "数列: 1, 2, 4, 7, 11, ?", options: ["15", "16", "14", "18"] },
      { id: 502, category: 'logic', correctIndex: 2, text: "AはBより背が高い。BはCより背が高い。最も背が低いのは？", options: ["A", "B", "C", "分からない"] },
      { id: 503, category: 'verbal', correctIndex: 0, text: "「犬」に対する「動物」の関係は、「リンゴ」に対する...", options: ["果物", "赤", "美味しい", "木"] },
      { id: 504, category: 'spatial', correctIndex: 3, text: "サイコロの反対側の目の和は常にいくつ？", options: ["6", "10", "12", "7"] },
      { id: 505, category: 'math', correctIndex: 0, text: "100の半分を2で割ると？", options: ["25", "50", "10", "5"] },
      { id: 506, category: 'logic', correctIndex: 1, text: "ある月が日曜日で始まるとき、その月の13日は何曜日？", options: ["木曜日", "金曜日", "土曜日", "日曜日"] },
      { id: 507, category: 'math', correctIndex: 2, text: "3 + 3 x 3 - 3 = ?", options: ["0", "6", "9", "12"] },
      { id: 508, category: 'verbal', correctIndex: 1, text: "「暑い」の対義語は？", options: ["暖かい", "寒い", "冷たい", "涼しい"] },
      { id: 509, category: 'spatial', correctIndex: 0, text: "三角形の内角の和は？", options: ["180度", "360度", "90度", "270度"] },
      { id: 510, category: 'logic', correctIndex: 3, text: "次のうち、仲間外れはどれ？", options: ["東京", "大阪", "福岡", "日本"] },
      { id: 511, category: 'math', correctIndex: 1, text: "2の3乗は？", options: ["6", "8", "9", "4"] },
      { id: 512, category: 'logic', correctIndex: 0, text: "昨日の明日の明後日は？", options: ["明後日", "明日", "今日", "明明後日"] },
      { id: 513, category: 'verbal', correctIndex: 2, text: "「医者」が「病院」なら、「教師」は？", options: ["生徒", "黒板", "学校", "勉強"] },
      { id: 514, category: 'math', correctIndex: 3, text: "次はどの数字？ 5, 10, 20, 40, ...", options: ["60", "70", "50", "80"] },
      { id: 515, category: 'spatial', correctIndex: 1, text: "日本の国旗の形は？", options: ["三角形", "長方形", "正方形", "円形"] },
      { id: 516, category: 'logic', correctIndex: 0, text: "朝の次は昼、昼の次は？", options: ["夜", "夕方", "深夜", "朝"] },
      { id: 517, category: 'verbal', correctIndex: 1, text: "「海」に関係ないものは？", options: ["魚", "山", "船", "波"] },
      { id: 518, category: 'math', correctIndex: 2, text: "1時間は何秒？", options: ["60秒", "600秒", "3600秒", "360秒"] }
    ],

    // Portuguese (16 Questions)
    'pt': [
      { id: 601, category: 'math', correctIndex: 2, text: "Sequência: 5, 10, 20, 40, ?", options: ["60", "70", "80", "100"] },
      { id: 602, category: 'logic', correctIndex: 1, text: "Se alguns carros são vermelhos e tudo o que é vermelho brilha, então:", options: ["Todos os carros brilham", "Alguns carros brilham", "Nada brilha", "Carros não brilham"] },
      { id: 603, category: 'verbal', correctIndex: 3, text: "O que não pertence ao grupo?", options: ["Azul", "Verde", "Amarelo", "Cadeira"] },
      { id: 604, category: 'spatial', correctIndex: 0, text: "Qual figura tem 3 lados?", options: ["Triângulo", "Quadrado", "Círculo", "Retângulo"] },
      { id: 605, category: 'math', correctIndex: 1, text: "Qual é a raiz quadrada de 144?", options: ["10", "12", "14", "16"] },
      { id: 606, category: 'logic', correctIndex: 2, text: "Qual letra continua a série? A, D, G, J, ...", options: ["K", "L", "M", "N"] },
      { id: 607, category: 'verbal', correctIndex: 0, text: "Quente está para Frio assim como Luz está para...", options: ["Escuridão", "Sol", "Dia", "Brilho"] },
      { id: 608, category: 'math', correctIndex: 3, text: "20% de 50 é?", options: ["5", "20", "25", "10"] },
      { id: 609, category: 'spatial', correctIndex: 1, text: "Quantos ângulos retos tem um quadrado?", options: ["2", "4", "6", "8"] },
      { id: 610, category: 'logic', correctIndex: 0, text: "Se hoje é sábado, que dia foi há 2 dias?", options: ["Quinta-feira", "Sexta-feira", "Quarta-feira", "Domingo"] },
      { id: 611, category: 'verbal', correctIndex: 2, text: "Médico está para Hospital assim como Professor está para...", options: ["Aluno", "Estudo", "Escola", "Livro"] },
      { id: 612, category: 'math', correctIndex: 1, text: "Quanto é 7 vezes 8?", options: ["54", "56", "58", "60"] },
      { id: 613, category: 'logic', correctIndex: 0, text: "O pai do padre é filho do meu pai. Quem sou eu?", options: ["O pai do padre", "O padre", "O avô", "O tio"] },
      { id: 614, category: 'spatial', correctIndex: 3, text: "Qual objeto é esférico?", options: ["Dado", "Pirâmide", "Livro", "Bola"] },
      { id: 615, category: 'math', correctIndex: 2, text: "Próximo número: 1, 3, 5, 7, ...", options: ["8", "10", "9", "11"] },
      { id: 616, category: 'verbal', correctIndex: 1, text: "Antônimo de 'Rápido'?", options: ["Veloz", "Lento", "Forte", "Ágil"] }
    ],

    // Russian (16 Questions)
    'ru': [
      { id: 701, category: 'math', correctIndex: 3, text: "Продолжите ряд: 2, 5, 10, 17, ?", options: ["24", "25", "28", "26"] },
      { id: 702, category: 'verbal', correctIndex: 0, text: "Холодно относится к Горячо, как Тьма относится к...", options: ["Свет", "Вечер", "Лампа", "Ночь"] },
      { id: 703, category: 'logic', correctIndex: 2, text: "У Ивана было 5 яблок. Он отдал 2, но получил 3. Сколько у него яблок?", options: ["5", "8", "6", "4"] },
      { id: 704, category: 'spatial', correctIndex: 1, text: "Сколько градусов в прямом угле?", options: ["45", "90", "180", "360"] },
      { id: 705, category: 'math', correctIndex: 0, text: "Чему равно 0,5 умножить на 0,5?", options: ["0,25", "0,5", "1", "2,5"] },
      { id: 706, category: 'logic', correctIndex: 3, text: "Что тяжелее: килограмм ваты или килограмм железа?", options: ["Вата", "Железо", "Невозможно сравнить", "Одинаково"] },
      { id: 707, category: 'verbal', correctIndex: 1, text: "Найдите лишнее слово:", options: ["Стол", "Яблоко", "Стул", "Шкаф"] },
      { id: 708, category: 'math', correctIndex: 2, text: "30 разделить на 0,5 плюс 10 равно?", options: ["25", "40", "70", "50"] },
      { id: 709, category: 'spatial', correctIndex: 0, text: "Какая фигура имеет 3 угла?", options: ["Треугольник", "Квадрат", "Круг", "Ромб"] },
      { id: 710, category: 'logic', correctIndex: 1, text: "Брат моей сестры - это мой...", options: ["Дядя", "Брат", "Отец", "Племянник"] },
      { id: 711, category: 'math', correctIndex: 2, text: "Сколько будет 2 + 2 * 2?", options: ["8", "5", "6", "4"] },
      { id: 712, category: 'verbal', correctIndex: 0, text: "Синоним слова 'Храбрый'", options: ["Смелый", "Трусливый", "Слабый", "Умный"] },
      { id: 713, category: 'spatial', correctIndex: 3, text: "Какой формы Земля?", options: ["Плоская", "Квадратная", "Треугольная", "Шарообразная"] },
      { id: 714, category: 'logic', correctIndex: 1, text: "Если сегодня понедельник, то какой день был вчера?", options: ["Вторник", "Воскресенье", "Суббота", "Среда"] },
      { id: 715, category: 'math', correctIndex: 0, text: "Корень из 100?", options: ["10", "50", "20", "5"] },
      { id: 716, category: 'verbal', correctIndex: 2, text: "Вода : Жажда :: Еда : ...", options: ["Пить", "Вкус", "Голод", "Хлеб"] }
    ],

    // Arabic (16 Questions)
    'ar': [
      { id: 801, category: 'math', correctIndex: 2, text: "أكمل المتتالية: 3، 6، 9، 12، ؟", options: ["13", "14", "15", "16"] },
      { id: 802, category: 'logic', correctIndex: 1, text: "إذا كان جميع البشر فانون، وسقراط بشر، فماذا نستنتج؟", options: ["سقراط خالد", "سقراط فانٍ", "سقراط ذكي", "لا شيء"] },
      { id: 803, category: 'verbal', correctIndex: 3, text: "ما هو عكس كلمة 'سريع'؟", options: ["قوي", "ذكي", "كبير", "بطيء"] },
      { id: 804, category: 'spatial', correctIndex: 0, text: "كم عدد أضلاع المثلث؟", options: ["3", "4", "5", "6"] },
      { id: 805, category: 'math', correctIndex: 2, text: "ما هو نصف العدد 50؟", options: ["20", "30", "25", "15"] },
      { id: 806, category: 'logic', correctIndex: 0, text: "إذا كانت الشمس تشرق من الشرق، فمن أين تغرب؟", options: ["الغرب", "الشمال", "الجنوب", "الشرق"] },
      { id: 807, category: 'verbal', correctIndex: 1, text: "أكمل المثل: الوقت كالسيف إن لم تقطعه...", options: ["جرحك", "قطعك", "قتلك", "فاتك"] },
      { id: 808, category: 'math', correctIndex: 3, text: "10 * 10 - 50 = ؟", options: ["0", "10", "25", "50"] },
      { id: 809, category: 'spatial', correctIndex: 2, text: "أي شكل ليس له زوايا؟", options: ["مربع", "مثلث", "دائرة", "مستطيل"] },
      { id: 810, category: 'logic', correctIndex: 0, text: "والد أحمد لديه 3 أبناء: محمد، عمر، و...؟", options: ["أحمد", "علي", "خالد", "يوسف"] },
      { id: 811, category: 'math', correctIndex: 1, text: "كم دقيقة في الساعة؟", options: ["50", "60", "100", "24"] },
      { id: 812, category: 'verbal', correctIndex: 2, text: "ما هو جمع كلمة 'كتاب'؟", options: ["كاتب", "مكتبة", "كتب", "كتيب"] },
      { id: 813, category: 'spatial', correctIndex: 3, text: "الشكل الذي له 4 أضلاع متساوية هو؟", options: ["مستطيل", "مثلث", "دائرة", "مربع"] },
      { id: 814, category: 'logic', correctIndex: 0, text: "اليوم هو الجمعة. ماذا كان أمس؟", options: ["الخميس", "السبت", "الأربعاء", "الأحد"] },
      { id: 815, category: 'math', correctIndex: 1, text: "5 + 5 * 2 = ؟", options: ["20", "15", "25", "12"] },
      { id: 816, category: 'verbal', correctIndex: 2, text: "الأسد بالنسبة للغابة مثل الحوت بالنسبة لـ...", options: ["الصحراء", "السماء", "البحر", "الجبل"] }
    ],

    // Hindi (16 Questions)
    'hi': [
      { id: 901, category: 'math', correctIndex: 1, text: "श्रृंखला पूरी करें: 5, 10, 15, 20, ?", options: ["22", "25", "30", "35"] },
      { id: 902, category: 'verbal', correctIndex: 0, text: "जैसे 'दिन' का संबंध 'रात' से है, वैसे ही 'सफेद' का संबंध किससे है?", options: ["काला", "लाल", "नीला", "पीला"] },
      { id: 903, category: 'logic', correctIndex: 2, text: "यदि A, B का भाई है और B, C की बहन है, तो A का C से क्या संबंध है?", options: ["पिता", "चाचा", "भाई", "पुत्र"] },
      { id: 904, category: 'spatial', correctIndex: 3, text: "एक वर्ग (Square) में कितनी भुजाएँ होती हैं?", options: ["2", "3", "5", "4"] },
      { id: 905, category: 'math', correctIndex: 0, text: "10 का वर्ग (Square) क्या है?", options: ["100", "20", "50", "1000"] },
      { id: 906, category: 'logic', correctIndex: 1, text: "अगली संख्या क्या है? 1, 3, 5, 7, ...", options: ["8", "9", "10", "11"] },
      { id: 907, category: 'verbal', correctIndex: 2, text: "'जल' का पर्यायवाची क्या है?", options: ["अग्नि", "वायु", "पानी", "पृथ्वी"] },
      { id: 908, category: 'math', correctIndex: 3, text: "50 का 50% क्या है?", options: ["10", "20", "50", "25"] },
      { id: 909, category: 'spatial', correctIndex: 0, text: "त्रिभुज के तीनों कोणों का योग कितना होता है?", options: ["180 डिग्री", "90 डिग्री", "360 डिग्री", "100 डिग्री"] },
      { id: 910, category: 'logic', correctIndex: 1, text: "राम, श्याम से लंबा है। श्याम, मोहन से लंबा है। सबसे छोटा कौन है?", options: ["राम", "मोहन", "श्याम", "पता नहीं"] },
      { id: 911, category: 'math', correctIndex: 2, text: "2 + 2 x 2 = ?", options: ["8", "5", "6", "10"] },
      { id: 912, category: 'verbal', correctIndex: 0, text: "'सूरज' किस दिशा से निकलता है?", options: ["पूर्व", "पश्चिम", "उत्तर", "दक्षिण"] },
      { id: 913, category: 'spatial', correctIndex: 1, text: "गोल (Circle) में कितने कोने होते हैं?", options: ["1", "0", "4", "अनंत"] },
      { id: 914, category: 'logic', correctIndex: 3, text: "यदि कल रविवार था, तो आज क्या है?", options: ["मंगलवार", "शनिवार", "बुधवार", "सोमवार"] },
      { id: 915, category: 'math', correctIndex: 0, text: "100 में से 10 घटाने पर क्या बचेगा?", options: ["90", "110", "80", "0"] },
      { id: 916, category: 'verbal', correctIndex: 2, text: "पक्षी : आकाश :: मछली : ...", options: ["ज़मीन", "पेड़", "पानी", "पहाड़"] }
    ]
  };

  constructor() {
    this.loadHistory();
    console.log('NeuroMetric Local Core: Initialized in Offline Mode.');
  }

  isConfigured(): boolean {
    return true;
  }

  private loadHistory() {
    try {
      const stored = localStorage.getItem(this.HISTORY_KEY);
      if (stored) {
        this.seenQuestionIds = new Set(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to load question history', e);
    }
  }

  private saveHistory() {
    try {
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(Array.from(this.seenQuestionIds)));
    } catch (e) {
      console.warn('Failed to save question history', e);
    }
  }

  async generateTest(language: LanguageCode): Promise<Question[]> {
    // 1. SIMULATE AI DELAY
    const delay = Math.floor(Math.random() * 1000) + 1500;
    await new Promise(resolve => setTimeout(resolve, delay));

    // 2. RETRIEVE QUESTIONS
    // Try to get questions for the specific language, fallback to English if not found
    let rawQuestions = this.questionBank[language];
    
    // Fallback logic
    if (!rawQuestions || rawQuestions.length === 0) {
      console.warn(`Language '${language}' not in local DB, falling back to English.`);
      rawQuestions = this.questionBank['en'];
    }

    // 3. FILTER BY HISTORY (SEEN vs UNSEEN)
    const unseen = rawQuestions.filter(q => !this.seenQuestionIds.has(q.id));
    const seen = rawQuestions.filter(q => this.seenQuestionIds.has(q.id));

    // 4. SHUFFLE BOTH POOLS
    const shuffledUnseen = [...unseen].sort(() => 0.5 - Math.random());
    const shuffledSeen = [...seen].sort(() => 0.5 - Math.random());

    // 5. SELECT 10 QUESTIONS (Prioritize Unseen)
    const TARGET_COUNT = 10;
    let selected: Question[] = [];

    // Take as many unseen as possible up to target
    selected.push(...shuffledUnseen.slice(0, TARGET_COUNT));

    // If we need more, take from seen pool
    if (selected.length < TARGET_COUNT) {
      const remaining = TARGET_COUNT - selected.length;
      selected.push(...shuffledSeen.slice(0, remaining));
    }

    // 6. UPDATE HISTORY & RE-FORMAT FOR UI
    // We update history immediately when generated so they count as "seen" for next time
    selected.forEach(q => this.seenQuestionIds.add(q.id));
    this.saveHistory();

    // Re-index them for the UI (1, 2, 3...) regardless of internal ID
    return selected.map((q, index) => ({
      ...q,
      id: index + 1 // Internal ID hidden, UI shows 1-10
    }));
  }

  async generateAnalysis(iq: number, language: LanguageCode, validity: string): Promise<string> {
    // SIMULATE AI ANALYSIS GENERATION
    await new Promise(resolve => setTimeout(resolve, 1500));

    const isHigh = iq >= 120;
    const isAvg = iq >= 90 && iq < 120;
    
    // Multilingual Templates
    const templates: Record<string, { high: string, avg: string, low: string, invalid: string }> = {
      en: {
        high: "Subject demonstrates exceptional pattern recognition and abstract reasoning capabilities. Cognitive processing speed exceeds the 95th percentile, indicating superior fluid intelligence.",
        avg: "Subject displays solid logical reasoning and consistent attention to detail. Cognitive metrics align with a balanced profile, showing potential in specific analytical domains.",
        low: "Performance indicates challenges in abstract logic processing under current test conditions. Results may be influenced by external factors or specific cognitive processing styles.",
        invalid: "Assessment validity flagged due to rapid response times. Results likely do not reflect true cognitive potential; re-evaluation under controlled conditions is recommended."
      },
      zh: {
        high: "受试者表现出卓越的模式识别和抽象推理能力。认知处理速度超过第95百分位，表明具有卓越的流体智力。",
        avg: "受试者显示出扎实的逻辑推理能力和持续的细节关注力。认知指标符合平衡的特征，显示在特定分析领域的潜力。",
        low: "在当前测试条件下，表现显示出抽象逻辑处理方面的挑战。结果可能受到外部因素或特定认知处理风格的影响。",
        invalid: "由于反应时间过快，评估有效性被标记。结果可能无法反映真实的认知潜力；建议在受控条件下重新评估。"
      },
      es: {
        high: "El sujeto demuestra capacidades excepcionales de reconocimiento de patrones y razonamiento abstracto. La velocidad de procesamiento cognitivo supera el percentil 95.",
        avg: "El sujeto muestra un razonamiento lógico sólido y una atención constante a los detalles. Las métricas cognitivas se alinean con un perfil equilibrado.",
        low: "El rendimiento indica desafíos en el procesamiento lógico abstracto bajo las condiciones actuales de la prueba.",
        invalid: "Validez de la evaluación marcada debido a tiempos de respuesta rápidos. Es probable que los resultados no reflejen el verdadero potencial cognitivo."
      },
      fr: {
        high: "Le sujet démontre des capacités exceptionnelles de reconnaissance de formes et de raisonnement abstrait. La vitesse de traitement cognitif dépasse le 95e centile.",
        avg: "Le sujet fait preuve d'un raisonnement logique solide et d'une attention constante aux détails. Les métriques cognitives correspondent à un profil équilibré.",
        low: "La performance indique des défis dans le traitement de la logique abstraite dans les conditions actuelles du test.",
        invalid: "Validité de l'évaluation signalée en raison de temps de réponse rapides. Les résultats ne reflètent probablement pas le véritable potentiel cognitif."
      },
      de: {
        high: "Das Subjekt zeigt außergewöhnliche Fähigkeiten in Mustererkennung und abstraktem Denken. Die kognitive Verarbeitungsgeschwindigkeit liegt über dem 95. Perzentil.",
        avg: "Das Subjekt zeigt solide logische Schlussfolgerungen und konsistente Detailgenauigkeit. Die kognitiven Metriken entsprechen einem ausgewogenen Profil.",
        low: "Die Leistung deutet auf Herausforderungen bei der Verarbeitung abstrakter Logik unter den aktuellen Testbedingungen hin.",
        invalid: "Bewertungsgültigkeit aufgrund schneller Reaktionszeiten markiert. Ergebnisse spiegeln wahrscheinlich nicht das wahre kognitive Potenzial wider."
      },
      ja: {
        high: "被験者は卓越したパターン認識と抽象的推論能力を示しています。認知的処理速度は95パーセンタイルを超え、優れた流動性知能を示唆しています。",
        avg: "被験者は堅実な論理的推論と一貫した細部への注意を示しています。認知指標はバランスの取れたプロファイルと一致しています。",
        low: "現在のテスト条件下では、抽象的な論理処理に課題があることが示されています。結果は外部要因の影響を受けている可能性があります。",
        invalid: "応答時間が速すぎるため、評価の有効性にフラグが立てられました。結果は真の認知能力を反映していない可能性があります。"
      },
      pt: {
        high: "O sujeito demonstra capacidades excepcionais de reconhecimento de padrões e raciocínio abstrato. A velocidade de processamento cognitivo excede o percentil 95.",
        avg: "O sujeito exibe raciocínio lógico sólido e atenção consistente aos detalhes. As métricas cognitivas alinham-se com um perfil equilibrado.",
        low: "O desempenho indica desafios no processamento de lógica abstrata nas condições atuais de teste.",
        invalid: "Validade da avaliação sinalizada devido a tempos de resposta rápidos. Os resultados provavelmente não refletem o verdadeiro potencial cognitivo."
      },
      ru: {
        high: "Субъект демонстрирует исключительные способности к распознаванию образов и абстрактному мышлению. Скорость когнитивной обработки превышает 95-й процентиль.",
        avg: "Субъект демонстрирует твердое логическое мышление и постоянное внимание к деталям. Когнитивные показатели соответствуют сбалансированному профилю.",
        low: "Результаты указывают на трудности в обработке абстрактной логики в текущих условиях тестирования.",
        invalid: "Действительность оценки поставлена под сомнение из-за быстрого времени ответа. Результаты, вероятно, не отражают истинный когнитивный потенциал."
      },
      ar: {
        high: "يُظهر الشخص قدرات استثنائية في التعرف على الأنماط والتفكير التجريدي. تتجاوز سرعة المعالجة المعرفية الشريحة المئوية 95.",
        avg: "يُظهر الشخص تفكيرًا منطقيًا قويًا واهتمامًا ثابتًا بالتفاصيل. تتماشى المقاييس المعرفية مع ملف تعريف متوازن.",
        low: "يشير الأداء إلى تحديات في معالجة المنطق المجرد في ظل ظروف الاختبار الحالية.",
        invalid: "تم الإبلاغ عن صلاحية التقييم بسبب أوقات الاستجابة السريعة. النتائج لا تعكس المحتمل المعرفي الحقيقي."
      },
      hi: {
        high: "विषय असाधारण पैटर्न मान्यता और अमूर्त तर्क क्षमताओं का प्रदर्शन करता है। संज्ञानात्मक प्रसंस्करण गति 95 वें प्रतिशत से अधिक है।",
        avg: "विषय ठोस तार्किक तर्क और विवरण पर निरंतर ध्यान प्रदर्शित करता है। संज्ञानात्मक मेट्रिक्स एक संतुलित प्रोफ़ाइल के साथ संरेखित हैं।",
        low: "प्रदर्शन वर्तमान परीक्षण स्थितियों के तहत अमूर्त तर्क प्रसंस्करण में चुनौतियों का संकेत देता है।",
        invalid: "तेजी से प्रतिक्रिया समय के कारण मूल्यांकन वैधता को चिह्नित किया गया है। परिणाम संभवतः वास्तविक संज्ञानात्मक क्षमता को प्रतिबिंबित नहीं करते हैं।"
      }
    };

    // Use specific language template or fallback to English
    const langTemplates = templates[language] || templates['en'];

    if (validity.includes('Low')) return langTemplates.invalid;
    if (isHigh) return langTemplates.high;
    if (isAvg) return langTemplates.avg;
    return langTemplates.low;
  }
}