/**
 * API Service with retry logic and error handling
 * 
 * This service provides a centralized way to make API calls with:
 * - Exponential backoff retry logic for network failures
 * - Request timeout handling
 * - Consistent error handling
 * - Type-safe request/response interfaces
 */

import { API_BASE_URL } from '../config/env';

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second
const REQUEST_TIMEOUT = 10000; // 10 seconds

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number = REQUEST_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout. Please try again.');
    }
    throw error;
  }
}

/**
 * Fetch with exponential backoff retry logic
 * 
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @param retries - Number of retries remaining
 * @returns Promise<Response>
 * @throws Error if all retries are exhausted
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries: number = MAX_RETRIES
): Promise<Response> {
  try {
    const response = await fetchWithTimeout(url, options);
    return response;
  } catch (error) {
    // Only retry on network errors, not on API errors
    const isNetworkFailure = 
      error instanceof TypeError || 
      (error instanceof Error && error.message.includes('timeout'));
    
    if (isNetworkFailure && retries > 0) {
      // Calculate delay with exponential backoff: 1s, 2s, 4s
      const delay = INITIAL_RETRY_DELAY * Math.pow(2, MAX_RETRIES - retries);
      console.log(`Network error, retrying in ${delay}ms... (${retries} retries left)`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}

/**
 * Make a POST request with retry logic
 * 
 * @param endpoint - The API endpoint (e.g., '/api/validate')
 * @param body - The request body
 * @returns Promise with parsed JSON response
 */
export async function apiPost<T>(endpoint: string, body: unknown): Promise<T> {
  // Construct full URL using base URL from environment
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetchWithRetry(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    // Throw error with response data for handling
    const error = new Error(data.error || 'Request failed') as Error & { 
      status: number; 
      data: T;
    };
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

/**
 * API Error class for better error handling
 */
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Check if an error is a network error (vs API error)
 */
export function isNetworkError(error: unknown): boolean {
  return error instanceof TypeError && error.message.includes('fetch');
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (isNetworkError(error)) {
    return 'Network error. Please check your connection and try again.';
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
}
