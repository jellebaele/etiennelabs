import Image from 'next/image';
import Link from 'next/link';

const HeroSection = () => {
  return (
    <section className='relative overflow-hidden border-b-2 border-foreground'>
      <div className='container py-16 md:py-24'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-12 items-center mx-5'>
          <div className='space-y-6 opacity-0 animate-fade-up'>
            <div className='flex items-center gap-3'>
              <div className='h-px w-12 bg-primary' />
              <span className='font-mono text-xs uppercase tracking-widest text-muted-foreground'>
                Welcome to the blog
              </span>
            </div>

            <h1 className='text-5xl md:text-7xl font-bold leading-[0.95] tracking-tight'>
              Ideas,
              <br />
              <span className='text-primary'>Code</span>
              <br />& Design
            </h1>

            <p className='text-muted-foreground text-lg leading-relaxed max-w-md'>
              A space for exploring the intersection of creativity and technology. Curated thoughts
              on modern design and development.
            </p>

            <div className='flex gap-4 pt-2'>
              <Link
                href='/articles'
                className='bg-primary text-primary-foreground retro-shadow px-6 py-3 font-mono text-sm uppercase tracking-wider hover:-translate-y-0.5 transition-transform border-2 border-foreground'>
                Latest Articles
              </Link>
              <Link
                href='/about'
                className='retro-border px-6 py-3 font-mono text-sm uppercase tracking-wider hover:bg-muted transition-colors'>
                About Me
              </Link>
            </div>
          </div>

          <div
            className='relative opacity-0 animate-fade-up'
            style={{ animationDelay: '0.2s' }}>
            <div className='retro-border retro-shadow overflow-hidden'>
              <Image
                src='/hero-abstract.jpg'
                alt='Abstract retro geometric art'
                className='w-full h-100 object-cover'
                width={900}
                height={300}
                priority
              />
            </div>
            {/* Decorative elements */}
            <div className='absolute -bottom-4 -left-4 w-16 h-16 bg-accent border-2 border-foreground -z-10' />
            <div className='absolute -top-4 -right-4 w-8 h-8 bg-secondary rounded-full border-2 border-foreground -z-10' />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
