'use client';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Article } from '@/lib/articles';
import { ChevronDown, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

type ArticleSidebarItemProps = {
  article: Article;
};

const ArticleSidebarItem = ({ article }: ArticleSidebarItemProps) => {
  const currentPath = usePathname();
  const hasChildren = article.children && article.children.length > 0;
  const isActive = currentPath === `/articles/${article.meta.slug}`;
  const [isOpen, setIsOpen] = useState(false);
  // // Auto-expand if we are currently viewing a child of this folder
  // const isChildActive = hasChildren && currentPath.includes(`/articles/${article.meta.slug}/`);
  // const [isOpen, setIsOpen] = useState(isChildActive);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}>
      <div
        className='flex flex-col'
        key={article.meta.title}>
        <div className='flex items-center group w-full'>
          <CollapsibleTrigger
            asChild
            onClick={() => hasChildren && setIsOpen(!isOpen)}>
            <div
              className={`flex items-center gap-2 w-full ${
                isActive
                  ? 'text-primary font-bold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-primary/10'
              }`}>
              <Link
                href={`/articles/${article.meta.slug}`}
                className={`flex-1 py-1 px-2 text-sm transition-colors rounded-md `}>
                {article.meta.title}
              </Link>
              {hasChildren &&
                (isOpen ? (
                  <ChevronDown
                    size={16}
                    className='mr-3'
                  />
                ) : (
                  <ChevronRight
                    size={16}
                    className='mr-3'
                  />
                ))}
            </div>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          {article.children &&
            article.children.map((child) => {
              const isSubActive = currentPath === `/articles/${child.meta.slug}`;

              return (
                <div
                  className={`flex items-center gap-2 w-full ${
                    isSubActive
                      ? 'text-primary font-bold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-primary/10'
                  }`}>
                  <Link
                    href={`/articles/${child.meta.slug}`}
                    className={`flex-1 py-1 px-6 text-sm transition-colors rounded-md `}>
                    {child.meta.title}
                  </Link>
                </div>
              );
            })}
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default ArticleSidebarItem;
