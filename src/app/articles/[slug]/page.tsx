import { getAllArticles, getArticleBySlug } from '@/lib/articles';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import rehypePrism from 'rehype-prism-plus';
import rehypeRaw from 'rehype-raw';

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
    <article>
      <section className='container py-4 md:py-8 border-b-2 border-foreground mb-10'>
        <Link
          href='/articles'
          className='font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors inline-block mb-8'>
          ← Back to articles
        </Link>

        <span className='tag-pill mb-4 block w-fit'>{article.tag}</span>
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
        <ReactMarkdown rehypePlugins={[rehypeRaw, rehypePrism]}>{article.content}</ReactMarkdown>
      </div>
    </article>
  );
};

export default ArticlePage;
