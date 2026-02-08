/**
 * Serverless function for /api/claim endpoint
 * Records item distribution (t-shirt or meal coupon)
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { withCors, sendError, sendSuccess, ensureDataImported } from './_shared';
import StudentService from '../backend/src/services/StudentService';
import ClaimService from '../backend/src/services/ClaimService';
import ClaimDAO from '../backend/src/dao/ClaimDAO';

async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return sendError(res, 405, 'Method not allowed', 'METHOD_NOT_ALLOWED');
  }

  try {
    // Ensure CSV data is imported
    await ensureDataImported();

    const { token, itemType } = req.body;

    // Validate input
    if (!token || typeof token !== 'string' || token.trim() === '') {
      return sendError(res, 400, 'Token is required', 'VALIDATION_ERROR');
    }

    if (!itemType || !['tshirt', 'meal'].includes(itemType)) {
      return sendError(
        res,
        400,
        'Item type must be "tshirt" or "meal"',
        'VALIDATION_ERROR'
      );
    }

    // Get student by token
    const student = await StudentService.getStudentByToken(token.trim());

    if (!student) {
      return sendError(res, 404, 'Invalid QR code', 'INVALID_TOKEN');
    }

    // Initialize claim record if it doesn't exist
    let claimStatus = await ClaimService.getClaimStatus(student.studentId);
    if (!claimStatus) {
      await ClaimDAO.initializeForStudent(student.studentId);
    }

    // Check if already claimed
    const alreadyClaimed = await ClaimService.isAlreadyClaimed(
      student.studentId,
      itemType
    );

    if (alreadyClaimed) {
      return sendError(res, 409, 'Item already claimed', 'ALREADY_CLAIMED');
    }

    // Record the claim
    const success = await ClaimService.recordClaim(student.studentId, itemType);

    if (!success) {
      return sendError(res, 409, 'Item already claimed', 'ALREADY_CLAIMED');
    }

    // Get updated claim status
    const updatedClaims = await ClaimService.getClaimStatus(student.studentId);

    // Return success response
    return sendSuccess(res, {
      claims: {
        tshirtClaimed: updatedClaims?.tshirtClaimed || false,
        mealClaimed: updatedClaims?.mealClaimed || false,
      },
    });
  } catch (error) {
    console.error('Error in /api/claim:', error);
    return sendError(
      res,
      500,
      'Internal server error',
      'INTERNAL_SERVER_ERROR'
    );
  }
}

export default withCors(handler);
