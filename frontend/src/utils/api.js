// In development the Vite dev-server proxies /api/* → http://localhost:5000
// In production point this to your deployed API URL.
export const API_BASE = import.meta.env.VITE_API_BASE || '';

/**
 * Converts Google Drive share links to direct viewable links.
 */
export function toDirectImageUrl(url) {
  if (!url) return '';
  const match = String(url).match(/\/file\/d\/([^/]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/uc?export=view&id=${match[1]}`;
  }
  if (String(url).startsWith('assets/')) {
    return `/${url}`;
  }
  return url;
}

/**
 * Generates up to 2 uppercase initials from a name.
 */
export function getInitials(name) {
  return (name || '').trim().split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase() || 'S';
}
