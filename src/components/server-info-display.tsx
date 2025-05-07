
'use client';

import type * as React from 'react';
import { Server } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Locale, TranslationKey } from '@/lib/translations';
import { getTranslation } from '@/lib/translations';

interface ServerInfoDisplayProps {
  downloadServerName: string;
  uploadServerName: string;
  className?: string;
  locale: Locale;
}

export function ServerInfoDisplay({
  downloadServerName,
  uploadServerName,
  className,
  locale,
}: ServerInfoDisplayProps) {
  const t = (key: TranslationKey) => getTranslation(locale, key);

  const renderInfo = (labelKey: TranslationKey, value: string | null | undefined) => (
    <div className="flex justify-between items-center text-sm py-1">
      <span className="text-muted-foreground">{t(labelKey)}:</span>
      <span className="font-medium text-right">{value ?? '--'}</span>
    </div>
  );

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Server className="h-5 w-5 text-accent" />
          {t('serverInfoTitle')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 pt-2">
        {renderInfo('download', downloadServerName)}
        {renderInfo('upload', uploadServerName)}
      </CardContent>
    </Card>
  );
}
