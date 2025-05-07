'use client';

import * as React from 'react';
import { ArrowDownToLine, ArrowUpFromLine, Gauge, Play, RotateCw, Wifi, Languages, StopCircle, Server, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ResultDisplay } from '@/components/result-display';
import { CellTowerDisplay } from '@/components/cell-tower-display';
import { SpeedGauge } from '@/components/speed-gauge';
import type { SpeedTestResult } from '@/services/speed-test';
import { getCellTowerInfo, type CellTowerInfo } from '@/services/cell-tower';
import { useLanguage } from '@/contexts/language-context';
import { getTranslation, type TranslationKey } from '@/lib/translations';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { AISuggestionDisplay } from '@/components/ai-suggestion-display';
import { generateClientSideSuggestions } from '@/lib/suggestions';
import { TestServerInfoDisplay } from '@/components/test-server-info-display';

// Specific type for the BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

type TestStage = 'idle' | 'ping' | 'download' | 'upload' | 'finished';

// Using Cloudflare's speed test files.
const fileMap: Record<number, { path: string, sizeBytes: number }> = {
    10: { path: 'https://speed.cloudflare.com/__down?bytes=10000000', sizeBytes: 10 * 1000 * 1000 },
    100: { path: 'https://speed.cloudflare.com/__down?bytes=100000000', sizeBytes: 100 * 1000 * 1000 },
    500: { path: 'https://speed.cloudflare.com/__down?bytes=500000000', sizeBytes: 500 * 1000 * 1000 },
    1000: { path: 'https://speed.cloudflare.com/__down?bytes=1000000000', sizeBytes: 1000 * 1000 * 1000 },
};
const defaultFileSizeKey = 10;


export default function Home() {
  const { locale, toggleLanguage } = useLanguage();
  const t = (key: TranslationKey, params?: Record<string, string | number>) => getTranslation(locale, key, params);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [results, setResults] = React.useState<SpeedTestResult | null>(null);
  const [cellInfo, setCellInfo] = React.useState<CellTowerInfo | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isFetchingCellInfo, setIsFetchingCellInfo] = React.useState<boolean>(true);
  const [currentStage, setCurrentStage] = React.useState<TestStage>('idle');
  const [currentSpeed, setCurrentSpeed] = React.useState<number>(0);
  const [activeTestFileSize, setActiveTestFileSize] = React.useState<number | null>(null);
  const abortControllerRef = React.useRef<AbortController | null>(null);
  const uploadAnimationRef = React.useRef<number | null>(null);

  const [suggestionText, setSuggestionText] = React.useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = React.useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = React.useState<boolean>(false);


  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = t('pageTitle');
    }
  }, [locale, t]);

  React.useEffect(() => {
    const fetchCellInfo = async () => {
      setIsFetchingCellInfo(true);
      try {
        const info = await getCellTowerInfo();
        setCellInfo(info);
      } catch (error) {
        console.error('Error fetching cell info:', error);
        // Optionally set an error state for cell info display
      } finally {
        setIsFetchingCellInfo(false);
      }
    };
    fetchCellInfo();
  }, []);

  // Effect for PWA installation prompt
  React.useEffect(() => {
    const beforeInstallPromptHandler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallButton(true);
      console.log('`beforeinstallprompt` event was fired.');
    };

    const appInstalledHandler = () => {
      setShowInstallButton(false);
      setDeferredPrompt(null);
      console.log('PWA was installed');
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeinstallprompt', beforeInstallPromptHandler);
      window.addEventListener('appinstalled', appInstalledHandler);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeinstallprompt', beforeInstallPromptHandler);
        window.removeEventListener('appinstalled', appInstalledHandler);
      }
    };
  }, [setDeferredPrompt, setShowInstallButton]);

  // Effect for general component unmount cleanup (test-related)
  React.useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (uploadAnimationRef.current) {
        cancelAnimationFrame(uploadAnimationRef.current);
        uploadAnimationRef.current = null;
      }
    };
  }, []);


  React.useEffect(() => {
    if (currentStage === 'finished' && results) {
      setSuggestionText(null); 
      try {
        const advice = generateClientSideSuggestions({ results, locale });
        setSuggestionText(advice);
      } catch (error: any) {
        console.error("Error generating client-side suggestions:", error);
        setSuggestionText(t('suggestionGenerationError'));
      }
    }
  }, [currentStage, results, locale, t]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }
    setShowInstallButton(false); // Hide button immediately
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      if (outcome === 'accepted') {
        console.log('User accepted the A2HS prompt');
      } else {
        console.log('User dismissed the A2HS prompt');
      }
    } catch (error) {
        console.error('Error showing install prompt:', error);
        // If prompt failed, user might still be able to install later if event fires again
        // or via browser menu. Re-showing button might be an option depending on desired UX.
    } finally {
        setDeferredPrompt(null); // We've used the prompt (or it failed), discard it.
    }
  };


  const handleStopTest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null; // Clear after abort
    }
    if (uploadAnimationRef.current) {
      cancelAnimationFrame(uploadAnimationRef.current);
      uploadAnimationRef.current = null;
    }
    setIsLoading(false);
    setCurrentStage('idle');
    setCurrentSpeed(0);
    setActiveTestFileSize(null);
    setSuggestionText(null); // Clear suggestions on stop
    toast({ title: t('testAbortedTitle'), description: t('testAbortedDescription') });
  };

  const handleStartTest = async (fileSizeKeyParam?: number) => {
    if (isLoading) return; 

    setIsLoading(true);
    setResults(null);
    setCurrentSpeed(0);
    setCurrentStage('idle');
    setSuggestionText(null); // Clear previous suggestions
    
    const selectedFileSizeKey = fileSizeKeyParam || defaultFileSizeKey;
    setActiveTestFileSize(selectedFileSizeKey);
    console.log(`Starting test with file size key: ${selectedFileSizeKey}`);

    if (abortControllerRef.current) { 
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    if (uploadAnimationRef.current) {
      cancelAnimationFrame(uploadAnimationRef.current);
      uploadAnimationRef.current = null;
    }
    
    let finalDownloadSpeed = 0;
    let finalUploadSpeed = 0;
    let pingResult = 0;

    try {
      // Ping simulation
      setCurrentStage('ping');
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate ping duration
      if (signal.aborted) throw new Error('Test aborted during ping');
      pingResult = 20 + Math.random() * 30; // Simulate ping result

      // Download Test
      setCurrentStage('download');
      setCurrentSpeed(0);
      
      const fileDetails = fileMap[selectedFileSizeKey] || fileMap[defaultFileSizeKey];
      const fileUrl = fileDetails.path;
      const actualFileSizeInBytes = fileDetails.sizeBytes;
      
      const sizeConfig = fileTestSizes.find(fts => fts.size === selectedFileSizeKey);
      const userFriendlyFileNameForError = sizeConfig ? t(sizeConfig.labelKey) : `${selectedFileSizeKey}MB Test File`;
      
      const downloadStartTime = Date.now();
      let downloadedBytes = 0;
      let lastSpeedUpdateTime = downloadStartTime;

      try {
        const response = await fetch(fileUrl, { signal, cache: 'no-store' });
        if (!response.ok) {
          const statusText = `${response.status} ${response.statusText || ''}`.trim();
          throw new Error(t('downloadErrorUserFriendly', { fileName: userFriendlyFileNameForError, status: statusText }));
        }
        if (!response.body) {
          throw new Error(t('downloadErrorNoBody'));
        }
        const reader = response.body.getReader();

        while (true) {
          if (signal.aborted) {
            // Reader might not be cancellable if already closed or errored.
            // Enclose in try-catch to prevent errors here from masking the abort.
            try { await reader.cancel(); } catch (cancelError) { console.warn("Error cancelling reader:", cancelError); }
            reader.releaseLock();
            throw new Error('Download aborted by user');
          }
          const { done, value } = await reader.read();
          if (done) break;

          downloadedBytes += value.length;
          const now = Date.now();
          const elapsedTimeMs = now - downloadStartTime;
          
          if (elapsedTimeMs > 0) {
            const currentAvgSpeed = (downloadedBytes * 8) / (elapsedTimeMs / 1000) / 1000000; // Mbps
            if (now - lastSpeedUpdateTime > 100) { 
                setCurrentSpeed(currentAvgSpeed);
                lastSpeedUpdateTime = now;
            }
          }
        }
        reader.releaseLock(); 
        const downloadEndTimeOnComplete = Date.now();
        const finalElapsedTimeMs = downloadEndTimeOnComplete - downloadStartTime;
        setCurrentSpeed(finalElapsedTimeMs > 0 ? (downloadedBytes * 8) / (finalElapsedTimeMs / 1000) / 1000000 : 0);

      } catch (fetchError: any) {
        if (signal.aborted || fetchError.name === 'AbortError' || fetchError.message.includes('aborted')) {
          console.log('Download aborted.');
          throw fetchError; 
        }
        console.error('Download fetch error:', fetchError);
        toast({
            title: t('errorTitle'),
            description: fetchError.message || t('downloadErrorGeneric'),
            variant: 'destructive',
        });
        finalDownloadSpeed = 0; 
        if (!(fetchError.name === 'AbortError' || fetchError.message.includes('aborted'))) {
             setResults({ downloadSpeedMbps: 0, uploadSpeedMbps: 0, pingMilliseconds: pingResult });
             setCurrentStage('finished'); 
        }
        throw fetchError; 
      }

      const downloadEndTime = Date.now();
      const downloadDurationSeconds = (downloadEndTime - downloadStartTime) / 1000;
      finalDownloadSpeed = downloadDurationSeconds > 0 ? parseFloat(((actualFileSizeInBytes * 8) / (downloadDurationSeconds * 1000000)).toFixed(1)) : 0;

      if (signal.aborted) throw new Error('Test aborted after download');

      // Upload Test (Simulated)
      setCurrentStage('upload');
      setCurrentSpeed(0);
      const uploadBaseSpeed = 20 + Math.random() * 30; 
      const uploadSimDuration = 1500 + selectedFileSizeKey * (isMobile ? 0.15 : 0.08) * (actualFileSizeInBytes / (1000*1000) / 100) ; 
      
      const simulateUploadProgress = (targetSpeed: number, duration: number) => {
        let simStartTime: number | null = null;
        
        function step(timestamp: number) {
          if (signal.aborted) {
            setCurrentSpeed(0); 
            uploadAnimationRef.current = null;
            return;
          }
          if (!simStartTime) simStartTime = timestamp;
          const elapsed = timestamp - simStartTime;
          const progressRatio = Math.min(elapsed / duration, 1);
          const speedFluctuation = (Math.sin((progressRatio * Math.PI) - (Math.PI / 2)) + 1) / 2; 
          const simulatedSpeed = targetSpeed * speedFluctuation * (0.8 + Math.random() * 0.4); 
          setCurrentSpeed(simulatedSpeed);

          if (progressRatio < 1) {
            uploadAnimationRef.current = requestAnimationFrame(step);
          } else {
            setCurrentSpeed(targetSpeed); 
            uploadAnimationRef.current = null;
          }
        }
        uploadAnimationRef.current = requestAnimationFrame(step);
      };

      simulateUploadProgress(uploadBaseSpeed, uploadSimDuration);
      await new Promise(resolve => setTimeout(resolve, uploadSimDuration + 200)); 
      if (signal.aborted) throw new Error('Test aborted during upload');
      finalUploadSpeed = parseFloat((uploadBaseSpeed * (0.9 + Math.random() * 0.2)).toFixed(1)); 
      
      const finalResultsData: SpeedTestResult = {
        downloadSpeedMbps: finalDownloadSpeed,
        uploadSpeedMbps: finalUploadSpeed,
        pingMilliseconds: parseFloat(pingResult.toFixed(0)),
      };
      setResults(finalResultsData);
      setCurrentStage('finished');

    } catch (error: any) {
      if (error.name === 'AbortError' || error.message.includes('aborted') || (signal && signal.aborted)) {
        console.log('Speed test was aborted.');
        // handleStopTest now shows the toast, so this check might be redundant
        // or could be removed if handleStopTest is always called.
        // if (!isLoading) { // Original logic
        //      toast({ title: t('testAbortedTitle'), description: t('testAbortedDescription') });
        // }
      } else {
        console.error('Error running speed test:', error);
        toast({ title: t('errorTitle'), description: error.message || t('genericError'), variant: 'destructive' });
      }
      
      if (currentStage !== 'finished') {
        setCurrentStage('idle'); // Reset to idle if not already finished (e.g. error during download)
      }
    } finally {
      setCurrentSpeed(0); 
      setIsLoading(false); 
      if (currentStage !== 'finished') { 
        setActiveTestFileSize(null);
      }
      // abortControllerRef is cleared in handleStopTest or when new test starts
      // uploadAnimationRef is cleared in handleStopTest or when simulation ends/aborts
    }
  };
  
  const fileTestSizes = [
    { labelKey: 'test10MB', size: 10 },
    { labelKey: 'test100MB', size: 100 },
    { labelKey: 'test500MB', size: 500 },
    { labelKey: 'test1GB', size: 1000 },
  ] as const;

  const getGaugeLabel = () => {
    switch (currentStage) {
      case 'ping':
        return t('testingPing');
      case 'download':
        if (activeTestFileSize) {
          const sizeConfig = fileTestSizes.find(fts => fts.size === activeTestFileSize);
          const friendlyName = sizeConfig ? t(sizeConfig.labelKey) : `${activeTestFileSize}MB`;
          return t('downloadingFileSize', { size: friendlyName });
        }
        return t('download'); 
      case 'upload':
        if (activeTestFileSize) {
          const sizeConfig = fileTestSizes.find(fts => fts.size === activeTestFileSize);
          const friendlyName = sizeConfig ? t(sizeConfig.labelKey) : `${activeTestFileSize}MB`;
          return t('uploadingFileSize', { size: friendlyName });
        }
        return t('upload'); 
      default:
         if (results && activeTestFileSize) { 
            const sizeConfig = fileTestSizes.find(fts => fts.size === activeTestFileSize);
            const friendlyName = sizeConfig ? t(sizeConfig.labelKey) : `${activeTestFileSize}MB`;
            return t('speedTestFor', {size: friendlyName});
         }
        return t('speed'); 
    }
  };

  const getButtonContent = () => {
    if (isLoading) {
      return (
        <>
          <StopCircle className={`h-4 w-4 ${locale === 'ar' ? 'ml-2' : 'mr-2'}`} />
          {t('stopTest')}
        </>
      );
    }
    if (currentStage === 'finished' || results) {
        return (
            <>
             <RotateCw className={`h-4 w-4 ${locale === 'ar' ? 'ml-2' : 'mr-2'}`} />
             {t('testAgain')}
            </>
        );
    }
    return (
      <>
        <Play className={`h-4 w-4 ${locale === 'ar' ? 'ml-2' : 'mr-2'}`} />
        {t('startTest')}
      </>
    );
  };


  return (
    <div className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <header className="mb-8 text-center relative w-full">
        <div className="flex items-center justify-center">
            <h1 className="text-4xl font-bold text-primary flex items-center justify-center gap-2">
            <Wifi className="h-8 w-8 text-accent" /> {t('netGauge')}
            </h1>
        </div>
        <Button
            size="icon"
            onClick={toggleLanguage}
            className={`absolute top-1 ${locale === 'ar' ? 'left-1 md:left-2' : 'right-1 md:right-2'} bg-green-500 hover:bg-green-600 text-white shadow-md rounded-full p-2 transition-all duration-200 ease-in-out transform hover:scale-110 focus:ring-2 focus:ring-green-400 focus:ring-offset-2`}
            aria-label={locale === 'ar' ? t('toggleToEnglish') : t('toggleToArabic')}
            title={locale === 'ar' ? t('toggleToEnglish') : t('toggleToArabic')}
          >
            <Languages className="h-5 w-5" />
        </Button>
        {showInstallButton && (
          <Button
            onClick={handleInstallClick}
            className={`absolute top-1 ${locale === 'ar' ? 'right-1 md:right-2' : 'left-1 md:left-2'} bg-primary hover:bg-primary/90 text-primary-foreground shadow-md rounded-lg px-3 py-2 flex items-center gap-1 text-sm font-medium transition-all duration-200 ease-in-out transform hover:scale-105 focus:ring-2 focus:ring-ring focus:ring-offset-2`}
            aria-label={t('installApp')}
            title={t('installApp')}
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">{t('installApp')}</span>
          </Button>
        )}
        <p className={`text-muted-foreground ${showInstallButton ? 'mt-12 md:mt-14' : 'mt-4'}`}>{t('measureSpeed')}</p>
      </header>

      <main className="flex w-full max-w-2xl flex-col items-center space-y-8">
         <div className="w-full p-6 rounded-lg shadow-md bg-card">
           <SpeedGauge
              currentSpeed={currentSpeed}
              label={getGaugeLabel()}
              maxSpeed={isMobile ? 200 : 1000} 
              className="mb-6"
              unit={t('mbps')}
            />
         </div>
        <Button
          size="lg"
          onClick={isLoading ? handleStopTest : () => { setActiveTestFileSize(null); handleStartTest(); }} 
          className="w-48 bg-accent text-accent-foreground hover:bg-accent/90 rounded-full shadow-lg transition-transform duration-200 active:scale-95"
        >
          {getButtonContent()}
        </Button>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          <ResultDisplay
            icon={Gauge}
            label={t('ping')}
            value={results?.pingMilliseconds?.toFixed(0) ?? null}
            unit={t('ms')}
            isLoading={isLoading && currentStage === 'ping'}
          />
          <ResultDisplay
            icon={ArrowDownToLine}
            label={t('download')}
            value={results?.downloadSpeedMbps?.toFixed(1) ?? null}
            unit={t('mbps')}
            isLoading={isLoading && currentStage === 'download'}
          />
          <ResultDisplay
            icon={ArrowUpFromLine}
            label={t('upload')}
            value={results?.uploadSpeedMbps?.toFixed(1) ?? null}
            unit={t('mbps')}
            isLoading={isLoading && currentStage === 'upload'}
          />
        </div>
        
        <div className="mt-4 w-full max-w-2xl flex flex-col items-center space-y-3">
          <p className="text-sm text-muted-foreground">{t('fileSizeButtonsLabel')}</p>
          <div className="flex flex-wrap justify-center gap-2">
            {fileTestSizes.map((item) => (
              <Button
                key={item.size}
                size="sm"
                onClick={() => handleStartTest(item.size)}
                disabled={isLoading}
                className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm"
              >
                {t(item.labelKey)}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="w-full max-w-2xl">
            <TestServerInfoDisplay
                downloadServer={t('cloudflareNetworkName')}
                uploadServer={t('simulatedServerName')}
                locale={locale}
                className="w-full"
            />
        </div>

        <div className="w-full max-w-2xl">
          <CellTowerDisplay
            cellInfo={cellInfo}
            isLoading={isFetchingCellInfo}
            className="w-full"
            locale={locale}
          />
        </div>
        
        <AISuggestionDisplay
            suggestion={suggestionText}
            className="w-full max-w-2xl mt-4"
            locale={locale}
        />
      </main>
    </div>
  );
}

