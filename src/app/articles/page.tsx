import ArticleCard from '@/components/articles/ArticleCard';
import { getAllArticles } from '@/lib/articles';

const ArticlesPages = () => {
  const articles = getAllArticles();
  console.log(articles);

  return (
    <section className='py-16'>
      <div className='flex items-center gap-3 mb-12'>
        <div className='w-3 h-3 bg-primary' />
        <h1 className='text-3xl font-bold'>Articles</h1>
      </div>

      <div className='flex flex-col gap-6'>
        {articles.map((article, index) => (
          <ArticleCard
            key={index}
            article={article}
          />
        ))}
      </div>
    </section>
  );
};

export default ArticlesPages;
