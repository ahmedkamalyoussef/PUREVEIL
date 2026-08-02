export const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL as string) || 'http://localhost:5000';
export const DEFAULT_PLACEHOLDER = 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=600';

/**
 * Resolves raw database image paths to valid browser URLs.
 * Handles HTTP(S) absolute URLs, data URIs, and relative uploads (/uploads/products/xyz.jpg).
 */
export const getImageUrl = (path?: string, fallback: string = DEFAULT_PLACEHOLDER): string => {
  if (!path || typeof path !== 'string' || path.trim() === '') {
    return fallback;
  }

  const trimmed = path.trim();

  // If already absolute URL or data URI, return as-is
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed;
  }

  // Prepend backend base host for relative uploads
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${BACKEND_URL}${cleanPath}`;
};
