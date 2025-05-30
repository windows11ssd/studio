
import type {NextConfig} from 'next';
import PWA from '@ducanh2912/next-pwa';

const withPWA = PWA({
  dest: 'public', // Destination directory for the PWA files
  // disable: process.env.NODE_ENV === 'development', // Disable PWA in development
  register: true, // Register the service worker
  skipWaiting: true, // Skip waiting for service worker activation
  // You might want to specify runtime caching strategies here
});


const nextConfig: NextConfig = {
  output: 'export', // Enable static HTML export
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true, // Required for 'output: export' with next/image
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default withPWA(nextConfig);

