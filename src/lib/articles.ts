import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';

const ARTICLES_DIR = path.join(process.cwd(), 'content/articles');

export type ArticleMeta = {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
};

export function getAllArticles(): ArticleMeta[] {
  const files = fs.readdirSync(ARTICLES_DIR);

  return files
    .filter((f) => f.endsWith('.md'))
    .map((filename) => {
      const slug = filename.replace('.md', '');
      const raw = fs.readFileSync(path.join(ARTICLES_DIR, filename), 'utf-8');
      const { data } = matter(raw);

      return {
        slug,
        title: data.title,
        date: data.date,
        tags: Array.isArray(data.tags) ? data.tags : [],
        excerpt: data.excerpt ?? '',
      };
    })
    .sort((a, b) => (a.date > b.date ? -1 : 1));
}

export function getArticleBySlug(slug: string): ArticleMeta & { content: string } {
  const raw = fs.readFileSync(path.join(ARTICLES_DIR, `${slug}.md`), 'utf-8');
  const { data, content } = matter(raw);

  return {
    slug,
    title: data.title,
    date: data.date,
    tags: Array.isArray(data.tags) ? data.tags : [],
    excerpt: data.excerpt ?? '',
    content,
  };
}
