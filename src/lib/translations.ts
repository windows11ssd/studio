
export const translations = {
  ar: {
    netGauge: "ksatest",
    measureSpeed: "قم بقياس سرعة اتصالك بالإنترنت.",
    startTest: "ابدأ الاختبار",
    stopTest: "إيقاف الاختبار",
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
    errorTitle: "خطأ",
    downloadErrorUserFriendly: "فشل تنزيل ملف الاختبار '{fileName}'. الحالة: {status}. يرجى التأكد من وجود الملف.",
    downloadErrorNoBody: "فشل تنزيل الملف: لم يتم العثور على محتوى للاستجابة.",
    downloadErrorGeneric: "حدث خطأ أثناء تنزيل ملف الاختبار.",
    downloadFailedEnsureExists: "فشل تنزيل الملف. يرجى التأكد من وجود الملف.",
    uploadErrorGeneric: "حدث خطأ أثناء محاكاة اختبار الرفع.",
    testAbortedTitle: "تم إلغاء الاختبار",
    testAbortedDescription: "تم إيقاف اختبار السرعة.",
    genericError: "حدث خطأ غير متوقع.",
  },
  en: {
    netGauge: "ksatest",
    measureSpeed: "Measure your internet connection speed.",
    startTest: "Start Test",
    stopTest: "Stop Test",
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
    errorTitle: "Error",
    downloadErrorUserFriendly: "Failed to download test file '{fileName}'. Status: {status}. Please ensure the file exists.",
    downloadErrorNoBody: "Failed to download file: Response body is null.",
    downloadErrorGeneric: "An error occurred while downloading the test file.",
    downloadFailedEnsureExists: "Failed to download file. Please ensure the file exists.",
    uploadErrorGeneric: "An error occurred during the simulated upload test.",
    testAbortedTitle: "Test Aborted",
    testAbortedDescription: "The speed test was stopped.",
    genericError: "An unexpected error occurred.",
  },
};

export type Locale = keyof typeof translations;
// Adjusting TranslationKey to ensure all keys from one language (e.g., 'en') are covered.
export type TranslationKey = keyof typeof translations.en;

export const getTranslation = (locale: Locale, key: TranslationKey, params?: Record<string, string | number>): string => {
  let translation = translations[locale]?.[key] || translations.en[key] || key;
  if (params) {
    Object.keys(params).forEach(paramKey => {
      translation = translation.replace(new RegExp(`{${paramKey}}`, 'g'), String(params[paramKey]));
    });
  }
  return translation;
};

