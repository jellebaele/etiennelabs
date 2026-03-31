import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import remarkGfm from 'remark-gfm';

type MarkdownProps = {
  children: string;
  showLineNumers?: boolean;
};

const Markdown = ({ children, showLineNumers = false }: MarkdownProps) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
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
      }}>
      {children}
    </ReactMarkdown>
  );
};

export default Markdown;
