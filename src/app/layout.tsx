
import type { Metadata, Viewport } from 'next';
// Removed Geist_Sans and Geist_Mono imports as they are not Google Fonts and cause an error.
// The application uses Tajawal font imported via globals.css.
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from '@/contexts/language-context';

// Removed geistSans and geistMono constant declarations.

export const metadata: Metadata = {
  // Title and description will be dynamically set on the client-side via context/translations
  // Provide generic or default values here for SSR and SEO.
  title: 'NetGauge Speed Test | مقياس الشبكة نت جيدج',
  description: 'Measure your internet connection speed. قم بقياس سرعة اتصالك بالإنترنت.',
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#008080", // Corresponds to --accent
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Default lang and dir for SSR. LanguageProvider will update this on the client-side.
    <html lang="ar" dir="rtl">
      <head />
      {/* Removed geistSans.variable and geistMono.variable from className */}
      <body className="antialiased">
        <LanguageProvider>
          {children}
          <Toaster />
        </LanguageProvider>
      </body>
    </html>
  );
}

