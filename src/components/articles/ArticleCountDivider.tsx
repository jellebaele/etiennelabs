type ArticleCountDividerProps = {
  count: number;
};

const ArticleCountDivider = ({ count }: ArticleCountDividerProps) => {
  return (
    <div className='flex items-center gap-3 mb-6'>
      <div className='h-px flex-1 bg-border' />
      <span className='font-mono text-xs text-muted-foreground'>
        {count} post{count !== 1 && 's'}
      </span>
    </div>
  );
};

export default ArticleCountDivider;
