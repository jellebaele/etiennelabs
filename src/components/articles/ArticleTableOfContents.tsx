'use client';

import { Heading } from '@/lib/markdown';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';

const dummyContent = ['Intro', 'What is it?'];

type ArticleTableOfContentsProps = {
  headings: Heading[];
};

const ArticleTableOfContents = ({ headings }: ArticleTableOfContentsProps) => {
  const [isOpen, setIsOpen] = useState(false);

  if (headings.length === 0) return null;

  return (
    <div className='bg-card py-3 px-5 mb-5'>
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <div className='flex items-center w-full justify-between py-2 border-b-2 cursor-pointer'>
            <p>Table of contents</p>
            {isOpen ? (
              <ChevronDown
                size={16}
                className='mr-3'
              />
            ) : (
              <ChevronRight
                size={16}
                className='mr-3'
              />
            )}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className='py-2'>
          {dummyContent.map((item) => (
            <div className='text-sm'>{item}</div>
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default ArticleTableOfContents;
