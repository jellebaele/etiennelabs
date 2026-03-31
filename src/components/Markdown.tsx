import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// import { dracula } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import remarkGfm from 'remark-gfm';

type MarkdownProps = {
  children: string;
};

const Markdown = ({ children }: MarkdownProps) => {
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
                showLineNumbers
                wrapLongLines
                PreTag='div'
                style={oneLight as any}>
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            );
          }
          return (
            <code
              className={className}
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
