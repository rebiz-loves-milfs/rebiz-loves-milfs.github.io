export const SITE = {
  title: 'Rebiz Loves Writing',
  description: 'Writing about things I love',
  author: 'Rebiz',
  url: 'https://example.com',         // ← change to your actual domain
  siteStartDate: '2025-01-01',        // ← your blog launch date
  ogImage: '/assets/home.webp',       // ← default OG share image
};

export const AUTHOR = {
  name: 'Rebiz',
  bio: 'I love writing, anime, and exploring the world one post at a time.',
  avatar: '/assets/avatar.webp',
  logo: '/assets/default-logo.webp',
  socials: {
    github: '',      // e.g. 'https://github.com/yourname'
    bilibili: '',    // e.g. 'https://space.bilibili.com/youruid'
    discord: '',     // e.g. 'https://discord.gg/yourserver'
    twitter: '',     // e.g. 'https://twitter.com/yourhandle'
  },
};

export const LASTFM = {
  user: 'reejit',
  key: '92acdd128fb70e10fd1352df9334c22e',
};

export const DISCORD_USER_ID = '1296550727652610189';

export const ANILIST_USER = 'notreejit';

export const THEME = {
  defaultHue: 30,
};

// Set enabled: false to hide the announcement widget entirely
export const ANNOUNCEMENT = {
  enabled: true,
  title: 'Announcement',
  text: 'Welcome to the blog! This is a sample announcement.',
  link: '',           // leave empty to hide the "Learn more" button
  linkLabel: 'Learn more →',
};

// Giscus comments — visit https://giscus.app to get your IDs
// Leave empty strings to show the setup guide instead of comments
export const GISCUS = {
  repo: '',          // e.g. 'username/my-blog'
  repoId: '',        // from giscus.app
  category: '',      // e.g. 'General' or 'Announcements'
  categoryId: '',    // from giscus.app
};

export const NAV_LINKS = [
  { path: '/',        label: 'Home',    icon: 'material-symbols:home' },
  { path: '/archive', label: 'Archive', icon: 'material-symbols:archive' },
  { path: '/anime',   label: 'Anime',   icon: 'material-symbols:movie' },
  { path: '/about',   label: 'About',   icon: 'material-symbols:info' },
];
