import Link from 'next/link';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Articles', href: '/articles' },
  { label: 'About', href: '/#about' },
  { label: 'Archive', href: '/#archive' },
];

const Header = () => {
  return (
    <header className='border-b-2 border-foreground bg-background'>
      <div className='container flex items-center justify-between py-4 w-full'>
        <Link
          href='/'
          className='flex items-center gap-2'>
          <div className='w-8 h-8 bg-primary retro-shadow-sm' />
          <span className='text-xl font-bold tracking-tight font-display'>ETIENNELABS</span>
        </Link>

        <nav className='hidden md:flex items-center gap-8'>
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className='text-sm font-mono uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors'>
              {item.label}
            </Link>
          ))}
        </nav>

        <button className='retro-border retro-shadow-sm px-4 py-2 text-sm font-mono uppercase tracking-wider hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all'>
          Subscribe
        </button>
      </div>
    </header>
  );
};

export default Header;
