'use client';

import { Article } from '@/lib/articles';
import { motion } from 'framer-motion';
import Link from 'next/link';
import ArticleCard from './ArticleCard';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

type LatestArticlesProps = {
  articles: Article[];
};

const LatestArticles = ({ articles }: LatestArticlesProps) => {
  return (
    <section
      className='container py-16 md:py-24'
      id='articles'>
      <div className='flex flex-col sm:items-center sm:flex-row justify-between mb-12'>
        <div className='flex items-center gap-3'>
          <div className='w-3 h-3 bg-primary' />
          <h2 className='text-3xl font-bold'>Latest Articles</h2>
        </div>
        <Link
          href='/articles'
          className='font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors mt-3 sm:mt-0'>
          View all →
        </Link>
      </div>
      <motion.div
        className='grid grid-cols-1 sm:grid-cols-3 gap-3'
        variants={containerVariants}
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, margin: '-100px' }}>
        {articles.slice(0, 3).map((article, index) => {
          return (
            <ArticleCard
              key={index}
              article={article}
              showTags={false}
              showDate={false}
            />
          );
        })}
      </motion.div>
    </section>
  );
};

export default LatestArticles;
