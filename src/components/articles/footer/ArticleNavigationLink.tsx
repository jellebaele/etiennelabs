import { Article } from '@/lib/articles';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

type ArticleNavigationLinkProps = {
  article: Article | null;
  direction: 'previous' | 'next';
};

const ArticleNavigationLink = ({ article, direction }: ArticleNavigationLinkProps) => {
  const isPrevious = direction === 'previous';
  const Icon = isPrevious ? ChevronLeft : ChevronRight;
  const label = isPrevious ? 'Previous' : 'Next';

  return (
    <>
      {article && (
        <Link
          href={`/articles/${article.meta.slug}`}
          className='group block p-6 border border-border hover:border-primary transition-colors'>
          <div
            className={`flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2 ${!isPrevious && 'justify-end'}`}>
            {isPrevious && <Icon size={16} />}
            <span>{label}</span>
            {!isPrevious && <Icon size={16} />}
          </div>
          <h3
            className={`group-hover:text-primary text-base transition-colors ${!isPrevious && 'text-right'}`}>
            {article.meta.title}
          </h3>
        </Link>
      )}
    </>

    // <Link
    //   href={`/articles/${article.meta.slug}`}
    //   className='group block p-6 border-2 border-border hover:border-primary transition-colors'>
    //   <div className='flex items-center justify-end gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2'>
    //     <span>Next</span>
    //     <ChevronRight size={16} />
    //   </div>
    //   <h3 className='font-bold text-right group-hover:text-primary transition-colors'>
    //     {article.meta.title}
    //   </h3>
    // </Link>
  );
};

export default ArticleNavigationLink;
