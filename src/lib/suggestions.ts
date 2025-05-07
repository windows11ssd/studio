
'use client';

import type { SpeedTestResult } from '@/services/speed-test';
import type { Locale, TranslationKey } from '@/lib/translations';
import { getTranslation } from '@/lib/translations';

interface SuggestionParameters {
  results: SpeedTestResult;
  locale: Locale;
}

export function generateClientSideSuggestions({ results, locale }: SuggestionParameters): string {
  const t = (key: TranslationKey, params?: Record<string, string | number>) => getTranslation(locale, key, params);
  const advicePoints: string[] = [];

  const { pingMilliseconds, downloadSpeedMbps, uploadSpeedMbps } = results;

  // Ping analysis
  if (pingMilliseconds > 100) {
    advicePoints.push(t('advicePingPoor'));
  } else if (pingMilliseconds > 50) {
    advicePoints.push(t('advicePingFair'));
  }

  // Download speed analysis
  if (downloadSpeedMbps < 10) {
    advicePoints.push(t('adviceDownloadPoor'));
  } else if (downloadSpeedMbps < 25) {
    advicePoints.push(t('adviceDownloadFair'));
  }

  // Upload speed analysis
  if (uploadSpeedMbps < 2) {
    advicePoints.push(t('adviceUploadPoor'));
  } else if (uploadSpeedMbps < 5) {
    advicePoints.push(t('adviceUploadFair'));
  }

  if (advicePoints.length === 0) {
    // Check if all metrics are "good" or "excellent"
    const isPingGood = pingMilliseconds <= 50;
    const isDownloadGood = downloadSpeedMbps >= 25;
    const isUploadGood = uploadSpeedMbps >= 5;

    if (isPingGood && isDownloadGood && isUploadGood) {
      return t('adviceAllGood');
    } else {
      // This case handles "fair" results that aren't "poor" but also not all "good"
      return t('adviceGenerallyOkay');
    }
  }

  return advicePoints.map(point => `- ${point}`).join('\n');
}
