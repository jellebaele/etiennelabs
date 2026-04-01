import { ArticleType, getAdjacentArticles } from '@/lib/articles';
import ArticleNavigationLink from './ArticleNavigationLink';

type ArticleFooterProps = {
  slug: string;
  type: ArticleType;
};

const ArticleFooter = ({ slug, type }: ArticleFooterProps) => {
  const { previous, next } = getAdjacentArticles(slug, type);

  return (
    <nav className='mt-16 pt-8'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div>
          <ArticleNavigationLink
            article={previous}
            direction='previous'
          />
        </div>
        <div>
          <ArticleNavigationLink
            article={next}
            direction='next'
          />
        </div>
      </div>
    </nav>
  );
};

export default ArticleFooter;
