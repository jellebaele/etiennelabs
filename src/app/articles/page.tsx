import { getAllArticles } from '@/lib/articles';
import Link from 'next/link';

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
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/articles/${article.slug}`}
            className='group block retro-border retro-shadow p-6 hover:-translate-y-0.5 transition-transform'>
            <div className='flex items-center justify-between mb-3'>
              <div className='flex items-center justify-start gap-2'>
                {article.tags.map((tag, index) => (
                  <span
                    key={index}
                    className='tag-pill'>
                    {tag}
                  </span>
                ))}
              </div>

              <span className='text-xs font-mono text-muted-foreground'>{article.date}</span>
            </div>
            <h2 className='text-xl font-bold mb-2 group-hover:text-primary transition-colors'>
              {article.title}
            </h2>
            <p className='text-muted-foreground text-sm'>{article.excerpt}</p>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default ArticlesPages;
