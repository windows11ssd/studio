
export const translations = {
  ar: {
    netGauge: "نت جيدج",
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
    pageTitle: "مقياس الشبكة نت جيدج",
    pageDescription: "قم بقياس سرعة اتصالك بالإنترنت مع نت جيدج.",
  },
  en: {
    netGauge: "NetGauge",
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
    pageTitle: "NetGauge Speed Test",
    pageDescription: "Measure your internet connection speed with NetGauge.",
  },
};

export type Locale = keyof typeof translations;
export type TranslationKey = keyof typeof translations.ar; // Assuming 'ar' has all keys as a reference

export const getTranslation = (locale: Locale, key: TranslationKey): string => {
  return translations[locale]?.[key] || translations.en[key] || key; // Fallback to English, then to the key itself
};
