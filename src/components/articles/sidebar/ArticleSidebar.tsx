import { Article } from '@/lib/articles';
import ArticleSidebarItem from './ArticleSidebarItem';

type SidebarProps = {
  articles: Article[];
};

const ArticleSidebar = ({ articles }: SidebarProps) => {
  return (
    <nav className='w-64 sticky top-24 h-fit flex flex-col gap-2 p-4 border-r border-border'>
      {articles.map((article) => (
        <ArticleSidebarItem
          key={article.meta.slug}
          article={article}
        />
      ))}
    </nav>
  );
};

export default ArticleSidebar;
