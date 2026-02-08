import ClaimDAO from '../dao/ClaimDAO';
import { Claim } from '../models/Claim';

export class ClaimService {
  /**
   * Get the claim status for a student
   */
  async getClaimStatus(studentId: string): Promise<Claim | null> {
    return await ClaimDAO.findByStudentId(studentId);
  }

  /**
   * Check if an item is already claimed
   */
  async isAlreadyClaimed(studentId: string, itemType: 'tshirt' | 'meal'): Promise<boolean> {
    const claim = await ClaimDAO.findByStudentId(studentId);
    
    if (!claim) {
      return false;
    }
    
    return itemType === 'tshirt' ? claim.tshirtClaimed : claim.mealClaimed;
  }

  /**
   * Record a claim for a student
   * Returns true if successful, false if already claimed
   * Uses atomic transaction handling via DAO
   */
  async recordClaim(studentId: string, itemType: 'tshirt' | 'meal'): Promise<boolean> {
    // The DAO handles duplicate checking and atomic transactions
    return await ClaimDAO.updateClaim(studentId, itemType);
  }
}

export default new ClaimService();
