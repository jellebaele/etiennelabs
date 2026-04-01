import ArticleList from '@/components/articles/ArticleList';
import { getAllArticles } from '@/lib/articles';

const ArticlesPages = () => {
  const articles = getAllArticles();

  return (
    <section className='py-16'>
      <div className='flex items-center gap-3 mb-12'>
        <div className='w-3 h-3 bg-primary' />
        <h1 className='text-3xl font-bold'>Articles</h1>
      </div>

      <ArticleList articles={articles} />
    </section>
  );
};

export default ArticlesPages;
