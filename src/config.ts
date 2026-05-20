export const SITE = {
  title: 'Rebiz Loves Writing',
  description: 'A personal blog where Rebiz writes about life, anime, frontend development, and everything in between — come along for the journey.',
  author: 'Rebiz',
  url: 'https://rebiz-loves-milfs.github.io',
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
  user: 'notrebiz',
  key: import.meta.env.PUBLIC_LASTFM_API_KEY ?? '',
};

export const DISCORD_USER_ID = '1296550727652610189';

export const ANILIST_USER = 'rebiz';

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

export const YOUTUBE = {
  playlistId: 'PLPWMX0C4Km7oIE1dxqTXvFYI1qir7TTY8',
};

export const SIMKL = {
  user: '8389247',
  clientId: '3b8da8bc2ff9ffc4ca420fdd1258b9375e82cfb070e72dd8c4340c65f1a05188',
  // Run scripts/simkl-auth.mjs once to populate SIMKL_ACCESS_TOKEN in .env
  accessToken: import.meta.env.SIMKL_ACCESS_TOKEN ?? '',
};

export const MUSIC_GENRES = [
  { label: 'J-Pop / J-Rock',  hue: 340, icon: 'material-symbols:favorite-outline' },
  { label: 'Anime OST',        hue: 60,  icon: 'material-symbols:animation' },
  { label: 'Lo-fi / Chill',   hue: 200, icon: 'material-symbols:coffee-outline' },
  { label: 'Jazz',             hue: 30,  icon: 'material-symbols:piano-outline' },
  { label: 'City Pop',         hue: 160, icon: 'material-symbols:radio-outline' },
];

export const MUSIC_QUOTES = [
  { text: 'Music gives a soul to the universe, wings to the mind, flight to the imagination.', author: 'Plato' },
  { text: 'Without music, life would be a mistake.', author: 'Friedrich Nietzsche' },
  { text: 'Music is the shorthand of emotion.', author: 'Leo Tolstoy' },
  { text: 'One good thing about music, when it hits you, you feel no pain.', author: 'Bob Marley' },
  { text: 'Music is the wine that fills the cup of silence.', author: 'Robert Fripp' },
  { text: 'Music can change the world because it can change people.', author: 'Bono' },
  { text: 'Where words fail, music speaks.', author: 'Hans Christian Andersen' },
  { text: 'Music is the universal language of mankind.', author: 'Henry Wadsworth Longfellow' },
  { text: 'After silence, that which comes nearest to expressing the inexpressible is music.', author: 'Aldous Huxley' },
  { text: 'Music is a moral law. It gives soul to the universe, wings to the mind, flight to the imagination.', author: 'Plato' },
  { text: 'The music is not in the notes, but in the silence between.', author: 'Wolfgang Amadeus Mozart' },
  { text: 'Music is the mediator between the spiritual and the sensual life.', author: 'Ludwig van Beethoven' },
  { text: 'Music is the art of thinking with sounds.', author: 'Jules Combarieu' },
  { text: 'To stop the flow of music would be like the stopping of time itself, incredible and inconceivable.', author: 'Aaron Copland' },
];

export const NAV_LINKS = [
  { path: '/',           label: 'Home',      icon: 'material-symbols:home' },
  { path: '/archive',    label: 'Archive',   icon: 'material-symbols:archive' },
  {
    label: 'Media',
    icon: 'material-symbols:play-circle-outline',
    children: [
      { path: '/anime',  label: 'Anime',  icon: 'material-symbols:tv-gen' },
      { path: '/movies', label: 'Movies', icon: 'material-symbols:movie' },
      { path: '/music',  label: 'Music',  icon: 'material-symbols:music-note' },
    ],
  },
  { path: '/guestbook',  label: 'Guestbook', icon: 'material-symbols:edit-note' },
  { path: '/about',      label: 'About',     icon: 'material-symbols:info' },
];
