/**
 * Project Bold Platform - Shared Utilities
 */

/**
 * Format a date for display
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  });
}

/**
 * Format a time for display
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format date and time together
 */
export function formatDateTime(date: Date | string): string {
  return `${formatDate(date)} at ${formatTime(date)}`;
}

/**
 * Calculate progress percentage
 */
export function calculateProgress(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

/**
 * Slugify a string for URLs
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Generate initials from a name
 */
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

/**
 * Validate UNC email format
 */
export function isUNCEmail(email: string): boolean {
  return email.toLowerCase().endsWith('@unc.edu') ||
         email.toLowerCase().endsWith('@live.unc.edu') ||
         email.toLowerCase().endsWith('@email.unc.edu');
}

/**
 * Parse a PID from various formats
 */
export function parsePID(input: string): string | null {
  const match = input.match(/\d{9}/);
  return match ? match[0] : null;
}

/**
 * Format service hours for display
 */
export function formatServiceHours(hours: number): string {
  if (hours === 1) return '1 hour';
  return `${hours} hours`;
}

/**
 * Get the current academic term
 */
export function getCurrentAcademicTerm(): { term: string; year: number } {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  if (month >= 7 && month <= 11) {
    return { term: 'Fall', year };
  } else if (month >= 0 && month <= 4) {
    return { term: 'Spring', year };
  } else if (month === 5) {
    return { term: 'Summer I', year };
  } else {
    return { term: 'Summer II', year };
  }
}

/**
 * Check if a date is within an academic semester
 */
export function isWithinSemester(date: Date, semester: string, year: number): boolean {
  const d = new Date(date);
  const semesterYear = d.getFullYear();
  const month = d.getMonth();

  if (semesterYear !== year) return false;

  switch (semester) {
    case 'Fall':
      return month >= 7 && month <= 11;
    case 'Spring':
      return month >= 0 && month <= 4;
    case 'Summer I':
      return month === 5;
    case 'Summer II':
      return month === 6;
    default:
      return false;
  }
}

/**
 * Generate a random color from UNC palette
 */
export function getUNCColor(index: number): string {
  const colors = [
    '#4B9CD3', // Carolina Blue
    '#13294B', // Navy
    '#007749', // Green
    '#E8B00F', // Gold
    '#CC0000', // Red
    '#2E8540', // Forest
    '#5B2C6F', // Purple
    '#FF6B35', // Orange
  ];
  return colors[index % colors.length];
}

/**
 * Delay execution (for rate limiting, etc.)
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Safely parse JSON with a default value
 */
export function safeJsonParse<T>(json: string, defaultValue: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * Check if a value is defined (not null or undefined)
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Group an array by a key
 */
export function groupBy<T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  return array.reduce((result, item) => {
    const key = keyFn(item);
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
    return result;
  }, {} as Record<K, T[]>);
}

/**
 * Remove duplicates from an array based on a key
 */
export function uniqueBy<T>(array: T[], keyFn: (item: T) => string | number): T[] {
  const seen = new Set<string | number>();
  return array.filter(item => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
