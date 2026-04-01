import { ReactNode } from 'react';

type AboutLayout = {
  children: ReactNode;
};

const AboutLayout = ({ children }: AboutLayout) => {
  return (
    <div>
      <main>{children}</main>
    </div>
  );
};

export default AboutLayout;
