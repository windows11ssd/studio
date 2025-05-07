
'use client';

import * as React from 'react';
import { ArrowDownToLine, ArrowUpFromLine, Gauge, Play, RotateCw, Wifi, Languages } from 'lucide-react';
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

type TestStage = 'idle' | 'ping' | 'download' | 'upload' | 'finished';

// Using Cloudflare's speed test files.
// The 'size' property in fileMap keys and fileTestSizes corresponds to the nominal size in MB for user display.
// The 'sizeBytes' property in fileMap is the actual number of bytes served by Cloudflare for that file.
const fileMap: Record<number, { path: string, sizeBytes: number }> = {
    10: { path: 'https://speed.cloudflare.com/__down?bytes=10000000', sizeBytes: 10 * 1000 * 1000 },    // 10 Million Bytes
    100: { path: 'https://speed.cloudflare.com/__down?bytes=100000000', sizeBytes: 100 * 1000 * 1000 }, // 100 Million Bytes
    500: { path: 'https://speed.cloudflare.com/__down?bytes=500000000', sizeBytes: 500 * 1000 * 1000 }, // 500 Million Bytes
    1000: { path: 'https://speed.cloudflare.com/__down?bytes=1000000000', sizeBytes: 1000 * 1000 * 1000 },// 1 Billion Bytes (referred to as 1GB)
};
const defaultFileSizeKey = 100; // Default test file key (corresponds to 100MB file)


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
  const abortControllerRef = React.useRef<AbortController | null>(null);
  const uploadAnimationRef = React.useRef<number | null>(null);


  React.useEffect(() => {
    document.title = t('pageTitle');
  }, [locale, t]);

  React.useEffect(() => {
    const fetchCellInfo = async () => {
      setIsFetchingCellInfo(true);
      try {
        const info = await getCellTowerInfo();
        setCellInfo(info);
      } catch (error) {
        console.error('Error fetching cell info:', error);
      } finally {
        setIsFetchingCellInfo(false);
      }
    };
    fetchCellInfo();
  }, []);

  React.useEffect(() => {
    // Cleanup abort controller and upload animation on component unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (uploadAnimationRef.current) {
        cancelAnimationFrame(uploadAnimationRef.current);
      }
    };
  }, []);

  const handleStartTest = async (fileSizeKeyParam?: number) => {
    if (isLoading) return;

    setIsLoading(true);
    setResults(null);
    setCurrentSpeed(0);
    setCurrentStage('idle');

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    if (uploadAnimationRef.current) {
      cancelAnimationFrame(uploadAnimationRef.current);
      uploadAnimationRef.current = null;
    }
    
    const selectedFileSizeKey = fileSizeKeyParam || defaultFileSizeKey;
    console.log(`Starting test with file size key: ${selectedFileSizeKey}`);


    let finalDownloadSpeed = 0;
    let finalUploadSpeed = 0;
    let pingResult = 0;

    try {
      // --- PING ---
      setCurrentStage('ping');
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate ping
      if (signal.aborted) throw new Error('Test aborted');
      pingResult = 20 + Math.random() * 30;

      // --- DOWNLOAD ---
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
        const response = await fetch(fileUrl, { signal, cache: 'no-store' }); // Add cache: 'no-store'
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
            reader.cancel(); 
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
        if (fetchError.name === 'AbortError' || fetchError.message.includes('aborted')) {
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
        setCurrentStage('finished'); 
        setIsLoading(false);
        setCurrentSpeed(0);
        return;
      }

      const downloadEndTime = Date.now();
      const downloadDurationSeconds = (downloadEndTime - downloadStartTime) / 1000;
      finalDownloadSpeed = downloadDurationSeconds > 0 ? parseFloat(((actualFileSizeInBytes * 8) / (downloadDurationSeconds * 1000000)).toFixed(1)) : 0;

      if (signal.aborted) throw new Error('Test aborted');

      // --- UPLOAD (Simulated) ---
      setCurrentStage('upload');
      setCurrentSpeed(0);
      const uploadBaseSpeed = 20 + Math.random() * 30; // Mbps
      // Use selectedFileSizeKey for scaling upload duration
      const uploadSimDuration = 1500 + selectedFileSizeKey * (isMobile ? 0.15 : 0.08) * (actualFileSizeInBytes / (1000*1000) / 100) ; // Scale based on MBs of the key
      
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
      if (signal.aborted) throw new Error('Test aborted');
      finalUploadSpeed = parseFloat((uploadBaseSpeed * (0.9 + Math.random() * 0.2)).toFixed(1));
      
      // --- FINISHED ---
      const finalResultsData: SpeedTestResult = {
        downloadSpeedMbps: finalDownloadSpeed,
        uploadSpeedMbps: finalUploadSpeed,
        pingMilliseconds: parseFloat(pingResult.toFixed(0)),
      };
      setResults(finalResultsData);
      setCurrentStage('finished');

    } catch (error: any) {
      if (error.name === 'AbortError' || error.message.includes('aborted')) {
        console.log('Speed test was aborted.');
        toast({ title: t('testAbortedTitle'), description: t('testAbortedDescription') });
      } else {
        console.error('Error running speed test:', error);
        toast({ title: t('errorTitle'), description: error.message || t('genericError'), variant: 'destructive' });
      }
      setCurrentStage('idle'); 
    } finally {
      setCurrentSpeed(0);
      setIsLoading(false);
      abortControllerRef.current = null;
      if (uploadAnimationRef.current) {
        cancelAnimationFrame(uploadAnimationRef.current);
        uploadAnimationRef.current = null;
      }
    }
  };
  

  const getGaugeLabel = () => {
    switch (currentStage) {
      case 'ping': return t('testingPing');
      case 'download': return t('download');
      case 'upload': return t('upload');
      default: return t('speed');
    }
  };

  const getButtonContent = () => {
    if (isLoading) {
      return (
        <>
          <RotateCw className={`h-4 w-4 animate-spin ${locale === 'ar' ? 'ml-2' : 'mr-2'}`} />
          {t('testingInProgress')}
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

  const fileTestSizes = [
    { labelKey: 'test10MB', size: 10 },
    { labelKey: 'test100MB', size: 100 },
    { labelKey: 'test500MB', size: 500 },
    { labelKey: 'test1GB', size: 1000 }, // Corresponds to 1000 key in fileMap (1 Billion Bytes)
  ] as const;


  return (
    <div className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <header className="mb-8 text-center relative w-full">
        <div className="flex items-center justify-center">
            <h1 className="text-4xl font-bold text-primary flex items-center justify-center gap-2">
            <Wifi className="h-8 w-8 text-accent" /> {t('netGauge')}
            </h1>
        </div>
        <p className="text-muted-foreground">{t('measureSpeed')}</p>
        <Button
            variant="outline"
            size="icon"
            onClick={toggleLanguage}
            className={`absolute top-0 m-2 md:m-0 ${locale === 'ar' ? 'left-0' : 'right-0'}`}
            aria-label={locale === 'ar' ? t('toggleToEnglish') : t('toggleToArabic')}
            title={locale === 'ar' ? t('toggleToEnglish') : t('toggleToArabic')}
          >
            <Languages className="h-5 w-5" />
        </Button>
      </header>

      <main className="flex w-full max-w-2xl flex-col items-center space-y-8">
         <div className="w-full p-6 rounded-lg shadow-md bg-card">
           <SpeedGauge
              currentSpeed={currentSpeed}
              label={getGaugeLabel()}
              maxSpeed={isMobile ? 200 : 1000} // Adjusted maxSpeed based on typical fiber speeds
              className="mb-6"
              unit={t('mbps')}
            />
         </div>
        <Button
          size="lg"
          onClick={() => handleStartTest()} // Uses defaultFileSizeKey
          disabled={isLoading}
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
        
        <div className="mt-8 w-full max-w-2xl flex flex-col items-center space-y-3">
          <p className="text-sm text-muted-foreground">{t('fileSizeButtonsLabel')}</p>
          <div className="flex flex-wrap justify-center gap-2">
            {fileTestSizes.map((item) => (
              <Button
                key={item.size}
                size="sm"
                onClick={() => handleStartTest(item.size)} // Passes the key (10, 100, 500, 1000)
                disabled={isLoading}
                className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm"
              >
                {t(item.labelKey)}
              </Button>
            ))}
          </div>
        </div>

        <CellTowerDisplay
          cellInfo={cellInfo}
          isLoading={isFetchingCellInfo}
          className="w-full max-w-xs"
          locale={locale}
         />
      </main>
    </div>
  );
}

