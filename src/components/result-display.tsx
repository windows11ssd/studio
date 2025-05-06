import type * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ResultDisplayProps {
  icon: LucideIcon;
  label: string;
  value: number | string | null;
  unit: string;
  className?: string;
  isLoading?: boolean;
}

export function ResultDisplay({
  icon: Icon,
  label,
  value,
  unit,
  className,
  isLoading = false,
}: ResultDisplayProps) {
  return (
    <Card className={cn('flex flex-col items-center justify-center text-center', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Icon className="h-4 w-4" />
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-8 w-24 animate-pulse rounded-md bg-muted" />
        ) : (
          <div className="text-3xl font-bold">
            {value !== null ? value : '--'}
            <span className="mr-1 text-lg font-medium text-muted-foreground">{unit}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
