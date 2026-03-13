/**
 * UNC News Sources Registry
 *
 * Defines the external news sources Grok can search for UNC-related context.
 * These are used both for relevance checking, search domain filters, and live news feeds.
 */

export const UNC_NEWS_SOURCES = [
  {
    id: 'dth',
    name: 'The Daily Tar Heel',
    domain: 'dailytarheel.com',
    description: 'Independent student newspaper at UNC-Chapel Hill',
    category: 'student-news',
    feedUrl: 'https://www.dailytarheel.com/feed',
  },
  {
    id: 'unc-news',
    name: 'UNC News',
    domain: 'news.unc.edu',
    description: 'Official UNC-Chapel Hill news and announcements',
    category: 'official',
    feedUrl: 'https://news.unc.edu/feed/',
  },
  {
    id: 'unc-sg',
    name: 'UNC Student Government',
    domain: 'studentgovernment.unc.edu',
    description: 'Official student government website and documents',
    category: 'governance',
    feedUrl: null, // No RSS feed available
  },
  {
    id: 'unc-policies',
    name: 'UNC Policies',
    domain: 'policies.unc.edu',
    description: 'Official university policies and procedures',
    category: 'policies',
    feedUrl: null, // Static site, no feed
  },
  {
    id: 'chapelboro',
    name: 'Chapelboro',
    domain: 'chapelboro.com',
    description: 'Local Chapel Hill and Carrboro news covering UNC',
    category: 'local-news',
    feedUrl: 'https://chapelboro.com/feed',
  },
  {
    id: 'abc11',
    name: 'ABC11 (WTVD)',
    domain: 'abc11.com',
    description: 'Triangle-area TV news covering UNC events',
    category: 'local-news',
    feedUrl: 'https://abc11.com/feed/',
  },
  {
    id: 'newsobserver',
    name: 'The News & Observer',
    domain: 'newsobserver.com',
    description: 'Raleigh newspaper covering NC higher education',
    category: 'regional-news',
    feedUrl: 'https://www.newsobserver.com/news/local/education/rss',
  },
  {
    id: 'unc-gazette',
    name: 'University Gazette',
    domain: 'gazette.unc.edu',
    description: 'UNC faculty and staff news publication',
    category: 'official',
    feedUrl: 'https://gazette.unc.edu/feed/',
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
  'official': { label: 'Official', color: 'bg-[#13294B]' },
  'governance': { label: 'SG', color: 'bg-[#4B9CD3]' },
  'local-news': { label: 'Local', color: 'bg-teal-500' },
  'regional-news': { label: 'Regional', color: 'bg-purple-500' },
  'policies': { label: 'Policy', color: 'bg-gray-500' },
}
