import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SITE_NAME } from '@/lib/config';
import SessionProvider from '@/components/SessionProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: SITE_NAME,
  description: 'Second-hand clothing store',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sr">
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body className={`${inter.className} antialiased bg-gray-50 text-gray-900`}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
