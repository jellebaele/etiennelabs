import { Article } from '@/lib/articles';
import Link from 'next/link';

type ArticleCardProps = {
  article: Article;
};

const ArticleCard = ({ article }: ArticleCardProps) => {
  return (
    <Link
      key={article.meta.slug}
      href={`/articles/${article.meta.slug}`}
      className='group block retro-border retro-shadow p-6 hover:-translate-y-0.5 transition-transform'>
      <div className='flex items-center justify-between mb-3'>
        <div className='flex items-center justify-start gap-2'>
          {article.meta.tags.map((tag, index) => (
            <span
              key={index}
              className='tag-pill'>
              {tag}
            </span>
          ))}
        </div>
        <span className='text-xs font-mono text-muted-foreground'>{article.meta.date}</span>
      </div>
      <h2 className='text-xl font-bold mb-2 group-hover:text-primary transition-colors'>
        {article.meta.title}
      </h2>
      <p className='text-muted-foreground text-sm'>{article.meta.excerpt}</p>
    </Link>
  );
};

export default ArticleCard;
