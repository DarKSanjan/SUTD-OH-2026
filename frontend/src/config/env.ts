/**
 * Environment configuration
 * 
 * This file centralizes environment variable access for the frontend.
 * In production, VITE_API_URL should be set to the Vercel deployment URL.
 * In development, it defaults to the local backend server.
 */

// Get the API base URL from environment variables
// In production (Vercel), this should be set to the deployment URL
// In development, it defaults to localhost:3000
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Export other environment variables as needed
export const NODE_ENV = import.meta.env.MODE || 'development';
export const IS_PRODUCTION = NODE_ENV === 'production';
export const IS_DEVELOPMENT = NODE_ENV === 'development';
