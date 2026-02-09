/**
 * UNC News Sources Registry
 *
 * Defines the external news sources Grok can search for UNC-related context.
 * These are used both for relevance checking and as search domain filters.
 */

export const UNC_NEWS_SOURCES = [
  {
    id: 'dth',
    name: 'The Daily Tar Heel',
    domain: 'dailytarheel.com',
    description: 'Independent student newspaper at UNC-Chapel Hill',
    category: 'student-news',
  },
  {
    id: 'unc-news',
    name: 'UNC News',
    domain: 'news.unc.edu',
    description: 'Official UNC-Chapel Hill news and announcements',
    category: 'official',
  },
  {
    id: 'unc-sg',
    name: 'UNC Student Government',
    domain: 'studentgovernment.unc.edu',
    description: 'Official student government website and documents',
    category: 'governance',
  },
  {
    id: 'unc-policies',
    name: 'UNC Policies',
    domain: 'policies.unc.edu',
    description: 'Official university policies and procedures',
    category: 'policies',
  },
  {
    id: 'chapelboro',
    name: 'Chapelboro',
    domain: 'chapelboro.com',
    description: 'Local Chapel Hill and Carrboro news covering UNC',
    category: 'local-news',
  },
  {
    id: 'abc11',
    name: 'ABC11 (WTVD)',
    domain: 'abc11.com',
    description: 'Triangle-area TV news covering UNC events',
    category: 'local-news',
  },
  {
    id: 'newsobserver',
    name: 'The News & Observer',
    domain: 'newsobserver.com',
    description: 'Raleigh newspaper covering NC higher education',
    category: 'regional-news',
  },
  {
    id: 'unc-gazette',
    name: 'University Gazette',
    domain: 'gazette.unc.edu',
    description: 'UNC faculty and staff news publication',
    category: 'official',
  },
]

// Domains Grok web search should prioritize
export const UNC_SEARCH_DOMAINS = UNC_NEWS_SOURCES.map(s => s.domain)

// Build a search context string listing available news sources
export function getNewsSourcesContext() {
  return UNC_NEWS_SOURCES.map(s => `- ${s.name} (${s.domain}): ${s.description}`).join('\n')
}
