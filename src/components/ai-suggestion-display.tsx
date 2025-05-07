
'use client';

import type * as React from 'react';
import { Sparkles, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { Locale } from '@/lib/translations';
import { getTranslation, type TranslationKey } from '@/lib/translations';

interface AISuggestionDisplayProps {
  suggestion: string | null;
  isLoading: boolean;
  error?: string | null;
  className?: string;
  locale: Locale;
}

export function AISuggestionDisplay({
  suggestion,
  isLoading,
  error,
  className,
  locale,
}: AISuggestionDisplayProps) {
  const t = (key: TranslationKey) => getTranslation(locale, key);

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          {t('aiSuggestionsTitle')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        ) : suggestion ? (
          <p className="text-sm whitespace-pre-line">{suggestion}</p>
        ) : (
          <p className="text-sm text-muted-foreground">{t('noSuggestionsYet')}</p>
        )}
      </CardContent>
    </Card>
  );
}
