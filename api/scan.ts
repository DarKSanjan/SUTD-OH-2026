import { VercelRequest, VercelResponse } from '@vercel/node';
import { withCors, sendError, sendSuccess, findStudentByToken, getClaimStatus, initializeClaim, parseOrganizationDetails } from './_shared';

async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return sendError(res, 405, 'Method not allowed', 'METHOD_NOT_ALLOWED');
  }

  try {
    const { token } = req.body;

    if (!token || typeof token !== 'string' || token.trim() === '') {
      return sendError(res, 400, 'Token is required', 'VALIDATION_ERROR');
    }

    const student = await findStudentByToken(token.trim());
    if (!student) {
      return sendError(res, 404, 'Invalid QR code', 'INVALID_TOKEN');
    }

    let claims = await getClaimStatus(student.studentId);
    if (!claims) {
      await initializeClaim(student.studentId);
      claims = await getClaimStatus(student.studentId);
    }

    return sendSuccess(res, {
      student: {
        studentId: student.studentId,
        name: student.name,
        tshirtSize: student.tshirtSize,
        mealPreference: student.mealPreference,
        involvements: parseOrganizationDetails(student.organizationDetails),
      },
      claims: {
        tshirtClaimed: claims?.tshirtClaimed || false,
        mealClaimed: claims?.mealClaimed || false,
      },
    });
  } catch (error) {
    console.error('Error in /api/scan:', error);
    return sendError(res, 500, 'Internal server error', 'INTERNAL_SERVER_ERROR');
  }
}

export default withCors(handler);
