import Link from 'next/link';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Articles', href: '/articles' },
  { label: 'About', href: '/#about' },
  { label: 'Archive', href: '/#archive' },
];

const Footer = () => {
  return (
    <footer className=' bg-card'>
      <div className='container py-12 max-w-7xl mx-auto px-8'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          <div>
            <div className='flex items-center gap-2 mb-4'>
              <div className='w-6 h-6 bg-primary' />
              <span className='text-lg font-bold font-display'>ETIENNELABS</span>
            </div>
            <p className='text-sm text-muted-foreground font-mono leading-relaxed'>
              Thoughts on design, code,
              <br />
              and everything in between.
            </p>
          </div>

          <div>
            <h4 className='font-mono text-xs uppercase tracking-widest mb-4 text-muted-foreground'>
              Navigate
            </h4>
            <ul className='space-y-2'>
              {navItems.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className='text-sm hover:text-primary transition-colors'>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className='font-mono text-xs uppercase tracking-widest mb-4 text-muted-foreground'>
              Connect
            </h4>
            <ul className='space-y-2'>
              {['Twitter', 'GitHub', 'RSS Feed'].map((item) => (
                <li key={item}>
                  <a
                    href='#'
                    className='text-sm hover:text-primary transition-colors'>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className='mt-12 pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4'>
          <p className='text-xs font-mono text-muted-foreground'>
            © Jelle Baele {new Date().getFullYear()} — All rights reserved
          </p>
          <div className='flex items-center gap-4'>
            <div className='w-2 h-2 bg-primary rounded-full' />
            <div className='w-2 h-2 bg-secondary rounded-full' />
            <div className='w-2 h-2 bg-accent rounded-full' />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
