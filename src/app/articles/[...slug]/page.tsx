import ArticleCard from '@/components/articles/ArticleCard';
import ArticleHeader from '@/components/articles/ArticleHeader';
import Markdown from '@/components/Markdown';
import { getAllArticles, getArticleBySlug } from '@/lib/articles';

export async function generateStaticParams() {
  const articles = getAllArticles();
  const params: { slug: string[] }[] = [];

  for (const article of articles) {
    params.push({ slug: article.meta.slug.split('/') });

    if (article.children) {
      for (const child of article.children) {
        params.push({ slug: child.meta.slug.split('/') });
      }
    }
  }

  return params;
}

type ArticlePageProps = {
  params: Promise<{
    slug: string[];
  }>;
};

const ArticlePage = async ({ params }: ArticlePageProps) => {
  const slug = (await params).slug.join('/');
  const article = getArticleBySlug(slug);

  return (
    <article className='pb-20'>
      <ArticleHeader article={article} />

      {article.children && article.children.length > 0 ? (
        <>
          <h3 className='text-xl font-bold mb-4'>Articles in this series:</h3>
          <div className='grid grid-cols-2 gap-3'>
            {article.children.map((child) => (
              <ArticleCard
                article={child}
                showTags={false}
                showDate={false}
              />
            ))}
          </div>
        </>
      ) : (
        <div className='prose max-w-none'>
          <Markdown>{article.content}</Markdown>
        </div>
      )}
    </article>
  );
};

export default ArticlePage;
