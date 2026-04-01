import ArticleSidebar from '@/components/articles/sidebar/ArticleSidebar';
import { getAllArticles } from '@/lib/articles';
import { ReactNode } from 'react';

type ArticleLayoutProps = {
  children: ReactNode;
};

const ArticleLayout = ({ children }: ArticleLayoutProps) => {
  const articles = getAllArticles();

  return (
    <div className='co∂ntainer mx-auto flex gap-10'>
      {/* Sidebar hidden on mobile, visible on md+ */}
      <aside className='hidden md:block'>
        <ArticleSidebar articles={articles} />
      </aside>

      <main className='flex-1 w-full max-w-3xl py-10'>{children}</main>
    </div>
  );
};

export default ArticleLayout;
