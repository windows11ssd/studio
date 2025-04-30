import type * as React from 'react';
import { TowerControl } from 'lucide-react';
import type { CellTowerInfo } from '@/services/cell-tower';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <TowerControl className="h-5 w-5 text-accent" />
          Cell Tower Info
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-full animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-full animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-full animate-pulse rounded-md bg-muted" />
          </div>
        ) : (
          <>
            {renderInfo('Cell ID', cellInfo?.cellId)}
            {renderInfo('LAC', cellInfo?.lac)}
            {renderInfo('MCC', cellInfo?.mcc)}
            {renderInfo('MNC', cellInfo?.mnc)}
          </>
        )}
      </CardContent>
    </Card>
  );
}
