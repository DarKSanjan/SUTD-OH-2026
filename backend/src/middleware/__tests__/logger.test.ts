import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { requestLogger, logInfo, logWarning, logError } from '../logger';

describe('requestLogger', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let consoleLogSpy: any;

  beforeEach(() => {
    mockReq = {
      method: 'POST',
      originalUrl: '/api/test',
      url: '/api/test',
      ip: '127.0.0.1',
      socket: { remoteAddress: '127.0.0.1' } as any
    };

    mockRes = {
      statusCode: 200,
      on: vi.fn()
    };

    mockNext = vi.fn();

    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it('should log incoming request with timestamp', () => {
    requestLogger(mockReq as Request, mockRes as Response, mockNext);

    expect(consoleLogSpy).toHaveBeenCalled();
    const logCall = consoleLogSpy.mock.calls[0][0];
    expect(logCall).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] POST \/api\/test - IP: 127\.0\.0\.1/);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should register finish event listener', () => {
    requestLogger(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.on).toHaveBeenCalledWith('finish', expect.any(Function));
  });

  it('should log response when finished', () => {
    let finishCallback: Function | undefined;
    
    mockRes.on = vi.fn((event: string, callback: Function) => {
      if (event === 'finish') {
        finishCallback = callback;
      }
    }) as any;

    requestLogger(mockReq as Request, mockRes as Response, mockNext);

    // Trigger the finish event
    if (finishCallback) {
      finishCallback();
    }

    expect(consoleLogSpy).toHaveBeenCalledTimes(2);
    const responseLog = consoleLogSpy.mock.calls[1][0];
    expect(responseLog).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] POST \/api\/test - 200 - \d+ms/);
  });

  it('should use socket.remoteAddress if ip is not available', () => {
    mockReq.ip = undefined;
    
    requestLogger(mockReq as Request, mockRes as Response, mockNext);

    const logCall = consoleLogSpy.mock.calls[0][0];
    expect(logCall).toContain('127.0.0.1');
  });
});

describe('logInfo', () => {
  let consoleLogSpy: any;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it('should log info message with timestamp', () => {
    logInfo('Test info message');

    expect(consoleLogSpy).toHaveBeenCalled();
    const logCall = consoleLogSpy.mock.calls[0];
    expect(logCall[0]).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] INFO: Test info message/);
  });

  it('should log info message with data', () => {
    const data = { key: 'value' };
    logInfo('Test info message', data);

    expect(consoleLogSpy).toHaveBeenCalled();
    const logCall = consoleLogSpy.mock.calls[0];
    expect(logCall[0]).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] INFO: Test info message/);
    expect(logCall[1]).toEqual(data);
  });

  it('should handle missing data', () => {
    logInfo('Test info message');

    expect(consoleLogSpy).toHaveBeenCalled();
    const logCall = consoleLogSpy.mock.calls[0];
    expect(logCall[1]).toBe('');
  });
});

describe('logWarning', () => {
  let consoleWarnSpy: any;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  it('should log warning message with timestamp', () => {
    logWarning('Test warning message');

    expect(consoleWarnSpy).toHaveBeenCalled();
    const logCall = consoleWarnSpy.mock.calls[0];
    expect(logCall[0]).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] WARNING: Test warning message/);
  });

  it('should log warning message with data', () => {
    const data = { key: 'value' };
    logWarning('Test warning message', data);

    expect(consoleWarnSpy).toHaveBeenCalled();
    const logCall = consoleWarnSpy.mock.calls[0];
    expect(logCall[0]).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] WARNING: Test warning message/);
    expect(logCall[1]).toEqual(data);
  });
});

describe('logError', () => {
  let consoleErrorSpy: any;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should log error message with timestamp', () => {
    logError('Test error message');

    expect(consoleErrorSpy).toHaveBeenCalled();
    const logCall = consoleErrorSpy.mock.calls[0];
    expect(logCall[0]).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] ERROR: Test error message/);
  });

  it('should log error with Error object', () => {
    const error = new Error('Test error');
    logError('Test error message', error);

    expect(consoleErrorSpy).toHaveBeenCalled();
    const logCall = consoleErrorSpy.mock.calls[0];
    expect(logCall[0]).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] ERROR: Test error message/);
    expect(logCall[1]).toHaveProperty('message', 'Test error');
    expect(logCall[1]).toHaveProperty('stack');
  });

  it('should log error with custom error object', () => {
    const error = { code: 'TEST_ERROR', details: 'Some details' };
    logError('Test error message', error);

    expect(consoleErrorSpy).toHaveBeenCalled();
    const logCall = consoleErrorSpy.mock.calls[0];
    expect(logCall[1]).toHaveProperty('code', 'TEST_ERROR');
    expect(logCall[1]).toHaveProperty('details', 'Some details');
  });
});
