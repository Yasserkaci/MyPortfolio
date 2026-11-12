export const DEFAULT_SETTINGS = {
  identity: {
    name: 'Yaser Kaci',
    role: 'Full-stack web developer',
    shortBio: 'I design and build web products end to end: database, API, interface, deploy.',
    location: '',
    email: 'hello@example.com',
    availability: 'Open to full-time roles',
    showAvailability: true,
    resumeUrl: '',
    avatarUrl: '',
  },
  nav: {
    logoText: 'YK',
    links: [
      { label: 'Work', href: '#work' },
      { label: 'About', href: '#about' },
      { label: 'Experience', href: '#experience' },
      { label: 'Contact', href: '#contact' },
    ],
    ctaLabel: 'Contact',
    ctaHref: '#contact',
  },
  hero: {
    headline: 'I build web products that feel as good as they work.',
    emphasis: 'feel',
    subtext: 'Full-stack developer shipping fast, well-crafted interfaces on top of solid backends.',
    primaryCta: { label: 'View work', href: '#work' },
    secondaryCta: { label: '', href: '#contact' },
    imageUrl: 'https://picsum.photos/seed/yaser-hero-studio/1200/1500',
    imageAlt: 'Workspace',
    showImage: false,
  },
  marquee: {
    enabled: true,
    items: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Supabase', 'Next.js', 'GraphQL', 'Docker', 'Motion', 'Tailwind'],
  },
  work: {
    heading: 'Selected work',
    intro: 'A few projects I am proud of. Each one shipped to real users.',
  },
  about: {
    heading: 'About',
    paragraphs: [
      'I am a full-stack developer who cares about the whole product, not just the part I am assigned to. I like clean data models, fast interfaces and the moment where the two meet.',
      'Most of my work is React and TypeScript on the front, Node and PostgreSQL on the back, with Supabase or a custom API in between.',
    ],
    imageUrl: 'https://picsum.photos/seed/yaser-about-portrait/1000/1200',
    stats: [
      { value: '6+', label: 'Products shipped' },
      { value: '3', label: 'Years building for the web' },
      { value: '100%', label: 'Full stack, every time' },
    ],
    skillsHeading: 'Stack',
  },
  experience: {
    heading: 'Experience',
    intro: '',
  },
  contact: {
    heading: 'Have a role in mind?',
    text: 'I am currently looking for a full-time position. Send a message and I will reply within a day.',
    showForm: true,
    buttonLabel: 'Send message',
    successText: 'Thanks, your message is in. I will get back to you soon.',
  },
  socials: [
    { label: 'GitHub', url: 'https://github.com' },
    { label: 'LinkedIn', url: 'https://linkedin.com' },
    { label: 'X', url: '' },
  ],
  footer: {
    text: 'Designed and built by Yaser Kaci.',
    showYear: true,
  },
  theme: {
    accent: '#e4b84a',
    bg: '#0b0b0d',
    surface: '#15151a',
    fg: '#f2efe6',
    muted: '#8f8c84',
    radius: 'soft',
    font: 'geist',
    grain: true,
    smoothScroll: true,
    preloader: true,
  },
  sections: [
    { id: 'hero', label: 'Hero', enabled: true },
    { id: 'marquee', label: 'Stack marquee', enabled: true },
    { id: 'work', label: 'Selected work', enabled: true },
    { id: 'about', label: 'About and skills', enabled: true },
    { id: 'experience', label: 'Experience', enabled: true },
    { id: 'contact', label: 'Contact', enabled: true },
  ],
  seo: {
    title: 'Yaser Kaci, full-stack web developer',
    description: 'Portfolio of Yaser Kaci, a full-stack web developer building fast, well-crafted web products.',
    ogImage: '',
  },
}

export const FONTS = {
  geist: { label: 'Geist (default)', stack: "'Geist Variable', system-ui, sans-serif" },
  system: { label: 'System sans', stack: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif' },
  mono: { label: 'Geist Mono everywhere', stack: "'Geist Mono Variable', ui-monospace, monospace" },
}

export const RADII = {
  sharp: { label: 'Sharp', card: '0px', button: '0px', input: '0px', image: '0px' },
  soft: { label: 'Soft (default)', card: '18px', button: '999px', input: '10px', image: '14px' },
  round: { label: 'Round', card: '28px', button: '999px', input: '14px', image: '24px' },
}
