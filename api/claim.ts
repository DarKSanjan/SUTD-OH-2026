import { VercelRequest, VercelResponse } from '@vercel/node';
import { withCors, sendError, sendSuccess, findStudentByToken, getClaimStatus, initializeClaim, updateClaim } from './_shared';

async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return sendError(res, 405, 'Method not allowed', 'METHOD_NOT_ALLOWED');
  }

  try {
    const { token, itemType } = req.body;

    if (!token || typeof token !== 'string' || token.trim() === '') {
      return sendError(res, 400, 'Token is required', 'VALIDATION_ERROR');
    }

    if (!itemType || !['tshirt', 'meal'].includes(itemType)) {
      return sendError(res, 400, 'Item type must be "tshirt" or "meal"', 'VALIDATION_ERROR');
    }

    const student = await findStudentByToken(token.trim());
    if (!student) {
      return sendError(res, 404, 'Invalid QR code', 'INVALID_TOKEN');
    }

    let claims = await getClaimStatus(student.studentId);
    if (!claims) {
      await initializeClaim(student.studentId);
    }

    // Check if already claimed
    claims = await getClaimStatus(student.studentId);
    if (claims) {
      if (itemType === 'tshirt' && claims.tshirtClaimed) {
        return sendError(res, 409, 'Item already claimed', 'ALREADY_CLAIMED');
      }
      if (itemType === 'meal' && claims.mealClaimed) {
        return sendError(res, 409, 'Item already claimed', 'ALREADY_CLAIMED');
      }
    }

    const success = await updateClaim(student.studentId, itemType);
    if (!success) {
      return sendError(res, 409, 'Item already claimed', 'ALREADY_CLAIMED');
    }

    const updatedClaims = await getClaimStatus(student.studentId);

    return sendSuccess(res, {
      claims: {
        tshirtClaimed: updatedClaims?.tshirtClaimed || false,
        mealClaimed: updatedClaims?.mealClaimed || false,
      },
    });
  } catch (error) {
    console.error('Error in /api/claim:', error);
    return sendError(res, 500, 'Internal server error', 'INTERNAL_SERVER_ERROR');
  }
}

export default withCors(handler);
