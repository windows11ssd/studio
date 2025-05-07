
'use client';

import type * as React from 'react';
import { Server } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Locale, TranslationKey } from '@/lib/translations';
import { getTranslation } from '@/lib/translations';

interface TestServerInfoDisplayProps {
  downloadServer: string;
  uploadServer: string;
  className?: string;
  locale: Locale;
}

export function TestServerInfoDisplay({
  downloadServer,
  uploadServer,
  className,
  locale,
}: TestServerInfoDisplayProps) {
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
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Server className="h-5 w-5 text-accent" />
          {t('testServerInfoTitle')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 pt-2">
        {renderInfo('downloadServerLabel', downloadServer)}
        {renderInfo('uploadServerInfoLabel', uploadServer)}
      </CardContent>
    </Card>
  );
}
