
import type * as React from 'react';
import { TowerControl, Info } from 'lucide-react';
import type { CellTowerInfo } from '@/services/cell-tower';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Locale, TranslationKey } from '@/lib/translations';
import { getTranslation } from '@/lib/translations';


interface CellTowerDisplayProps {
  cellInfo: CellTowerInfo | null;
  isLoading?: boolean;
  className?: string;
  locale: Locale;
}

export function CellTowerDisplay({ cellInfo, isLoading = false, className, locale }: CellTowerDisplayProps) {
  const t = (key: TranslationKey) => getTranslation(locale, key);

  const renderInfo = (labelKey: TranslationKey, value: string | null | undefined) => (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{t(labelKey)}:</span>
      <span className="font-medium">{value ?? '--'}</span>
    </div>
  );

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center justify-between gap-2">
           <div className="flex items-center gap-2">
             <TowerControl className="h-5 w-5 text-accent" />
             {t('cellTowerInfoSimulated')}
          </div>
           <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" align="end" className="max-w-[250px]">
                <p className={`text-xs ${locale === 'ar' ? 'text-right' : 'text-left'}`}>{t('towerInfoTooltip')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 pt-2">
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-full animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-full animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-full animate-pulse rounded-md bg-muted" />
          </div>
        ) : (
          <>
            {renderInfo('cellId', cellInfo?.cellId)}
            {renderInfo('lac', cellInfo?.lac)}
            {renderInfo('mcc', cellInfo?.mcc)}
            {renderInfo('mnc', cellInfo?.mnc)}
          </>
        )}
      </CardContent>
    </Card>
  );
}
