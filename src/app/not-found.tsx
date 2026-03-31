import Link from 'next/link';

const NotFound = () => {
  return (
    <div className='min-h-screen flex flex-col items-center justify-center gap-4'>
      <h1 className='text-4xl font-bold'>404</h1>
      <p className='text-muted-foreground font-mono'>Page not found</p>
      <Link
        href='/'
        className='font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors'>
        ← Back home
      </Link>
    </div>
  );
};

export default NotFound;
