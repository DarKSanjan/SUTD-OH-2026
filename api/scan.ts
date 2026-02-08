/**
 * Serverless function for /api/scan endpoint
 * Validates scanned QR code token and retrieves student info
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { withCors, sendError, sendSuccess, ensureDataImported } from './_shared';
import StudentService from '../backend/src/services/StudentService';
import ClaimService from '../backend/src/services/ClaimService';
import ClaimDAO from '../backend/src/dao/ClaimDAO';
import { parseOrganizationDetails } from '../backend/src/models/Student';

async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return sendError(res, 405, 'Method not allowed', 'METHOD_NOT_ALLOWED');
  }

  try {
    // Ensure CSV data is imported
    await ensureDataImported();

    const { token } = req.body;

    // Validate input
    if (!token || typeof token !== 'string' || token.trim() === '') {
      return sendError(res, 400, 'Token is required', 'VALIDATION_ERROR');
    }

    // Get student by token
    const student = await StudentService.getStudentByToken(token.trim());

    if (!student) {
      return sendError(res, 404, 'Invalid QR code', 'INVALID_TOKEN');
    }

    // Get claim status
    let claimStatus = await ClaimService.getClaimStatus(student.studentId);

    // Initialize claim record if it doesn't exist
    if (!claimStatus) {
      await ClaimDAO.initializeForStudent(student.studentId);
      claimStatus = await ClaimService.getClaimStatus(student.studentId);
    }

    // Return success response
    return sendSuccess(res, {
      student: {
        studentId: student.studentId,
        name: student.name,
        tshirtSize: student.tshirtSize,
        mealPreference: student.mealPreference,
        involvements: parseOrganizationDetails(student.organizationDetails),
      },
      claims: {
        tshirtClaimed: claimStatus?.tshirtClaimed || false,
        mealClaimed: claimStatus?.mealClaimed || false,
      },
    });
  } catch (error) {
    console.error('Error in /api/scan:', error);
    return sendError(
      res,
      500,
      'Internal server error',
      'INTERNAL_SERVER_ERROR'
    );
  }
}

export default withCors(handler);
