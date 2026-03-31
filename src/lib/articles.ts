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

export type Article = {
  meta: ArticleMeta;
  content: string;
  children?: Article[];
};

export type FolderConfig = {
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
      const slug = itemName.replace('.md', '');

      if (stats.isFile() && itemName.endsWith('.md')) {
        return getArticleBySlug(slug);
      }

      if (stats.isDirectory()) {
        return getFolderArticle(itemName, slug);
      }

      return null;
    })
    .filter((article): article is Article => article !== null);

  console.log(articles);

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

export function getFolderArticle(folderName: string, slug: string): Article {
  const folderPath = path.join(ARTICLES_DIR, folderName);
  const config = getConfig(folderName);

  const children = fs
    .readdirSync(folderPath)
    .filter((f) => f.endsWith('.md'))
    .map((fileName) => {
      const subSlug = fileName.replace('.md', '');
      const raw = fs.readFileSync(path.join(folderPath, fileName), 'utf-8');
      const { data, content } = matter(raw);

      return {
        meta: {
          slug: `${slug}/${subSlug}`,
          title: data.title,
          date: data.date || config.date,
          tags: data.tags || config.tags,
          excerpt: data.excerpt ?? '',
        },
        content,
      };
    });

  return {
    meta: {
      slug,
      title: config.title,
      date: config.date,
      tags: Array.isArray(config.tags) ? config.tags : [],
      excerpt: config.excerpt ?? '',
    },
    content: config.excerpt ?? '',
    children,
  };
}

function getConfig(folderName: string): FolderConfig {
  const configPath = path.join(ARTICLES_DIR, folderName, '_category_.json');
  console.log('CONFIG PATHHHH');
  console.log(configPath);

  if (!fs.existsSync(configPath))
    throw new Error(`No '_category_.json' file found for article folder ${folderName}.`);

  const rawConfig = fs.readFileSync(configPath, 'utf-8');
  const config = JSON.parse(rawConfig);

  return {
    title: config.title,
    date: config.date,
    tags: Array.isArray(config.tags) ? config.tags : [],
    excerpt: config.excerpt ?? '',
  };
}
