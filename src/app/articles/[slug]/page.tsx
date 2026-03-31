import Markdown from '@/components/Markdown';
import { getAllArticles, getArticleBySlug } from '@/lib/articles';
import Link from 'next/link';

export async function generateStaticParams() {
  const articles = getAllArticles();
  return articles.map((article) => ({ slug: article.slug }));
}

type ArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const ArticlePage = async ({ params }: ArticlePageProps) => {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  return (
    <article className='pb-20'>
      <section className='container py-4 md:py-8 mb-10'>
        <Link
          href='/articles'
          className='font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors inline-block mb-8'>
          ← Back to articles
        </Link>

        <div className='flex items-center justify-start gap-2'>
          {article.tags.map((tag, index) => (
            <span
              key={index}
              className='tag-pill mb-4 block w-fit'>
              {tag}
            </span>
          ))}
        </div>

        <h1 className='text-4xl md:text-6xl font-bold leading-[0.95] tracking-tight mt-4'>
          {article.title}
        </h1>

        <div className='flex items-center gap-4 mt-6'>
          <time className='font-mono text-xs uppercase tracking-wider text-muted-foreground'>
            {article.date}
          </time>
          <div className='w-2 h-2 bg-primary rounded-full' />
          <span className='font-mono text-xs uppercase tracking-wider text-muted-foreground'>
            5 min read
          </span>
        </div>
      </section>
      <div className='prose max-w-none'>
        <Markdown>{article.content}</Markdown>
      </div>
    </article>
  );
};

export default ArticlePage;
