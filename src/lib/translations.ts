
export const translations = {
  ar: {
    netGauge: "ksatest",
    measureSpeed: "قم بقياس سرعة اتصالك بالإنترنت.",
    startTest: "ابدأ الاختبار",
    testingInProgress: "جاري الاختبار...",
    testAgain: "اختبار مرة أخرى",
    ping: "البينج",
    download: "تنزيل",
    upload: "رفع",
    speed: "سرعة",
    ms: "مللي ثانية",
    mbps: "ميجابت/ثانية",
    cellTowerInfoSimulated: "معلومات البرج (محاكاة)",
    cellId: "معرف الخلية",
    lac: "LAC",
    mcc: "MCC",
    mnc: "MNC",
    towerInfoTooltip: "تفاصيل برج الخلية في الوقت الفعلي (معرف الخلية، LAC) غير متوفرة بشكل عام في متصفحات الويب. البيانات المعروضة هي محاكاة أو تستند إلى أمثلة.",
    testingPing: "جاري اختبار البينج...",
    toggleToEnglish: "Switch to English",
    toggleToArabic: "التبديل إلى العربية",
    pageTitle: "اختبار سرعة ksatest",
    pageDescription: "قم بقياس سرعة اتصالك بالإنترنت مع ksatest.",
    fileSizeButtonsLabel: "أو اختبر بأحجام ملفات محددة:",
    test10MB: "10 ميجابايت",
    test100MB: "100 ميجابايت",
    test500MB: "500 ميجابايت",
    test1GB: "1 جيجابايت",
  },
  en: {
    netGauge: "ksatest",
    measureSpeed: "Measure your internet connection speed.",
    startTest: "Start Test",
    testingInProgress: "Testing...",
    testAgain: "Test Again",
    ping: "Ping",
    download: "Download",
    upload: "Upload",
    speed: "Speed",
    ms: "ms",
    mbps: "Mbps",
    cellTowerInfoSimulated: "Cell Tower Info (Simulated)",
    cellId: "Cell ID",
    lac: "LAC",
    mcc: "MCC",
    mnc: "MNC",
    towerInfoTooltip: "Real-time cell tower details (Cell ID, LAC) are generally not available in web browsers. The data shown is simulated or example-based.",
    testingPing: "Testing Ping...",
    toggleToEnglish: "Switch to English",
    toggleToArabic: "التبديل إلى العربية",
    pageTitle: "ksatest Speed Test",
    pageDescription: "Measure your internet connection speed with ksatest.",
    fileSizeButtonsLabel: "Or test with specific file sizes:",
    test10MB: "10 MB",
    test100MB: "100 MB",
    test500MB: "500 MB",
    test1GB: "1 GB",
  },
};

export type Locale = keyof typeof translations;
export type TranslationKey = keyof typeof translations.ar; // Assuming 'ar' has all keys as a reference

export const getTranslation = (locale: Locale, key: TranslationKey): string => {
  return translations[locale]?.[key] || translations.en[key] || key; // Fallback to English, then to the key itself
};

