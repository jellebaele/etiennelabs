import Markdown from '@/components/Markdown';
import { getContentByName } from '@/lib/markdown';

const AboutPage = () => {
  const aboutMe = getContentByName('about');

  return (
    <>
      <div className='flex items-center gap-3 mb-4'>
        <div className='w-3 h-3 bg-primary' />
        <h1 className='text-3xl font-bold'>About</h1>
      </div>

      <Markdown>{aboutMe}</Markdown>
    </>
  );
};

export default AboutPage;
