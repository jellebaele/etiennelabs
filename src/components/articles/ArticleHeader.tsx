import { Article } from '@/lib/articles';
import Link from 'next/link';

type ArticleHeaderProps = {
  article: Article;
};

const ArticleHeader = ({ article }: ArticleHeaderProps) => {
  return (
    <section className='container py-4 md:py-8'>
      <Link
        href='/articles'
        className='font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors inline-block mb-8'>
        ← Back to articles
      </Link>

      <div className='flex items-center justify-start gap-2'>
        {article.meta.tags.map((tag, index) => (
          <span
            key={index}
            className='tag-pill mb-4 block w-fit'>
            {tag}
          </span>
        ))}
      </div>

      <h1 className='text-4xl md:text-6xl font-bold leading-[0.95] tracking-tight mt-4'>
        {article.meta.title}
      </h1>

      <div className='flex items-center gap-4 mt-6'>
        <time className='font-mono text-xs uppercase tracking-wider text-muted-foreground'>
          {article.meta.date}
        </time>
        <div className='w-2 h-2 bg-primary rounded-full' />
        <span className='font-mono text-xs uppercase tracking-wider text-muted-foreground'>
          {Math.ceil(article.meta.readingTimeMs / 60000)} min read
        </span>
      </div>
    </section>
  );
};

export default ArticleHeader;
