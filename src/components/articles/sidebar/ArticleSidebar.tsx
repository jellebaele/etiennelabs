import { Article } from '@/lib/articles';
import ArticleSidebarItem from './ArticleSidebarItem';

type SidebarProps = {
  articles: Article[];
};

const ArticleSidebar = ({ articles }: SidebarProps) => {
  return (
    <nav className='w-64 sticky top-24 h-fit flex flex-col gap-2 p-4 border-r border-border'>
      {articles.map((article, index) => (
        <ArticleSidebarItem
          key={index}
          article={article}
        />
      ))}
    </nav>
  );
};

export default ArticleSidebar;
