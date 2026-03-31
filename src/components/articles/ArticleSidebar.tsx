'use client';

import { Article } from '@/lib/articles';
import { ChevronDown, ChevronRight } from 'lucide-react'; // Optional: for icons
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

type SidebarProps = {
  articles: Article[];
};

const ArticleSidebar = ({ articles }: SidebarProps) => {
  const pathname = usePathname();

  return (
    <nav className='w-64 sticky top-24 h-fit flex flex-col gap-2 p-4 border-r border-border'>
      <p className='text-xs font-mono uppercase text-muted-foreground mb-4 tracking-widest'>
        Documentation
      </p>
      {articles.map((article) => (
        <SidebarItem
          key={article.meta.slug}
          article={article}
          currentPath={pathname}
        />
      ))}
    </nav>
  );
};

const SidebarItem = ({ article, currentPath }: { article: Article; currentPath: string }) => {
  const hasChildren = article.children && article.children.length > 0;
  const isActive = currentPath === `/articles/${article.meta.slug}`;

  // Auto-expand if we are currently viewing a child of this folder
  const isChildActive = hasChildren && currentPath.includes(`/articles/${article.meta.slug}/`);
  const [isOpen, setIsOpen] = useState(isChildActive);

  return (
    <div className='flex flex-col'>
      <div className='flex items-center group'>
        <Link
          href={`/articles/${article.meta.slug}`}
          className={`flex-1 py-1 px-2 text-sm transition-colors rounded-md ${
            isActive
              ? 'bg-primary/10 text-primary font-bold'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
          }`}>
          {article.meta.title}
        </Link>

        {hasChildren && (
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsOpen(!isOpen);
            }}
            className='p-1 hover:bg-secondary rounded-md text-muted-foreground'>
            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        )}
      </div>

      {/* Collapsible Section for Sub-articles */}
      {hasChildren && isOpen && (
        <div className='ml-4 mt-1 flex flex-col border-l border-border pl-2 gap-1'>
          {article.children!.map((child) => {
            const isSubActive = currentPath === `/articles/${child.meta.slug}`;
            return (
              <Link
                key={child.meta.slug}
                href={`/articles/${child.meta.slug}`}
                className={`py-1 px-2 text-xs transition-colors rounded-md ${
                  isSubActive
                    ? 'text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                }`}>
                {child.meta.title}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ArticleSidebar;
