import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param {string} dirty - Unsafe HTML string
 * @param {object} config - DOMPurify configuration
 * @returns {string} - Sanitized HTML string
 */
export const sanitizeHTML = (dirty, config = {}) => {
  const defaultConfig = {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'title'],
    ALLOW_DATA_ATTR: false,
    ...config
  };

  return DOMPurify.sanitize(dirty, defaultConfig);
};

/**
 * Sanitize text content (strips all HTML)
 * @param {string} dirty - Unsafe text
 * @returns {string} - Plain text only
 */
export const sanitizeText = (dirty) => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
};

/**
 * React hook for safe HTML rendering
 * Use with dangerouslySetInnerHTML
 * @param {string} html - HTML content to sanitize
 * @returns {object} - Object with __html property
 */
export const useSafeHTML = (html) => {
  if (!html) return { __html: '' };

  return {
    __html: sanitizeHTML(html)
  };
};

export default {
  sanitizeHTML,
  sanitizeText,
  useSafeHTML
};
