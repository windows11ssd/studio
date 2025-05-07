
'use client';

import * as React from 'react';
import { Server, Wifi } from 'lucide-react'; // Wifi can represent client connection
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Locale, TranslationKey } from '@/lib/translations';
import { getTranslation } from '@/lib/translations';
import { Skeleton } from '@/components/ui/skeleton';

interface ClientConnectionInfo {
  ip: string;
  isp: string;
  org: string;
  city: string;
  country: string;
}

interface ServerInfoDisplayProps {
  className?: string;
  locale: Locale;
}

export function ServerInfoDisplay({
  className,
  locale,
}: ServerInfoDisplayProps) {
  const t = (key: TranslationKey, params?: Record<string, string | number>) => getTranslation(locale, key, params);
  const [connectionInfo, setConnectionInfo] = React.useState<ClientConnectionInfo | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchConnectionInfo = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/ipinfo');
        if (!response.ok) {
          let descriptiveError = `Failed to fetch connection info: ${response.status} ${response.statusText}.`;
          try {
            // Try to parse the error response as JSON, as our API route should provide JSON errors.
            const errorJson = await response.json();
            if (errorJson && errorJson.error) {
              descriptiveError = errorJson.error; // Use the specific error message from our API.
            }
          } catch (jsonParseError) {
            // If parsing as JSON fails, the body might be HTML or plain text.
            // This indicates the scenario where "Failed to parse error response" would occur.
            try {
              const errorText = await response.text();
              // Append a snippet of the raw response to the error for more context.
              descriptiveError += ` Response body: ${errorText.substring(0, 200)}`; 
            } catch (textParseError) {
              // If we can't even get text, stick to the status and original assumption.
               descriptiveError = 'Failed to parse error response from API. Status: ' + response.status + " " + response.statusText;
            }
          }
          throw new Error(descriptiveError);
        }

        const data: ClientConnectionInfo = await response.json();
        // This handles the case where the API route returns 200 OK, but with an error field in the JSON
        if (data && (data as any).error) {
          throw new Error((data as any).error);
        }
        setConnectionInfo(data);

      } catch (e: any) {
        console.error("Failed to fetch connection info:", e);
        setError(e.message || t('errorServerInfo')); // Set the error state with the message from the caught error
      } finally {
        setIsLoading(false);
      }
    };

    fetchConnectionInfo();
  }, [t]); // Added t to dependency array as it's used in the effect

  const renderInfo = (labelKey: TranslationKey, value: string | null | undefined) => (
    <div className="flex justify-between items-center text-sm py-1">
      <span className="text-muted-foreground">{t(labelKey)}:</span>
      <span className="font-medium text-right break-all">{value || '--'}</span>
    </div>
  );
  
  const locationString = connectionInfo?.city && connectionInfo?.country 
    ? `${connectionInfo.city}, ${connectionInfo.country}` 
    : connectionInfo?.city || connectionInfo?.country || '--';


  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Wifi className="h-5 w-5 text-accent" /> 
          {t('serverInfoTitle')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 pt-2">
        {isLoading ? (
          <>
            <Skeleton className="h-5 w-3/4 my-1" />
            <Skeleton className="h-5 w-full my-1" />
            <Skeleton className="h-5 w-2/3 my-1" />
            <Skeleton className="h-5 w-1/2 my-1" />
          </>
        ) : error ? (
           <div className="flex justify-between items-center text-sm py-1">
             <span className="text-destructive">{error}</span>
           </div>
        ) : connectionInfo ? (
          <>
            {renderInfo('clientIpLabel', connectionInfo.ip)}
            {renderInfo('ispLabel', connectionInfo.isp !== 'N/A' ? connectionInfo.isp : connectionInfo.org)}
            {/* Show organization if different from ISP and not N/A, or if ISP is N/A */}
            {connectionInfo.org && connectionInfo.org !== 'N/A' && connectionInfo.org !== connectionInfo.isp && 
             renderInfo('orgLabel', connectionInfo.org)}
            {renderInfo('locationLabel', locationString)}
          </>
        ) : (
           <div className="flex justify-between items-center text-sm py-1">
             <span>{t('errorServerInfo')}</span> {/* Fallback if info is null without specific error */}
           </div>
        )}
         <div className="flex justify-between items-center text-sm py-1 border-t mt-2 pt-2">
            <span className="text-muted-foreground">{t('uploadServerInfoLabel')}:</span>
            <span className="font-medium text-right">{t('uploadSimulatedServer')}</span>
        </div>
      </CardContent>
    </Card>
  );
}

