type ArticleCountDividerProps = {
  count: number;
  tag?: string;
};

const ArticleCountDivider = ({ count, tag = undefined }: ArticleCountDividerProps) => {
  return (
    <div className='flex items-center gap-3 mb-6 min-h-7'>
      {tag && (
        <span className='tag-pill bg-primary text-primary-foreground border-primary'>{tag}</span>
      )}
      <div className='h-px flex-1 bg-border' />
      <span className='font-mono text-xs text-muted-foreground'>
        {count} post{count !== 1 && 's'}
      </span>
    </div>
  );
};

export default ArticleCountDivider;
