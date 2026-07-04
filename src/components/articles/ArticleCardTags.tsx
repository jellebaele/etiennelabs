type ArticleCardTagsProps = {
  tags: string[];
  activeTag?: string;
};

const ArticleCardTags = ({ tags, activeTag = 'all' }: ArticleCardTagsProps) => {
  if (tags.length === 0) return null;

  const primaryTag = activeTag !== 'all' && tags.includes(activeTag) ? activeTag : tags[0];
  const secondaryTag = tags.find((tag) => tag !== primaryTag);
  const twoTags = secondaryTag ? [primaryTag, secondaryTag] : [primaryTag];
  const remainingAfterOne = tags.length - 1;
  const remainingAfterTwo = tags.length - twoTags.length;

  return (
    <>
      <div className='flex @md:hidden items-center gap-2 min-w-0'>
        <span className='tag-pill truncate'>{primaryTag}</span>
        {remainingAfterOne > 0 && (
          <span className='text-xs font-mono text-muted-foreground shrink-0'>
            +{remainingAfterOne}
          </span>
        )}
      </div>
      <div className='hidden @md:flex @[40rem]:hidden items-center gap-2 min-w-0'>
        {twoTags.map((tag, index) => (
          <span
            key={index}
            className='tag-pill truncate'>
            {tag}
          </span>
        ))}
        {remainingAfterTwo > 0 && (
          <span className='text-xs font-mono text-muted-foreground shrink-0'>
            +{remainingAfterTwo}
          </span>
        )}
      </div>
      <div className='hidden @[40rem]:flex items-center gap-2'>
        {tags.map((tag, index) => (
          <span
            key={index}
            className='tag-pill'>
            {tag}
          </span>
        ))}
      </div>
    </>
  );
};

export default ArticleCardTags;
