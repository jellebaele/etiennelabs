import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';

type MarkdownProps = {
  children: string;
  showLineNumers?: boolean;
};

const Markdown = ({ children, showLineNumers = false }: MarkdownProps) => {
  return (
    <div className='prose max-w-none'>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeRaw,
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            {
              behavior: 'append',
              properties: {
                className: ['subtle-anchor'],
                ariaLabel: 'Link to section',
              },
              content: {
                type: 'element',
                tagName: 'span',
                properties: { className: ['icon-link'] },
                children: [{ type: 'text', value: '#' }], // Or use a Lucide icon string
              },
            },
          ],
        ]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            if (match) {
              return (
                <SyntaxHighlighter
                  language={match[1]}
                  showLineNumbers={showLineNumers}
                  wrapLongLines
                  PreTag='div'
                  style={oneLight as any}>
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              );
            }
            return (
              <code
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.80em',
                  backgroundColor: 'hsl(var(--muted))',
                  padding: '0.2em 0.4em',
                  borderRadius: '0.25rem',
                  color: 'hsl(var(--primary))',
                }}
                {...props}>
                {children}
              </code>
            );
          },

          details({ children, ...props }) {
            return (
              <details
                {...props}
                className='border border-slate-200 rounded-lg p-4 my-4 bg-primary/5 group'>
                {children}
              </details>
            );
          },

          summary({ children, ...props }) {
            return (
              <summary
                {...props}
                className='cursor-pointer font-bold text-primary list-none flex items-center gap-2 outline-none'>
                <span className='transition-transform group-open:rotate-90'>▶</span>
                {children}
              </summary>
            );
          },
        }}>
        {children}
      </ReactMarkdown>
    </div>
  );
};

export default Markdown;
