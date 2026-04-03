export const siteConfig = {
  name: 'ETIENNELAB',
  title: 'Etiennelab — Ideas & Code',
  tagline: 'Notes on building and learning as a developer.',
  description: 'A personal blog about building software, learning, and turning ideas into reality.',
  url: 'blog.jellebaele.com',

  author: {
    name: 'Jelle Baele',
    email: 'jelle@etiennelab.dev',
    role: 'Developer & Designer',
  },

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
