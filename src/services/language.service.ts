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
        payButton: 'Unlock Full Report',
        crypto: 'Cryptocurrency',
        card: 'Credit/Debit',
        resultTitle: 'Cognitive Profile',
        downloadPdf: 'Download Certified PDF',
        iqLabel: 'Estimated IQ',
        restart: 'Restart Assessment',
        exit: 'Abort Test'
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
        payButton: '解锁完整报告',
        crypto: '加密货币',
        card: '信用卡',
        resultTitle: '认知档案',
        downloadPdf: '下载认证报告',
        iqLabel: '预估智商',
        restart: '重新开始测试',
        exit: '退出测试'
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
        payButton: 'Desbloquear Reporte',
        crypto: 'Criptomoneda',
        card: 'Tarjeta',
        resultTitle: 'Perfil Cognitivo',
        downloadPdf: 'Descargar PDF',
        iqLabel: 'CI Estimado',
        restart: 'Reiniciar Evaluación',
        exit: 'Salir'
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
        payButton: 'Débloquer le Rapport',
        crypto: 'Crypto',
        card: 'Carte',
        resultTitle: 'Profil Cognitif',
        downloadPdf: 'Télécharger le PDF',
        iqLabel: 'QI Estimé',
        restart: 'Recommencer le Test',
        exit: 'Quitter'
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
        payButton: 'Bericht Freischalten',
        crypto: 'Krypto',
        card: 'Karte',
        resultTitle: 'Kognitives Profil',
        downloadPdf: 'PDF Herunterladen',
        iqLabel: 'Geschätzter IQ',
        restart: 'Test Neustarten',
        exit: 'Abbrechen'
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
        payButton: 'レポートを解除',
        crypto: '暗号通貨',
        card: 'カード',
        resultTitle: '認知プロファイル',
        downloadPdf: 'PDFをダウンロード',
        iqLabel: '推定IQ',
        restart: 'テストを再開',
        exit: '終了'
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
        payButton: 'रिपोर्ट अनलॉक करें',
        crypto: 'क्रिप्टो',
        card: 'कार्ड',
        resultTitle: 'संज्ञानात्मक प्रोफ़ाइल',
        downloadPdf: 'पीडीएफ डाउनलोड करें',
        iqLabel: 'अनुमानित आईक्यू',
        restart: 'पुनः आरंभ करें',
        exit: 'बाहर जाएं'
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
        payButton: 'فتح التقرير',
        crypto: 'عملة مشفرة',
        card: 'بطاقة',
        resultTitle: 'الملف المعرفي',
        downloadPdf: 'تحميل PDF',
        iqLabel: 'معدل الذكاء التقديري',
        restart: 'إعادة الاختبار',
        exit: 'خروج'
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
        payButton: 'Desbloquear Relatório',
        crypto: 'Cripto',
        card: 'Cartão',
        resultTitle: 'Perfil Cognitivo',
        downloadPdf: 'Baixar PDF',
        iqLabel: 'QI Estimado',
        restart: 'Reiniciar Teste',
        exit: 'Sair'
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
        payButton: 'Разблокировать отчет',
        crypto: 'Крипто',
        card: 'Карта',
        resultTitle: 'Когнитивный Профиль',
        downloadPdf: 'Скачать PDF',
        iqLabel: 'Оценка IQ',
        restart: 'Перезапустить',
        exit: 'Выход'
      }
    }
  };

  config = computed(() => this.configs[this.currentLang()] || this.configs['en']);

  constructor() {
    // No longer called here
  }

  initialize(): void {
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

    for (const api of detectionAPIs) {
      try {
        const response = await fetch(api.url, { signal: AbortSignal.timeout(2000) });
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
        console.warn(`IP detection with ${api.name} failed.`, e);
      }
    }
    
    console.warn('All IP detection services failed. Defaulting to English.');
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