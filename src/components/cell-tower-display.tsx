import type * as React from 'react';
import { TowerControl, Info } from 'lucide-react';
import type { CellTowerInfo } from '@/services/cell-tower';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"


interface CellTowerDisplayProps {
  cellInfo: CellTowerInfo | null;
  isLoading?: boolean;
  className?: string;
}

export function CellTowerDisplay({ cellInfo, isLoading = false, className }: CellTowerDisplayProps) {
  const renderInfo = (label: string, value: string | null | undefined) => (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium">{value ?? '--'}</span>
    </div>
  );

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center justify-between gap-2">
           <div className="flex items-center gap-2">
             <TowerControl className="h-5 w-5 text-accent" />
             معلومات البرج (محاكاة)
          </div>
           <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" align="end" className="max-w-[250px]">
                <p className="text-xs text-right">تفاصيل برج الخلية في الوقت الفعلي (معرف الخلية، LAC) غير متوفرة بشكل عام في متصفحات الويب. البيانات المعروضة هي محاكاة أو تستند إلى أمثلة.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
         {/* Optional: Add a small text description directly if tooltip isn't enough
         <CardDescription className="text-xs pt-1 flex items-center gap-1">
           <Info className="h-3 w-3" /> Data is simulated due to browser limitations.
         </CardDescription>
         */}
      </CardHeader>
      <CardContent className="space-y-1 pt-2"> {/* Added pt-2 for spacing */}
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-full animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-full animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-full animate-pulse rounded-md bg-muted" />
          </div>
        ) : (
          <>
            {renderInfo('معرف الخلية', cellInfo?.cellId)}
            {renderInfo('LAC', cellInfo?.lac)}
            {renderInfo('MCC', cellInfo?.mcc)}
            {renderInfo('MNC', cellInfo?.mnc)}
          </>
        )}
      </CardContent>
    </Card>
  );
}
