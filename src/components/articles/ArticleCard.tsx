'use client';

import { Article } from '@/lib/articles';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import ArticleCardTags from './ArticleCardTags';

const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};

const MotionLink = motion.create(Link);

type ArticleCardProps = {
  article: Article;
  showTags?: boolean;
  showDate?: boolean;
  activeTag?: string;
};

const ArticleCard = ({
  article,
  showTags = true,
  showDate = true,
  activeTag = 'all',
}: ArticleCardProps) => {
  return (
    <MotionLink
      href={`/articles/${article.meta.slug}`}
      variants={cardVariants}
      className='group block @container retro-border retro-shadow p-6 hover:-translate-y-1 transition-colors duration-300 bg-card'>
      <div className='flex items-center justify-between mb-3'>
        <div className='flex items-center justify-start gap-2 min-w-0'>
          {showTags && (
            <ArticleCardTags
              tags={article.meta.tags}
              activeTag={activeTag}
            />
          )}
        </div>
        <span className='text-xs font-mono text-muted-foreground shrink-0'>
          {showDate && article.meta.date}
        </span>
      </div>
      <h2 className='text-xl font-bold mb-2 group-hover:text-primary transition-colors'>
        {article.meta.title}
      </h2>
      <p className='text-muted-foreground text-sm'>{article.meta.excerpt}</p>
    </MotionLink>
  );
};

export default ArticleCard;
