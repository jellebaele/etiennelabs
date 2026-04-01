import LatestArticles from '@/components/articles/LatestArticles';
import HeroSection from '@/components/HeroSection';

export default function Home() {
  return (
    <div className='min-h-screen bg-background'>
      <HeroSection />
      <LatestArticles />
    </div>
  );
}
