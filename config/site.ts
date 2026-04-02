export const siteConfig = {
  // Site identity
  name: 'ETIENNELAB',
  title: 'EtienneLab - Design & Code',
  tagline: ['Thoughts on design, code,', 'and everything in between.'],
  description: 'A blog exploring design systems, web development, and creative coding',
  url: 'blog.jellebaele.com',

  // Author
  author: {
    name: 'Jelle Baele',
    email: 'jelle@etiennelab.dev',
    role: 'Developer & Designer',
  },

  // Navigation
  navigation: [
    { label: 'Home', href: '/' },
    { label: 'Articles', href: '/articles' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ],

  footer: {
    copyright: `© Jelle Baele ${new Date().getFullYear()} — All rights reserved`,
    links: [
      { label: 'Personal AI Portfolio Assistant', url: 'https://jellebaele.com' },
      { label: 'Github', url: 'https://github.com/jellebaele' },
      { label: 'LinkedIn', url: 'https://linkedin.com/in/jellebaele' },
    ],
  },
} as const;
