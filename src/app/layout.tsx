import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { cn } from '@/lib/utils';
import { siteConfig } from 'config/site';
import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang='en'
      suppressHydrationWarning
      className={cn('font-sans', geist.variable)}>
      <body>
        <div className='min-h-screen bg-background max-w-7xl mx-auto px-8'>
          <div className='grain-overlay' />
          <Header />
          {children}
        </div>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
