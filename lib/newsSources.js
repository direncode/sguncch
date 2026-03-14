/**
 * UNC News Sources Registry
 *
 * Comprehensive UNC-Chapel Hill news and events feeds.
 * Covers official news, student media, athletics, research, arts, and campus life.
 */

export const UNC_NEWS_SOURCES = [
  // ── Official University News ──
  {
    id: 'unc-news',
    name: 'UNC News',
    domain: 'news.unc.edu',
    description: 'Official UNC-Chapel Hill news and announcements',
    category: 'official',
    feedUrl: 'https://news.unc.edu/feed/',
  },
  {
    id: 'the-well',
    name: 'The Well',
    domain: 'thewell.unc.edu',
    description: 'UNC storytelling — features, profiles, and campus culture',
    category: 'official',
    feedUrl: 'https://thewell.unc.edu/feed/',
  },
  {
    id: 'unc-gazette',
    name: 'University Gazette',
    domain: 'gazette.unc.edu',
    description: 'UNC faculty and staff news publication',
    category: 'official',
    feedUrl: 'https://gazette.unc.edu/feed/',
  },
  {
    id: 'unc-global',
    name: 'UNC Global',
    domain: 'global.unc.edu',
    description: 'International programs, study abroad, and global engagement',
    category: 'official',
    feedUrl: 'https://global.unc.edu/feed/',
  },

  // ── Student Media ──
  {
    id: 'dth',
    name: 'The Daily Tar Heel',
    domain: 'dailytarheel.com',
    description: 'Independent student newspaper at UNC-Chapel Hill',
    category: 'student-news',
    feedUrl: 'https://www.dailytarheel.com/feed',
  },

  // ── Athletics ──
  {
    id: 'goheels',
    name: 'GoHeels',
    domain: 'goheels.com',
    description: 'Official UNC Tar Heels athletics news and scores',
    category: 'athletics',
    feedUrl: 'https://goheels.com/rss.aspx/news',
  },

  // ── Research & Innovation ──
  {
    id: 'unc-research',
    name: 'UNC Research',
    domain: 'research.unc.edu',
    description: 'Research breakthroughs, grants, and innovation at UNC',
    category: 'research',
    feedUrl: 'https://research.unc.edu/feed/',
  },
  {
    id: 'endeavors',
    name: 'Endeavors',
    domain: 'endeavors.unc.edu',
    description: 'UNC research magazine — in-depth stories on discoveries',
    category: 'research',
    feedUrl: 'https://endeavors.unc.edu/feed/',
  },

  // ── Health & Medicine ──
  {
    id: 'unc-health',
    name: 'UNC Health News',
    domain: 'news.unchealthcare.org',
    description: 'UNC Health and School of Medicine news',
    category: 'health',
    feedUrl: 'https://news.unchealthcare.org/feed/',
  },
  {
    id: 'sph-news',
    name: 'Gillings School of Public Health',
    domain: 'sph.unc.edu',
    description: 'Public health research and community impact',
    category: 'health',
    feedUrl: 'https://sph.unc.edu/feed/',
  },

  // ── Arts & Culture ──
  {
    id: 'cpa',
    name: 'Carolina Performing Arts',
    domain: 'carolinaperformingarts.org',
    description: 'Performances, events, and arts programming at UNC',
    category: 'arts',
    feedUrl: 'https://www.carolinaperformingarts.org/feed/',
  },
  {
    id: 'ackland',
    name: 'Ackland Art Museum',
    domain: 'ackland.org',
    description: 'Exhibitions, collections, and art events at UNC',
    category: 'arts',
    feedUrl: 'https://ackland.org/feed/',
  },

  // ── Campus Life & Student Affairs ──
  {
    id: 'unc-student-affairs',
    name: 'Student Affairs',
    domain: 'studentaffairs.unc.edu',
    description: 'Student life, housing, dining, and campus programs',
    category: 'campus',
    feedUrl: 'https://studentaffairs.unc.edu/feed/',
  },
  {
    id: 'unc-libraries',
    name: 'UNC Libraries',
    domain: 'library.unc.edu',
    description: 'Library news, events, and digital collections',
    category: 'campus',
    feedUrl: 'https://library.unc.edu/feed/',
  },

  // ── Governance (no feed) ──
  {
    id: 'unc-sg',
    name: 'UNC Student Government',
    domain: 'studentgovernment.unc.edu',
    description: 'Official student government website and documents',
    category: 'governance',
    feedUrl: null,
  },
  {
    id: 'unc-policies',
    name: 'UNC Policies',
    domain: 'policies.unc.edu',
    description: 'Official university policies and procedures',
    category: 'policies',
    feedUrl: null,
  },
]

// Only sources with RSS feeds
export const UNC_FEED_SOURCES = UNC_NEWS_SOURCES.filter(s => s.feedUrl)

// Domains Grok web search should prioritize
export const UNC_SEARCH_DOMAINS = UNC_NEWS_SOURCES.map(s => s.domain)

// Build a search context string listing available news sources
export function getNewsSourcesContext() {
  return UNC_NEWS_SOURCES.map(s => `- ${s.name} (${s.domain}): ${s.description}`).join('\n')
}

// Category display config
export const NEWS_CATEGORIES = {
  'student-news': { label: 'Student', color: 'bg-blue-500' },
  'official':     { label: 'Official', color: 'bg-[#13294B]' },
  'governance':   { label: 'SG', color: 'bg-[#4B9CD3]' },
  'athletics':    { label: 'Athletics', color: 'bg-[#7BAFD4]' },
  'research':     { label: 'Research', color: 'bg-emerald-600' },
  'health':       { label: 'Health', color: 'bg-rose-600' },
  'arts':         { label: 'Arts', color: 'bg-purple-600' },
  'campus':       { label: 'Campus', color: 'bg-amber-600' },
  'policies':     { label: 'Policy', color: 'bg-gray-500' },
}
