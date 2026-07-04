'use client';

import { Article } from '@/lib/articles';
import { useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ViewMode } from './ArticleList';

type ArticleControlsProps = {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  activeTag: string;
  setActiveTag: (tag: string) => void;
  articles: Article[];
};

const ArticleControls = ({
  articles,
  viewMode,
  setViewMode,
  activeTag,
  setActiveTag,
}: ArticleControlsProps) => {
  const tags = useMemo(() => Array.from(new Set(articles.flatMap((a) => a.meta.tags))), [articles]);

  return (
    <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6 sm:mb-12'>
      <div className='flex items-center'>
        <button
          onClick={() => setViewMode('date')}
          className={`px-4 py-2 font-mono text-xs uppercase tracking-widest transition-colors border-l-2 border-t-2 border-b-2 border-foreground ${
            viewMode === 'date'
              ? 'bg-foreground text-background'
              : 'bg-background text-foreground hover:bg-muted'
          }`}>
          By Date
        </button>
        <button
          onClick={() => setViewMode('tag')}
          className={`px-4 py-2 font-mono text-xs uppercase tracking-widest transition-colors border-r-2 border-t-2 border-b-2 border-foreground ${
            viewMode === 'tag'
              ? 'bg-foreground text-background'
              : 'bg-background text-foreground hover:bg-muted'
          }`}>
          By Tag
        </button>
      </div>

      <Select
        value={activeTag}
        onValueChange={setActiveTag}>
        <SelectTrigger className='w-full sm:w-50 border-2 border-foreground font-mono text-xs uppercase tracking-widest'>
          <SelectValue placeholder='Filter by tag' />
        </SelectTrigger>
        <SelectContent
          className='border-2 border-foreground'
          position='popper'
          sideOffset={5}>
          <SelectItem
            value='all'
            className='font-mono text-xs uppercase tracking-widest'>
            All Tags
          </SelectItem>
          {tags.map((tag) => (
            <SelectItem
              key={tag}
              value={tag}
              className='font-mono text-xs uppercase tracking-widest'>
              {tag}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ArticleControls;
