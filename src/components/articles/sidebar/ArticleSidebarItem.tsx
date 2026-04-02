'use client';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Article } from '@/lib/articles';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

type ArticleSidebarItemProps = {
  article: Article;
};

const ArticleSidebarItem = ({ article }: ArticleSidebarItemProps) => {
  const currentPath = usePathname();
  const hasChildren = article.children && article.children.length > 0;
  const isChildActive = hasChildren && currentPath.includes(article.meta.slug);
  const [isOpen, setIsOpen] = useState(isChildActive);

  const isActive = (): boolean => {
    if (article.meta.type === 'child') return currentPath === `/articles/${article.meta.slug}`;
    else
      return (
        currentPath === `/articles/${article.meta.slug}` || currentPath.includes(article.meta.slug)
      );
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}>
      <div
        className='flex flex-col'
        key={article.meta.slug}>
        <div className='flex items-center group w-full'>
          <CollapsibleTrigger
            asChild
            onClick={() => hasChildren && setIsOpen(!isOpen)}>
            <div
              className={`flex items-center gap-2 w-full ${
                isActive()
                  ? 'text-primary font-bold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-primary/10'
              }`}>
              <Link
                href={`/articles/${article.meta.slug}`}
                className={`flex-1 py-1 px-2 text-sm transition-colors rounded-md `}>
                {article.meta.title}
              </Link>
              {hasChildren && (
                <motion.div animate={{ rotate: isOpen ? 90 : 0 }}>
                  <ChevronRight size={16} />
                </motion.div>
              )}
            </div>
          </CollapsibleTrigger>
        </div>

        <AnimatePresence initial={false}>
          {isOpen && hasChildren && (
            <CollapsibleContent
              forceMount
              asChild>
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className='overflow-hidden flex flex-col border-l-2 border-foreground/10 ml-4 mt-1'>
                {article.children?.map((child) => {
                  const isSubActive = currentPath === `/articles/${child.meta.slug}`;

                  return (
                    <Link
                      key={child.meta.slug}
                      href={`/articles/${child.meta.slug}`}
                      className={`py-1.5 px-6 text-sm transition-colors rounded-md ${
                        isSubActive
                          ? 'text-primary font-bold'
                          : 'text-muted-foreground hover:text-foreground hover:bg-primary/5'
                      }`}>
                      {child.meta.title}
                    </Link>
                  );
                })}
              </motion.div>
            </CollapsibleContent>
          )}
        </AnimatePresence>
      </div>
    </Collapsible>
  );
};

export default ArticleSidebarItem;
