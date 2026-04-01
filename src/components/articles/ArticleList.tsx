import { Article } from '@/lib/articles';
import ArticleCard from './ArticleCard';
import ArticleControls from './ArticleControls';
import ArticleCountDivider from './ArticleCountDivider';

type ArticleListProps = {
  articles: Article[];
};
const ArticleList = ({ articles }: ArticleListProps) => {
  return (
    <div className='flex flex-col gap-6'>
      <ArticleControls articles={articles} />
      <ArticleCountDivider count={articles.length} />

      {articles.map((article, index) => (
        <ArticleCard
          key={index}
          article={article}
        />
      ))}
    </div>
  );
};

export default ArticleList;
