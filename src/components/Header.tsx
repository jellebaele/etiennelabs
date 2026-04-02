'use client';

import { siteConfig } from 'config/site';
import { Menu } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from './ui/sheet';

const Header = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className='border-b-2 border-foreground bg-background'>
      <div className='container flex items-center justify-between py-4 w-full'>
        <Link
          href='/'
          className='flex items-center gap-2'>
          <div className='w-8 h-8 bg-primary retro-shadow-sm' />
          <span className='text-xl font-bold tracking-tight font-display'>{siteConfig.name}</span>
        </Link>

        <nav className='hidden md:flex items-center gap-8'>
          {siteConfig.navigation.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className='text-sm font-mono uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors'>
              {item.label}
            </Link>
          ))}
        </nav>

        <Sheet
          open={open}
          onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className='md:hidden retro-border retro-shadow-sm p-2 hover:bg-primary hover:text-primary-foreground transition-all'>
              <Menu className='h-5 w-5' />
            </button>
          </SheetTrigger>
          <SheetContent side='right'>
            <SheetTitle className='font-display text-lg tracking-tight ml-5 mt-7'>Menu</SheetTitle>
            <nav className='flex flex-col gap-4 mt-8 px-5'>
              {siteConfig.navigation.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className='text-sm font-mono uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors py-2 border-b border-border'>
                  {item.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;
