import crypto from 'crypto';
import TokenDAO from '../dao/TokenDAO';

export class TokenService {
  /**
   * Generate a cryptographically secure random token
   * Returns a 64-character hex string (32 bytes)
   */
  generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Store a token associated with a student ID
   * Includes collision detection - retries if token already exists
   */
  async storeToken(studentId: string, token?: string): Promise<string> {
    let tokenToStore = token || this.generateToken();
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      try {
        // Check if token already exists
        const existing = await TokenDAO.findByToken(tokenToStore);
        
        if (existing) {
          // Collision detected - generate new token
          tokenToStore = this.generateToken();
          attempts++;
          continue;
        }

        // Store the token
        await TokenDAO.create(tokenToStore, studentId);
        return tokenToStore;
      } catch (error: any) {
        // Handle unique constraint violation
        if (error.code === '23505') {
          // Collision detected - generate new token
          tokenToStore = this.generateToken();
          attempts++;
          continue;
        }
        throw error;
      }
    }

    throw new Error('Failed to generate unique token after maximum attempts');
  }

  /**
   * Validate that a token exists in the database
   */
  async validateToken(token: string): Promise<boolean> {
    const tokenRecord = await TokenDAO.findByToken(token);
    return tokenRecord !== null;
  }
}

export default new TokenService();
