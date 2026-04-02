import LatestArticles from '@/components/articles/LatestArticles';
import HeroSection from '@/components/HeroSection';
import { getAllArticles } from '@/lib/articles';

export default function Home() {
  const articles = getAllArticles();

  return (
    <div className='min-h-screen bg-background'>
      <HeroSection />
      <LatestArticles articles={articles} />
    </div>
  );
}
