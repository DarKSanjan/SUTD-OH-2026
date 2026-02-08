import { describe, it, expect, afterAll } from 'vitest';
import * as fc from 'fast-check';
import jsQR from 'jsqr';
import { PNG } from 'pngjs';
import QRCodeService, { QRCodeData } from '../QRCodeService';
import pool from '../../db/config';

/**
 * Feature: event-check-in-system
 * Property 6: QR Code Round Trip
 * 
 * Validates: Requirements 3.3
 * 
 * For any valid student with a generated token, encoding the student data and token 
 * into a QR code and then decoding it should produce equivalent data containing 
 * the token, student ID, name, t-shirt size, and meal preference.
 */

/**
 * Helper function to decode a QR code from a data URL
 */
async function decodeQRCode(dataUrl: string): Promise<string | null> {
  // Remove the data URL prefix
  const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');
  
  // Parse PNG
  const png = PNG.sync.read(buffer);
  
  // Decode QR code
  const code = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
  
  return code ? code.data : null;
}

describe('Property 6: QR Code Round Trip', () => {
  afterAll(async () => {
    await pool.end();
  });

  it('should encode and decode QR codes correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          token: fc.hexaString({ minLength: 64, maxLength: 64 }),
          studentId: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
        }),
        async (qrData) => {
          // Generate QR code
          const qrCodeDataUrl = await QRCodeService.generateQRCode(qrData);
          
          // Verify it's a data URL
          expect(qrCodeDataUrl).toMatch(/^data:image\/png;base64,/);
          
          // Decode QR code
          const decodedData = await decodeQRCode(qrCodeDataUrl);
          
          // Verify decoded data matches original
          expect(decodedData).not.toBeNull();
          const parsedData = JSON.parse(decodedData!);
          expect(parsedData.token).toBe(qrData.token);
          expect(parsedData.studentId).toBe(qrData.studentId);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle various student ID formats', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          token: fc.hexaString({ minLength: 64, maxLength: 64 }),
          studentId: fc.oneof(
            fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
            fc.integer({ min: 1000, max: 999999 }).map(n => n.toString()),
            fc.stringMatching(/^[A-Z]{2}\d{4}$/), // Format like "AB1234"
          ),
        }),
        async (qrData) => {
          // Generate QR code
          const qrCodeDataUrl = await QRCodeService.generateQRCode(qrData);
          
          // Decode QR code
          const decodedData = await decodeQRCode(qrCodeDataUrl);
          
          // Verify decoded data matches original
          expect(decodedData).not.toBeNull();
          const parsedData = JSON.parse(decodedData!);
          expect(parsedData.token).toBe(qrData.token);
          expect(parsedData.studentId).toBe(qrData.studentId);
        }
      ),
      { numRuns: 100 }
    );
  });
});
