import Header from '@/components/Header';
import type { Metadata } from 'next';
import './globals.css';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: 'etiennelab.dev',
  description: 'A blog site',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang='en'
      suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <body>
        <div className='min-h-screen bg-background max-w-7xl mx-auto px-8'>
          <div className='grain-overlay' />
          <Header />
          {children}
          {/* <Footer /> */}
        </div>
      </body>
    </html>
  );
}
