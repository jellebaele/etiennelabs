import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';
import readingTime from 'reading-time';

const ARTICLES_DIR = path.join(process.cwd(), 'content/articles');

export type ArticleType = 'parent' | 'child';

export type ArticleMeta = {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
  readingTimeMs: number;
  position?: number;
  type: ArticleType;
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

  return articles.sort((a, b) => (a.meta.date > b.meta.date ? -1 : 1));
}

export function getArticleBySlug(slug: string): Article {
  const filePath = path.join(ARTICLES_DIR, `${slug}.md`);
  const folderPath = path.join(ARTICLES_DIR, slug);

  if (fs.existsSync(filePath)) {
    const raw = fs.readFileSync(path.join(ARTICLES_DIR, `${slug}.md`), 'utf-8');
    const { data, content } = matter(raw);

    return {
      meta: {
        slug,
        title: data.title,
        date: data.date,
        tags: Array.isArray(data.tags) ? data.tags : [],
        excerpt: data.excerpt ?? '',
        readingTimeMs: readingTime(content).time,
        type: slug.includes('/') ? 'child' : 'parent',
      },
      content,
    };
  }

  if (fs.existsSync(folderPath) && fs.statSync(folderPath).isDirectory()) {
    return getFolderArticle(slug, slug);
  }

  throw new Error(`Article not found: ${slug}`);
}

export function getFolderArticle(folderName: string, slug: string): Article {
  const folderPath = path.join(ARTICLES_DIR, folderName);
  const config = getConfig(folderName);

  const children: Article[] = fs
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
          position: data.position ?? 999,
          readingTimeMs: readingTime(content).time,
          type: 'child' as const,
        },
        content,
      };
    })
    .sort((a, b) => a.meta.position - b.meta.position);

  const totalReadingTime = children.reduce((total, child) => {
    return total + child.meta.readingTimeMs;
  }, 0);

  return {
    meta: {
      slug,
      title: config.title,
      date: config.date,
      tags: Array.isArray(config.tags) ? config.tags : [],
      excerpt: config.excerpt ?? '',
      readingTimeMs: totalReadingTime,
      type: 'parent',
    },
    content: config.excerpt ?? '',
    children,
  };
}

export function getAdjacentArticles(currentSlug: string, type: ArticleType) {
  const allArticles = getAllArticles();
  let flatArticles: Article[] = [];

  if (type === 'child') {
    console.log('flattening');

    allArticles.forEach((article) => {
      flatArticles.push(article);
      if (article.children) flatArticles.push(...article.children);
    });
  } else {
    flatArticles = allArticles;
  }

  flatArticles.sort((a, b) => {
    if (a.meta.type === 'child' && b.meta.type === 'child')
      return a.meta.position! - b.meta.position!;
    return a.meta.date > b.meta.date ? -1 : 1;
  });

  const currentIndex = flatArticles.findIndex((article) => article.meta.slug === currentSlug);

  const previous =
    (currentIndex === 1 && type !== 'child') || currentIndex > 1
      ? flatArticles[currentIndex - 1]
      : null;

  const next = currentIndex < flatArticles.length - 1 ? flatArticles[currentIndex + 1] : null;

  return {
    previous,
    next,
  };
}

function getConfig(folderName: string): FolderConfig {
  const configPath = path.join(ARTICLES_DIR, folderName, '_category_.json');

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
