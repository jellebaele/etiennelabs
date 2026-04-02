import { ReactNode } from 'react';

type ContactLayoutProps = {
  children: ReactNode;
};

const ContactLayout = ({ children }: ContactLayoutProps) => {
  return (
    <div className='pb-10 pt-8'>
      <main>{children}</main>
    </div>
  );
};

export default ContactLayout;
