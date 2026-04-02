'use client';

import { Heading } from '@/lib/markdown';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';

type ArticleTableOfContentsProps = {
  headings: Heading[];
};

const ArticleTableOfContents = ({ headings }: ArticleTableOfContentsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  if (headings.length === 0) return null;

  return (
    <div className='bg-card py-3 px-3 mb-5 border-2 border-foreground retro-shadow-sm'>
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}>
        <CollapsibleTrigger className='w-full text-left cursor-pointer group'>
          <div className='flex items-center justify-between py-2 mx-4'>
            <p className='font-mono uppercase text-sm font-bold tracking-widest text-primary'>
              Table of contents
            </p>
            <motion.div animate={{ rotate: isOpen ? 90 : 0 }}>
              <ChevronRight size={18} />
            </motion.div>
          </div>
        </CollapsibleTrigger>

        <AnimatePresence>
          {isOpen && (
            <CollapsibleContent
              forceMount
              asChild>
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className='overflow-hidden'>
                <div className='border-t-2 mx-4 pb-2' />
                <div className='flex flex-col gap-1'>
                  {headings.map((heading, index) => {
                    const indent = (heading.level - 1) * 16;

                    return (
                      <div
                        key={index}
                        style={{ paddingLeft: `${indent}px` }}
                        className='group flex items-center gap-2'>
                        <span className='text-primary opacity-0 group-hover:opacity-100 transition-opacity font-mono shrink-0'>
                          {'>'}
                        </span>
                        <a
                          href={`#${heading.id}`}
                          className={`text-sm font-mono transition-colors ${
                            heading.level === 1
                              ? 'font-bold text-foreground'
                              : 'text-muted-foreground hover:text-primary'
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            const element = document.getElementById(heading.id);
                            if (element) {
                              const offset = 80;
                              const bodyRect = document.body.getBoundingClientRect().top;
                              const elementRect = element.getBoundingClientRect().top;
                              const elementPosition = elementRect - bodyRect;
                              const offsetPosition = elementPosition - offset;

                              window.scrollTo({
                                top: offsetPosition,
                                behavior: 'smooth',
                              });
                            }
                          }}>
                          {heading.text}
                        </a>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </CollapsibleContent>
          )}
        </AnimatePresence>
      </Collapsible>
    </div>
  );
};

export default ArticleTableOfContents;
