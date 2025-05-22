/**
 * Returns the base URL for the application based on the current environment
 * This helps with authentication redirects working in both development and production
 *
 * @returns {string} The base URL for the application
 */
export const getBaseUrl = () => {
  // Check if we're in a browser environment
  if (typeof window === "undefined") return "";

  // For production deployment, use the current window location's origin
  // For local development, it uses localhost
  return window.location.origin;
};

/**
 * Constructs a redirect URL for authentication callbacks
 *
 * @param {string} path - The path to redirect to after authentication
 * @returns {string} The full redirect URL
 */
export const getRedirectUrl = (path = "/auth/callback") => {
  return `${getBaseUrl()}${path}`;
};
