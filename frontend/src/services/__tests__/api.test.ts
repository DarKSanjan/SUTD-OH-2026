import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchWithRetry, apiPost, isNetworkError, getErrorMessage } from '../api';

describe('API Service', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('fetchWithRetry', () => {
    it('should return response on successful fetch', async () => {
      const mockResponse = new Response('{"success": true}', { status: 200 });
      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const result = await fetchWithRetry('/api/test', {});

      expect(result).toBe(mockResponse);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should retry on network failure with exponential backoff', async () => {
      const mockError = new TypeError('Network error');
      const mockResponse = new Response('{"success": true}', { status: 200 });
      
      global.fetch = vi.fn()
        .mockRejectedValueOnce(mockError)
        .mockRejectedValueOnce(mockError)
        .mockResolvedValueOnce(mockResponse);

      const promise = fetchWithRetry('/api/test', {}, 3);

      // First retry after 1s
      await vi.advanceTimersByTimeAsync(1000);
      
      // Second retry after 2s
      await vi.advanceTimersByTimeAsync(2000);

      const result = await promise;

      expect(result).toBe(mockResponse);
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should throw error after all retries exhausted', async () => {
      const mockError = new TypeError('Network error');
      global.fetch = vi.fn().mockRejectedValue(mockError);

      // Catch the promise rejection immediately
      await expect(async () => {
        const promise = fetchWithRetry('/api/test', {}, 2);
        await vi.runAllTimersAsync();
        await promise;
      }).rejects.toThrow('Network error');
      
      expect(global.fetch).toHaveBeenCalledTimes(3); // Initial + 2 retries
    }, 10000); // Increase timeout for this test

    it('should not retry on successful response', async () => {
      const mockResponse = new Response('{"success": true}', { status: 200 });
      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      await fetchWithRetry('/api/test', {}, 3);

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('apiPost', () => {
    it('should make POST request with correct headers and body', async () => {
      const mockResponse = new Response('{"success": true, "data": "test"}', { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const result = await apiPost('/api/test', { key: 'value' });

      // Check that fetch was called with the full URL and correct options
      expect(global.fetch).toHaveBeenCalledTimes(1);
      const callArgs = (global.fetch as any).mock.calls[0];
      expect(callArgs[0]).toContain('/api/test'); // URL contains endpoint
      expect(callArgs[1].method).toBe('POST');
      expect(callArgs[1].headers['Content-Type']).toBe('application/json');
      expect(callArgs[1].body).toBe(JSON.stringify({ key: 'value' }));
      expect(result).toEqual({ success: true, data: 'test' });
    });

    it('should throw error with status on failed response', async () => {
      const mockResponse = new Response('{"error": "Not found"}', { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      try {
        await apiPost('/api/test', { key: 'value' });
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(error.message).toBe('Not found');
        expect(error.status).toBe(404);
        expect(error.data).toEqual({ error: 'Not found' });
      }
    });

    it('should use default error message if none provided', async () => {
      const mockResponse = new Response('{"success": false}', { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      try {
        await apiPost('/api/test', { key: 'value' });
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(error.message).toBe('Request failed');
        expect(error.status).toBe(500);
      }
    });

    it('should retry on network failure', async () => {
      const mockError = new TypeError('Network error');
      const mockResponse = new Response('{"success": true}', { status: 200 });
      
      global.fetch = vi.fn()
        .mockRejectedValueOnce(mockError)
        .mockResolvedValueOnce(mockResponse);

      const promise = apiPost('/api/test', { key: 'value' });

      // Wait for retry
      await vi.advanceTimersByTimeAsync(1000);

      const result = await promise;

      expect(result).toEqual({ success: true });
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('isNetworkError', () => {
    it('should return true for TypeError with fetch message', () => {
      const error = new TypeError('fetch failed');
      expect(isNetworkError(error)).toBe(true);
    });

    it('should return false for other errors', () => {
      const error = new Error('Some error');
      expect(isNetworkError(error)).toBe(false);
    });

    it('should return false for non-Error objects', () => {
      expect(isNetworkError('string error')).toBe(false);
      expect(isNetworkError(null)).toBe(false);
      expect(isNetworkError(undefined)).toBe(false);
    });
  });

  describe('getErrorMessage', () => {
    it('should return network error message for network errors', () => {
      const error = new TypeError('fetch failed');
      expect(getErrorMessage(error)).toBe('Network error. Please check your connection and try again.');
    });

    it('should return error message for Error objects', () => {
      const error = new Error('Custom error message');
      expect(getErrorMessage(error)).toBe('Custom error message');
    });

    it('should return default message for unknown errors', () => {
      expect(getErrorMessage('string error')).toBe('An unexpected error occurred. Please try again.');
      expect(getErrorMessage(null)).toBe('An unexpected error occurred. Please try again.');
      expect(getErrorMessage(undefined)).toBe('An unexpected error occurred. Please try again.');
    });
  });
});
