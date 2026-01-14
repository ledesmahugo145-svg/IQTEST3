import { Injectable, signal, computed } from '@angular/core';
import { LanguageCode, LanguageConfig } from '../types';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  currentLang = signal<LanguageCode>('en');
  detectionStatus = signal<'detecting' | 'detected'>('detecting');

  private configs: Record<LanguageCode, LanguageConfig> = {
    en: {
      code: 'en',
      name: 'English',
      ui: {
        start: 'Start Your IQ Capability Test',
        generating: 'Initializing...',
        generatingTest: 'Generating Unique Assessment...',
        question: 'Sequence',
        next: 'Confirm Selection',
        finish: 'Finalize Protocol',
        calculating: 'Processing Cognitive Metrics...',
        paywallTitle: 'Analysis Secured',
        paywallDesc: 'Your cognitive profile has been encrypted. Access your detailed report and official certification below.',
        paywallFeaturesTitle: 'Your Full Report Includes:',
        paywallFeatures: [
          'Detailed IQ Score Analysis',
          'Cognitive Strengths & Weaknesses',
          'Peer Group Percentile Ranking',
          'Printable Certified PDF Document'
        ],
        paywallNote: 'You will be redirected to our secure payment partner. After payment, please return to this page.',
        payButton: 'Unlock Full Report',
        crypto: 'Cryptocurrency',
        card: 'Credit/Debit',
        resultTitle: 'Cognitive Profile',
        downloadPdf: 'Download Certified PDF',
        iqLabel: 'Estimated IQ',
        restart: 'Restart Assessment',
        exit: 'Abort Test',
        errorTitle: 'Configuration Error',
        errorDesc: 'The AI model could not be initialized. Please ensure the API_KEY is correctly set in your deployment environment variables.',
        errorAction: 'Review Netlify Docs'
      }
    },
    zh: {
      code: 'zh',
      name: '中文',
      ui: {
        start: '开始您的智商能力水平测试',
        generating: '正在初始化...',
        generatingTest: '正在生成独特的评估...',
        question: '序列',
        next: '确认选择',
        finish: '完成评估',
        calculating: '正在演算认知指标...',
        paywallTitle: '分析已加密',
        paywallDesc: '您的认知档案已生成。请解锁以获取详细报告和区块链认证证书。',
        paywallFeaturesTitle: '您的完整报告包括：',
        paywallFeatures: [
          '详细的智商分数分析',
          '认知优势与弱点',
          '同龄组百分位排名',
          '可打印的认证PDF文件'
        ],
        paywallNote: '您将被重定向到我们的安全支付合作伙伴。付款后，请返回此页面。',
        payButton: '解锁完整报告',
        crypto: '加密货币',
        card: '信用卡',
        resultTitle: '认知档案',
        downloadPdf: '下载认证报告',
        iqLabel: '预估智商',
        restart: '重新开始测试',
        exit: '退出测试',
        errorTitle: '配置错误',
        errorDesc: 'AI模型无法初始化。请确保您已在部署环境变量中正确设置 API_KEY。',
        errorAction: '参考Netlify文档'
      }
    },
    es: {
      code: 'es',
      name: 'Español',
      ui: {
        start: 'Inicia Tu Resonancia Cognitiva',
        generating: 'Inicializando...',
        generatingTest: 'Generando Evaluación Única...',
        question: 'Secuencia',
        next: 'Confirmar Selección',
        finish: 'Finalizar Protocolo',
        calculating: 'Procesando Métricas Cognitivas...',
        paywallTitle: 'Análisis Asegurado',
        paywallDesc: 'Su perfil cognitivo ha sido cifrado. Acceda a su informe detallado a continuación.',
        paywallFeaturesTitle: 'Su informe completo incluye:',
        paywallFeatures: [
          'Análisis detallado de la puntuación de CI',
          'Fortalezas y debilidades cognitivas',
          'Clasificación percentil del grupo de pares',
          'Documento PDF certificado imprimible'
        ],
        paywallNote: 'Será redirigido a nuestro socio de pago seguro. Después del pago, regrese a esta página.',
        payButton: 'Desbloquear Reporte',
        crypto: 'Criptomoneda',
        card: 'Tarjeta',
        resultTitle: 'Perfil Cognitivo',
        downloadPdf: 'Descargar PDF',
        iqLabel: 'CI Estimado',
        restart: 'Reiniciar Evaluación',
        exit: 'Salir',
        errorTitle: 'Error de Configuración',
        errorDesc: 'El modelo de IA no pudo inicializarse. Asegúrese de que la API_KEY esté configurada correctamente en sus variables de entorno de implementación.',
        errorAction: 'Ver Docs de Netlify'
      }
    },
    fr: {
      code: 'fr',
      name: 'Français',
      ui: {
        start: 'Commencez Votre Résonance Cognitive',
        generating: 'Initialisation...',
        generatingTest: 'Génération de l\'évaluation unique...',
        question: 'Séquence',
        next: 'Confirmer',
        finish: 'Finaliser',
        calculating: 'Traitement des Données...',
        paywallTitle: 'Analyse Sécurisée',
        paywallDesc: 'Votre profil cognitif est prêt. Débloquez votre rapport détaillé.',
        paywallFeaturesTitle: 'Votre rapport complet inclut :',
        paywallFeatures: [
          'Analyse détaillée du score de QI',
          'Forces et faiblesses cognitives',
          'Classement centile du groupe de pairs',
          'Document PDF certifié imprimable'
        ],
        paywallNote: 'Vous serez redirigé vers notre partenaire de paiement sécurisé. Après le paiement, veuillez retourner à cette page.',
        payButton: 'Débloquer le Rapport',
        crypto: 'Crypto',
        card: 'Carte',
        resultTitle: 'Profil Cognitif',
        downloadPdf: 'Télécharger le PDF',
        iqLabel: 'QI Estimé',
        restart: 'Recommencer le Test',
        exit: 'Quitter',
        errorTitle: 'Erreur de Configuration',
        errorDesc: 'Le modèle d\'IA n\'a pas pu être initialisé. Veuillez vous assurer que l\'API_KEY est correctement définie dans vos variables d\'environnement de déploiement.',
        errorAction: 'Consulter la doc Netlify'
      }
    },
    de: {
      code: 'de',
      name: 'Deutsch',
      ui: {
        start: 'Starten Sie Ihre Kognitive Resonanz',
        generating: 'Initialisierung...',
        generatingTest: 'Einzigartige Bewertung wird erstellt...',
        question: 'Sequenz',
        next: 'Bestätigen',
        finish: 'Abschließen',
        calculating: 'Verarbeite Kognitive Daten...',
        paywallTitle: 'Analyse Gesichert',
        paywallDesc: 'Ihr kognitives Profil wurde verschlüsselt. Bericht freischalten.',
        paywallFeaturesTitle: 'Ihr vollständiger Bericht enthält:',
        paywallFeatures: [
          'Detaillierte IQ-Score-Analyse',
          'Kognitive Stärken & Schwächen',
          'Perzentil-Rang der Vergleichsgruppe',
          'Druckbares zertifiziertes PDF-Dokument'
        ],
        paywallNote: 'Sie werden zu unserem sicheren Zahlungspartner weitergeleitet. Nach der Zahlung kehren Sie bitte auf diese Seite zurück.',
        payButton: 'Bericht Freischalten',
        crypto: 'Krypto',
        card: 'Karte',
        resultTitle: 'Kognitives Profil',
        downloadPdf: 'PDF Herunterladen',
        iqLabel: 'Geschätzter IQ',
        restart: 'Test Neustarten',
        exit: 'Abbrechen',
        errorTitle: 'Konfigurationsfehler',
        errorDesc: 'Das KI-Modell konnte nicht initialisiert werden. Bitte stellen Sie sicher, dass der API_KEY in Ihren Bereitstellungsumgebungsvariablen korrekt eingestellt ist.',
        errorAction: 'Netlify-Doks ansehen'
      }
    },
    ja: {
      code: 'ja',
      name: '日本語',
      ui: {
        start: '認知的共鳴を開始する',
        generating: '初期化中...',
        generatingTest: '独自の評価を生成中...',
        question: 'シーケンス',
        next: '選択を確定',
        finish: 'プロトコル完了',
        calculating: '認知メトリクスを処理中...',
        paywallTitle: '分析完了',
        paywallDesc: '認知プロファイルが暗号化されました。レポートのロックを解除してください。',
        paywallFeaturesTitle: '完全なレポートには以下が含まれます：',
        paywallFeatures: [
          '詳細なIQスコア分析',
          '認知的な強みと弱み',
          'ピアグループのパーセンタイルランキング',
          '印刷可能な認定PDFドキュメント'
        ],
        paywallNote: '安全な支払いパートナーにリダイレクトされます。支払い後、このページに戻ってください。',
        payButton: 'レポートを解除',
        crypto: '暗号通貨',
        card: 'カード',
        resultTitle: '認知プロファイル',
        downloadPdf: 'PDFをダウンロード',
        iqLabel: '推定IQ',
        restart: 'テストを再開',
        exit: '終了',
        errorTitle: '設定エラー',
        errorDesc: 'AIモデルを初期化できませんでした。デプロイ環境変数でAPI_KEYが正しく設定されていることを確認してください。',
        errorAction: 'Netlifyドキュメント'
      }
    },
    hi: {
      code: 'hi',
      name: 'हिन्दी',
      ui: {
        start: 'अपनी संज्ञानात्मक अनुनाद शुरू करें',
        generating: 'प्रारंभ किया जा रहा है...',
        generatingTest: 'अद्वितीय मूल्यांकन उत्पन्न हो रहा है...',
        question: 'क्रम',
        next: 'पुष्टि करें',
        finish: 'समाप्त करें',
        calculating: 'डेटा संसाधित हो रहा है...',
        paywallTitle: 'विश्लेषण सुरक्षित',
        paywallDesc: 'आपकी संज्ञानात्मक प्रोफ़ाइल एन्क्रिप्ट की गई है। रिपोर्ट अनलॉक करें।',
        paywallFeaturesTitle: 'आपकी पूरी रिपोर्ट में शामिल हैं:',
        paywallFeatures: [
          'विस्तृत आईक्यू स्कोर विश्लेषण',
          'संज्ञानात्मक ताकत और कमजोरियां',
          'सहकर्मी समूह प्रतिशत रैंक',
          'प्रिंट करने योग्य प्रमाणित पीडीएफ दस्तावेज़'
        ],
        paywallNote: 'आपको हमारे सुरक्षित भुगतान भागीदार के पास भेज दिया जाएगा। भुगतान के बाद, कृपया इस पृष्ठ पर वापस आएं।',
        payButton: 'रिपोर्ट अनलॉक करें',
        crypto: 'क्रिप्टो',
        card: 'कार्ड',
        resultTitle: 'संज्ञानात्मक प्रोफ़ाइल',
        downloadPdf: 'पीडीएफ डाउनलोड करें',
        iqLabel: 'अनुमानित आईक्यू',
        restart: 'पुनः आरंभ करें',
        exit: 'बाहर जाएं',
        errorTitle: 'कॉन्फ़िगरेशन त्रुटि',
        errorDesc: 'एआई मॉडल को प्रारंभ नहीं किया जा सका। कृपया सुनिश्चित करें कि आपके परिनियोजन परिवेश चर में API_KEY सही ढंग से सेट है।',
        errorAction: 'नेटलिफाई दस्तावेज़ देखें'
      }
    },
    ar: {
      code: 'ar',
      name: 'العربية',
      ui: {
        start: 'ابدأ رنينك المعرفي',
        generating: 'جاري البدء...',
        generatingTest: 'جاري إنشاء تقييم فريد...',
        question: 'تسلسل',
        next: 'تأكيد',
        finish: 'إنهاء',
        calculating: 'معالجة البيانات...',
        paywallTitle: 'التحليل مؤمن',
        paywallDesc: 'تم تشفير ملفك المعرفي. افتح التقرير أدناه.',
        paywallFeaturesTitle: 'تقريرك الكامل يتضمن:',
        paywallFeatures: [
          'تحليل مفصل لدرجة الذكاء',
          'نقاط القوة والضعف المعرفية',
          'ترتيب النسبة المئوية لمجموعة الأقران',
          'مستند PDF معتمد قابل للطباعة'
        ],
        paywallNote: 'سيتم توجيهك إلى شريك الدفع الآمن لدينا. بعد الدفع، يرجى العودة إلى هذه الصفحة.',
        payButton: 'فتح التقرير',
        crypto: 'عملة مشفرة',
        card: 'بطاقة',
        resultTitle: 'الملف المعرفي',
        downloadPdf: 'تحميل PDF',
        iqLabel: 'معدل الذكاء التقديري',
        restart: 'إعادة الاختبار',
        exit: 'خروج',
        errorTitle: 'خطأ في التكوين',
        errorDesc: 'تعذر تهيئة نموذج الذكاء الاصطناعي. يرجى التأكد من تعيين API_KEY بشكل صحيح في متغيرات بيئة النشر الخاصة بك.',
        errorAction: 'مراجعة مستندات Netlify'
      }
    },
    pt: {
      code: 'pt',
      name: 'Português',
      ui: {
        start: 'Inicie Sua Ressonância Cognitiva',
        generating: 'Inicializando...',
        generatingTest: 'Gerando Avaliação Única...',
        question: 'Sequência',
        next: 'Confirmar',
        finish: 'Finalizar',
        calculating: 'Processando Dados...',
        paywallTitle: 'Análise Protegida',
        paywallDesc: 'Seu perfil cognitivo foi criptografado. Desbloqueie o relatório completo.',
        paywallFeaturesTitle: 'Seu Relatório Completo Inclui:',
        paywallFeatures: [
          'Análise detalhada da pontuação de QI',
          'Forças e fraquezas cognitivas',
          'Classificação percentual do grupo de pares',
          'Documento PDF certificado para impressão'
        ],
        paywallNote: 'Você será redirecionado para nosso parceiro de pagamento seguro. Após o pagamento, retorne a esta página.',
        payButton: 'Desbloquear Relatório',
        crypto: 'Cripto',
        card: 'Cartão',
        resultTitle: 'Perfil Cognitivo',
        downloadPdf: 'Baixar PDF',
        iqLabel: 'QI Estimado',
        restart: 'Reiniciar Teste',
        exit: 'Sair',
        errorTitle: 'Erro de Configuração',
        errorDesc: 'O modelo de IA não pôde ser inicializado. Certifique-se de que a API_KEY está definida corretamente em suas variáveis de ambiente de implantação.',
        errorAction: 'Ver Docs da Netlify'
      }
    },
    ru: {
      code: 'ru',
      name: 'Русский',
      ui: {
        start: 'Начать Когнитивный Резонанс',
        generating: 'Инициализация...',
        generatingTest: 'Создание уникальной оценки...',
        question: 'Последовательность',
        next: 'Подтвердить',
        finish: 'Завершить',
        calculating: 'Обработка данных...',
        paywallTitle: 'Анализ Защищен',
        paywallDesc: 'Ваш когнитивный профиль зашифрован. Разблокируйте отчет.',
        paywallFeaturesTitle: 'Ваш полный отчет включает:',
        paywallFeatures: [
          'Подробный анализ показателя IQ',
          'Когнитивные сильные и слабые стороны',
          'Процентильный ранг в группе сверстников',
          'Сертифицированный PDF-документ для печати'
        ],
        paywallNote: 'Вы будете перенаправлены на страницу нашего безопасного платежного партнера. После оплаты, пожалуйста, вернитесь на эту страницу.',
        payButton: 'Разблокировать отчет',
        crypto: 'Крипто',
        card: 'Карта',
        resultTitle: 'Когнитивный Профиль',
        downloadPdf: 'Скачать PDF',
        iqLabel: 'Оценка IQ',
        restart: 'Перезапустить',
        exit: 'Выход',
        errorTitle: 'Ошибка конфигурации',
        errorDesc: 'Не удалось инициализировать модель ИИ. Убедитесь, что API_KEY правильно установлен в переменных окружения вашего развертывания.',
        errorAction: 'См. документацию Netlify'
      }
    }
  };

  config = computed(() => this.configs[this.currentLang()] || this.configs['en']);

  constructor() {
    // No longer called here
  }

  initialize(): void {
    // Fire and forget, don't await blocking the UI
    this.detectUserCountry();
  }

  setLanguage(code: LanguageCode) {
    this.currentLang.set(code);
  }

  get availableLanguages() {
    return Object.values(this.configs).map(c => ({ code: c.code, name: c.name }));
  }

  private async detectUserCountry() {
    this.detectionStatus.set('detecting');
    const detectionAPIs = [
      { name: 'GeoJS', url: 'https://get.geojs.io/v1/ip/country.json', key: 'country' },
      { name: 'Country.is', url: 'https://api.country.is', key: 'country' },
      { name: 'ipapi.co', url: 'https://ipapi.co/json/', key: 'country_code' },
    ];

    // Try APIs sequentially with short timeout
    for (const api of detectionAPIs) {
      try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 1500); // 1.5s max per API

        const response = await fetch(api.url, { signal: controller.signal });
        clearTimeout(id);

        if (response.ok) {
          const data = await response.json();
          const countryCode = data[api.key];
          if (countryCode && typeof countryCode === 'string') {
            console.log(`Successfully detected country '${countryCode}' using ${api.name}.`);
            this.mapCountryToLanguage(countryCode);
            this.detectionStatus.set('detected');
            return; 
          }
        }
      } catch (e) {
        // Silently fail to next API
      }
    }
    
    // Fallback if all fail
    console.warn('All IP detection services failed or timed out. Defaulting to English.');
    this.detectionStatus.set('detected');
  }

  private mapCountryToLanguage(countryCode: string) {
    const code = countryCode.toUpperCase();
    let detectedLang: LanguageCode = 'en';

    // Priority Exact Matches
    if (['CN', 'HK', 'TW', 'SG', 'MO'].includes(code)) detectedLang = 'zh';
    else if (['ES', 'MX', 'AR', 'CO', 'PE', 'VE', 'CL', 'EC', 'GT', 'CU', 'BO', 'DO', 'HN', 'PY', 'SV', 'NI', 'CR', 'PA', 'UY', 'GQ'].includes(code)) detectedLang = 'es';
    else if (['FR', 'BE', 'MC', 'CH', 'SN', 'ML', 'CD', 'CI', 'CM'].includes(code)) detectedLang = 'fr';
    else if (['DE', 'AT', 'LI', 'LU'].includes(code)) detectedLang = 'de';
    else if (code === 'JP') detectedLang = 'ja';
    else if (code === 'IN') detectedLang = 'hi';
    else if (['SA', 'AE', 'EG', 'IQ', 'MA', 'DZ', 'SD', 'YE', 'OM', 'SY', 'TN', 'JO', 'KW', 'QA', 'BH', 'LB', 'LY'].includes(code)) detectedLang = 'ar';
    else if (['PT', 'BR', 'AO', 'MZ', 'CV', 'GW'].includes(code)) detectedLang = 'pt';
    else if (['RU', 'UA', 'KZ', 'BY', 'KG', 'UZ'].includes(code)) detectedLang = 'ru';

    console.log(`Mapping country '${code}' to language '${detectedLang}'.`);
    this.currentLang.set(detectedLang);
  }
}