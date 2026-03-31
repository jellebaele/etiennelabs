import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';

const ARTICLES_DIR = path.join(process.cwd(), 'content/articles');

export type Article = {
  meta: ArticleMeta;
  content: string;
};

export type ArticleMeta = {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
};

export function getAllArticles(): Article[] {
  const items = fs.readdirSync(ARTICLES_DIR);

  const articles = items
    .map((itemName) => {
      const fullPath = path.join(ARTICLES_DIR, itemName);
      const stats = fs.statSync(fullPath);

      if (stats.isFile() && itemName.endsWith('.md')) {
        const slug = itemName.replace('.md', '');
        return getArticleBySlug(slug);
      } else {
        return null;
      }
    })
    .filter((article): article is Article => article !== null);

  return articles.sort((a, b) => (a.meta.date > b.meta.date ? -1 : 1));
}

export function getArticleBySlug(slug: string): Article {
  const raw = fs.readFileSync(path.join(ARTICLES_DIR, `${slug}.md`), 'utf-8');
  const { data, content } = matter(raw);

  return {
    meta: {
      slug,
      title: data.title,
      date: data.date,
      tags: Array.isArray(data.tags) ? data.tags : [],
      excerpt: data.excerpt ?? '',
    },

    content,
  };
}
