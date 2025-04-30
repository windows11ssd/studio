import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"; // Import Toaster

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Update metadata for PWA
export const metadata: Metadata = {
  title: 'NetGauge Speed Test',
  description: 'Measure your internet connection speed with NetGauge.',
  manifest: "/manifest.json", // Link to the manifest file
  // Optional: Add theme color and Apple-specific tags if needed
  // themeColor: "#008080", // Corresponds to --accent
  // appleWebApp: {
  //   capable: true,
  //   statusBarStyle: "default",
  //   title: "NetGauge",
  // },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
       <head>
         {/* Add theme-color meta tag for PWA compatibility */}
        <meta name="theme-color" content="#008080" />
        {/* Ensure viewport settings are appropriate for mobile */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Toaster /> {/* Add Toaster component here */}
      </body>
    </html>
  );
}
