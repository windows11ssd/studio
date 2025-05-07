
'use client';

import type * as React from 'react';
import { Sparkles } from 'lucide-react'; // AlertTriangle can be removed if not used for client-side errors
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Locale } from '@/lib/translations';
import { getTranslation, type TranslationKey } from '@/lib/translations';

interface SuggestionDisplayProps { // Renamed interface for clarity
  suggestion: string | null;
  className?: string;
  locale: Locale;
}

export function AISuggestionDisplay({ // Component name can be changed later if desired
  suggestion,
  className,
  locale,
}: SuggestionDisplayProps) {
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
        {suggestion ? (
          <p className="text-sm whitespace-pre-line">{suggestion}</p>
        ) : (
          <p className="text-sm text-muted-foreground">{t('noSuggestionsYet')}</p>
        )}
      </CardContent>
    </Card>
  );
}
