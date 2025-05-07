
'use client';

import * as React from 'react';
import { ArrowDownToLine, ArrowUpFromLine, Gauge, Play, RotateCw, Wifi, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ResultDisplay } from '@/components/result-display';
import { CellTowerDisplay } from '@/components/cell-tower-display';
import { SpeedGauge } from '@/components/speed-gauge';
import type { SpeedTestResult } from '@/services/speed-test'; // runSpeedTest is not directly used for simulation
import { getCellTowerInfo, type CellTowerInfo } from '@/services/cell-tower';
import { useLanguage } from '@/contexts/language-context';
import { getTranslation, type TranslationKey } from '@/lib/translations';

type TestStage = 'idle' | 'ping' | 'download' | 'upload' | 'finished';

export default function Home() {
  const { locale, toggleLanguage } = useLanguage();
  const t = (key: TranslationKey) => getTranslation(locale, key);

  const [results, setResults] = React.useState<SpeedTestResult | null>(null);
  const [cellInfo, setCellInfo] = React.useState<CellTowerInfo | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isFetchingCellInfo, setIsFetchingCellInfo] = React.useState<boolean>(true);
  const [currentStage, setCurrentStage] = React.useState<TestStage>('idle');
  const [currentSpeed, setCurrentSpeed] = React.useState<number>(0);
  const animationFrameId = React.useRef<number | null>(null);


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

  const simulateProgress = (targetSpeed: number, duration: number = 2000) => {
    let startTime: number | null = null;
    
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progressRatio = Math.min(elapsed / duration, 1);
      const speedFluctuation = (Math.sin((progressRatio * Math.PI) - (Math.PI / 2)) + 1) / 2;
      const simulatedSpeed = targetSpeed * speedFluctuation * (0.8 + Math.random() * 0.4);
      setCurrentSpeed(simulatedSpeed);

      if (progressRatio < 1) {
        animationFrameId.current = requestAnimationFrame(step);
      }
    };
    if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
    }
    animationFrameId.current = requestAnimationFrame(step);
  };

  const handleStartTest = async (fileSizeMB?: number) => {
    setIsLoading(true);
    setResults(null);
    setCurrentSpeed(0);
    console.log(`Starting test with file size: ${fileSizeMB || 'default'} MB`);

    const baseDownloadSpeed = 50 + Math.random() * 50;
    const baseUploadSpeed = 20 + Math.random() * 30;

    const pingDuration = 500;
    const downloadSimDuration = fileSizeMB ? 1500 + fileSizeMB * 20 : 2500; // Increased multiplier for noticeable difference
    const uploadSimDuration = fileSizeMB ? 1500 + fileSizeMB * 10 : 2500; // Increased multiplier

    try {
      // --- PING ---
      setCurrentStage('ping');
      await new Promise(resolve => setTimeout(resolve, pingDuration));
      const pingResult = 20 + Math.random() * 30;

      // --- DOWNLOAD ---
      setCurrentStage('download');
      simulateProgress(baseDownloadSpeed, downloadSimDuration);
      await new Promise(resolve => setTimeout(resolve, downloadSimDuration + 200));
      const finalDownload = parseFloat((baseDownloadSpeed * (0.9 + Math.random() * 0.2)).toFixed(1));

      // --- UPLOAD ---
      setCurrentStage('upload');
      setCurrentSpeed(0); 
      simulateProgress(baseUploadSpeed, uploadSimDuration);
      await new Promise(resolve => setTimeout(resolve, uploadSimDuration + 200));
      const finalUpload = parseFloat((baseUploadSpeed * (0.9 + Math.random() * 0.2)).toFixed(1));
      
      // --- FINISHED ---
      const finalResults: SpeedTestResult = {
        downloadSpeedMbps: finalDownload,
        uploadSpeedMbps: finalUpload,
        pingMilliseconds: parseFloat(pingResult.toFixed(0)),
      };
      setResults(finalResults);
      setCurrentStage('finished');
      setCurrentSpeed(0);
    } catch (error) {
      console.error('Error running speed test:', error);
      setCurrentStage('idle');
      setCurrentSpeed(0);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Cleanup animation frame on component unmount or if isLoading becomes false
  React.useEffect(() => {
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);


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
    if (currentStage === 'finished' || results) { // Show "Test Again" if results are present
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
    { labelKey: 'test1GB', size: 1024 }, // 1GB = 1024MB
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
              maxSpeed={150} // Max speed for gauge display
              className="mb-6"
              unit={t('mbps')}
            />
         </div>
        <Button
          size="lg"
          onClick={() => handleStartTest()} // Default test without specific file size
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
                variant="outline"
                size="sm"
                onClick={() => handleStartTest(item.size)}
                disabled={isLoading}
                className="shadow-sm"
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

