import { getAllArticles } from '@/lib/articles';
import Link from 'next/link';
import ArticleCard from './ArticleCard';

const LatestArticles = () => {
  const articles = getAllArticles();

  return (
    <section
      className='container py-16 md:py-24'
      id='articles'>
      <div className='flex items-center justify-between mb-12'>
        <div className='flex items-center gap-3'>
          <div className='w-3 h-3 bg-primary' />
          <h2 className='text-3xl font-bold'>Latest Articles</h2>
        </div>
        <Link
          href='/articles'
          className='font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors'>
          View all →
        </Link>
      </div>
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
        {articles.slice(0, 3).map((article, index) => {
          return (
            <ArticleCard
              key={index}
              article={article}
              showTags={false}
              showDate={false}
            />
          );
        })}
      </div>
    </section>
  );
};

export default LatestArticles;
