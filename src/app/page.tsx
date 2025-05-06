'use client';

import * as React from 'react';
import { ArrowDownToLine, ArrowUpFromLine, Gauge, Play, RotateCw, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ResultDisplay } from '@/components/result-display';
import { CellTowerDisplay } from '@/components/cell-tower-display';
import { SpeedGauge } from '@/components/speed-gauge';
import { runSpeedTest, type SpeedTestResult } from '@/services/speed-test';
import { getCellTowerInfo, type CellTowerInfo } from '@/services/cell-tower';

type TestStage = 'idle' | 'ping' | 'download' | 'upload' | 'finished';

export default function Home() {
  const [results, setResults] = React.useState<SpeedTestResult | null>(null);
  const [cellInfo, setCellInfo] = React.useState<CellTowerInfo | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isFetchingCellInfo, setIsFetchingCellInfo] = React.useState<boolean>(true);
  const [currentStage, setCurrentStage] = React.useState<TestStage>('idle');
  const [currentSpeed, setCurrentSpeed] = React.useState<number>(0);

  // Fetch cell info on initial load
  React.useEffect(() => {
    const fetchCellInfo = async () => {
      setIsFetchingCellInfo(true);
      try {
        const info = await getCellTowerInfo();
        setCellInfo(info);
      } catch (error) {
        console.error('Error fetching cell info:', error);
        // Handle error state if needed
      } finally {
        setIsFetchingCellInfo(false);
      }
    };
    fetchCellInfo();
  }, []);

  // Simulate speed test progress
  const simulateProgress = (stage: TestStage, targetSpeed: number, duration: number = 2000) => {
    setCurrentStage(stage);
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progressRatio = Math.min(elapsed / duration, 1);

      // Simulate fluctuating speed, peaking towards the middle/end
      const speedFluctuation = (Math.sin((progressRatio * Math.PI) - (Math.PI / 2)) + 1) / 2; // Ease in/out effect
      const simulatedSpeed = targetSpeed * speedFluctuation * (0.8 + Math.random() * 0.4); // Add randomness

      setCurrentSpeed(simulatedSpeed);

      if (progressRatio < 1) {
        requestAnimationFrame(step);
      } else {
         setCurrentSpeed(targetSpeed); // Set final speed
      }
    };
    requestAnimationFrame(step);
  };

  const handleStartTest = async () => {
    setIsLoading(true);
    setResults(null); // Clear previous results
    setCurrentSpeed(0);

    try {
       // Simulate Ping
       setCurrentStage('ping');
       // In a real app, ping result would come from the test
       await new Promise(resolve => setTimeout(resolve, 500)); // Short delay for ping
       const pingResult = 30 + Math.random() * 20; // Simulate ping


      // Simulate Download
      simulateProgress('download', 50 + Math.random() * 50); // Simulate download up to 100 Mbps
      await new Promise(resolve => setTimeout(resolve, 2500));


       // Simulate Upload
       simulateProgress('upload', 20 + Math.random() * 30); // Simulate upload up to 50 Mbps
       await new Promise(resolve => setTimeout(resolve, 2500));


      // Fetch actual results (replace with real API call simulation)
      // const testResults = await runSpeedTest(); // Using the mock for now
       const finalResults: SpeedTestResult = {
         downloadSpeedMbps: currentSpeed, // Use the final simulated speed
         uploadSpeedMbps: currentSpeed, // This would be different in reality
         pingMilliseconds: pingResult,
       }
       // Find final speeds from simulation
        const finalDownload = 50 + Math.random() * 50;
        const finalUpload = 20 + Math.random() * 30;
        finalResults.downloadSpeedMbps = finalDownload;
        finalResults.uploadSpeedMbps = finalUpload;


      setResults(finalResults);
      setCurrentStage('finished');
      setCurrentSpeed(0); // Reset gauge after upload completes


    } catch (error) {
      console.error('Error running speed test:', error);
      setCurrentStage('idle');
      // Handle error state (e.g., show a toast message)
    } finally {
      setIsLoading(false);
    }
  };

  const getGaugeLabel = () => {
    switch (currentStage) {
      case 'ping': return 'جاري اختبار البينج...';
      case 'download': return 'تنزيل';
      case 'upload': return 'رفع';
      default: return 'سرعة';
    }
  }

  const getButtonContent = () => {
    if (isLoading) {
      return (
        <>
          <RotateCw className="ml-2 h-4 w-4 animate-spin" />
          جاري الاختبار...
        </>
      );
    }
    if (currentStage === 'finished') {
        return (
            <>
             <RotateCw className="ml-2 h-4 w-4" />
             اختبار مرة أخرى
            </>
        );
    }
    return (
      <>
        <Play className="ml-2 h-4 w-4" />
        ابدأ الاختبار
      </>
    );
  };


  return (
    <div className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-primary flex items-center justify-center gap-2">
          <Wifi className="h-8 w-8 text-accent" /> نت جيدج
        </h1>
        <p className="text-muted-foreground">قم بقياس سرعة اتصالك بالإنترنت.</p>
      </header>

      <main className="flex w-full max-w-2xl flex-col items-center space-y-8">
        {/* Gauge Display */}
         <div className="w-full p-6 rounded-lg shadow-md bg-card">
           <SpeedGauge
              currentSpeed={currentSpeed}
              label={getGaugeLabel()}
              maxSpeed={150} // Adjust based on expected max speeds for visual scale
              className="mb-6"
              unit="ميجابت/ثانية"
            />
         </div>


        {/* Start Button */}
        <Button
          size="lg"
          onClick={handleStartTest}
          disabled={isLoading}
          className="w-48 bg-accent text-accent-foreground hover:bg-accent/90 rounded-full shadow-lg transition-transform duration-200 active:scale-95"
        >
          {getButtonContent()}
        </Button>

        {/* Results Display */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          <ResultDisplay
            icon={Gauge} // Using Gauge for Ping as WifiOff/Signal is not ideal
            label="البينج"
            value={results?.pingMilliseconds?.toFixed(0) ?? null}
            unit="مللي ثانية"
            isLoading={isLoading && currentStage !== 'idle'}
          />
          <ResultDisplay
            icon={ArrowDownToLine}
            label="تنزيل"
            value={results?.downloadSpeedMbps?.toFixed(1) ?? null}
            unit="ميجابت/ثانية"
            isLoading={isLoading && currentStage !== 'idle' && currentStage !== 'ping'}
          />
          <ResultDisplay
            icon={ArrowUpFromLine}
            label="رفع"
            value={results?.uploadSpeedMbps?.toFixed(1) ?? null}
            unit="ميجابت/ثانية"
             isLoading={isLoading && currentStage !== 'idle' && currentStage !== 'ping' && currentStage !== 'download'}
          />
        </div>

        {/* Cell Tower Info */}
        <CellTowerDisplay
          cellInfo={cellInfo}
          isLoading={isFetchingCellInfo}
          className="w-full max-w-xs"
         />
      </main>

      {/* Footer removed */}
    </div>
  );
}
