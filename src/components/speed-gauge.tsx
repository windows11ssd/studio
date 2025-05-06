import type * as React from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface SpeedGaugeProps {
  currentSpeed: number;
  maxSpeed?: number; // e.g., 100 Mbps
  label: string;
  unit?: string;
  className?: string;
}

export function SpeedGauge({
  currentSpeed,
  maxSpeed = 100,
  label,
  unit = 'Mbps',
  className,
}: SpeedGaugeProps) {
  const progressValue = Math.min((currentSpeed / maxSpeed) * 100, 100);

  // Basic logarithmic scale for display, adjust factor as needed
  const logFactor = 50;
  const logSpeed = currentSpeed > 1 ? logFactor * Math.log10(currentSpeed) : 0;
  const logProgressValue = Math.min((logSpeed / 100) * 100, 100); // Assuming 100 is the visual max after log


  return (
    <div className={cn('flex flex-col items-center space-y-2', className)}>
       <div className="relative w-full max-w-xs h-4">
         {/* Using log scale for visual progress */}
        <Progress value={logProgressValue} className="h-full w-full [&>*]:bg-accent" />
         {/* Optional: Add markers or a more complex SVG gauge here if needed */}
       </div>
       <div className="text-center">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="text-2xl font-bold text-accent">
            {currentSpeed.toFixed(1)}
            <span className="mr-1 text-base font-medium text-muted-foreground">{unit}</span>
        </div>
       </div>
    </div>
  );
}
