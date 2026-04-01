import { ReactNode } from 'react';

type AboutLayout = {
  children: ReactNode;
};

const AboutLayout = ({ children }: AboutLayout) => {
  return (
    <div className='pb-10'>
      <main>{children}</main>
    </div>
  );
};

export default AboutLayout;
