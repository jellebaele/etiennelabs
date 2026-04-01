'use client';

import { Article } from '@/lib/articles';
import { useMemo, useState } from 'react';
import ArticleCard from './ArticleCard';
import ArticleControls from './ArticleControls';
import ArticleCountDivider from './ArticleCountDivider';

type ArticleListProps = {
  articles: Article[];
};

export type ViewMode = 'date' | 'tag';

const ArticleList = ({ articles }: ArticleListProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('date');
  const [activeTag, setActiveTag] = useState<string>('all');

  const filteredArticles = useMemo(() => {
    if (activeTag !== 'all') return articles.filter((a) => a.meta.tags.includes(activeTag));
    return articles;
  }, [activeTag]);

  const groupedArticlesByTag = useMemo(() => {
    const groups: Record<string, Article[]> = {};

    filteredArticles.forEach((article) => {
      article.meta.tags.forEach((tag) => {
        if (activeTag !== 'all' && tag !== activeTag) return;

        if (!groups[tag]) groups[tag] = [];
        groups[tag].push(article);
      });
    });

    return groups;
  }, [filteredArticles]);

  return (
    <div className='flex flex-col gap-6'>
      <ArticleControls
        articles={articles}
        viewMode={viewMode}
        setViewMode={setViewMode}
        activeTag={activeTag}
        setActiveTag={setActiveTag}
      />

      {viewMode === 'date' ? (
        <>
          <ArticleCountDivider count={articles.length} />
          {filteredArticles.map((article, index) => (
            <ArticleCard
              key={index}
              article={article}
            />
          ))}
        </>
      ) : (
        Object.entries(groupedArticlesByTag).map(([tag, groupedArticles]) => {
          return (
            <div key={tag}>
              <ArticleCountDivider
                count={groupedArticles.length}
                tag={tag}
              />
              {groupedArticles.map((article, index) => (
                <ArticleCard
                  key={index}
                  article={article}
                />
              ))}
            </div>
          );
        })
      )}
    </div>
  );
};

export default ArticleList;
