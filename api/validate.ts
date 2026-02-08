/**
 * Serverless function for /api/validate endpoint
 * Validates student ID and generates QR code
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { withCors, sendError, sendSuccess, ensureDataImported } from './_shared';
import StudentService from '../backend/src/services/StudentService';
import TokenService from '../backend/src/services/TokenService';
import QRCodeService from '../backend/src/services/QRCodeService';
import { parseOrganizationDetails } from '../backend/src/models/Student';

async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return sendError(res, 405, 'Method not allowed', 'METHOD_NOT_ALLOWED');
  }

  try {
    // Ensure CSV data is imported
    await ensureDataImported();

    const { studentId } = req.body;

    // Validate input
    if (!studentId || typeof studentId !== 'string' || studentId.trim() === '') {
      return sendError(res, 400, 'Student ID is required', 'VALIDATION_ERROR');
    }

    // Validate student ID
    const student = await StudentService.validateStudentId(studentId.trim());

    if (!student) {
      return sendError(res, 404, 'Student ID not found', 'STUDENT_NOT_FOUND');
    }

    // Generate token
    const token = await TokenService.storeToken(student.studentId);

    // Generate QR code
    const qrCode = await QRCodeService.generateQRCode({
      token,
      studentId: student.studentId,
    });

    // Return success response
    return sendSuccess(res, {
      student: {
        studentId: student.studentId,
        name: student.name,
        tshirtSize: student.tshirtSize,
        mealPreference: student.mealPreference,
        involvements: parseOrganizationDetails(student.organizationDetails),
      },
      qrCode,
      token,
    });
  } catch (error) {
    console.error('Error in /api/validate:', error);
    return sendError(
      res,
      500,
      'Internal server error',
      'INTERNAL_SERVER_ERROR'
    );
  }
}

export default withCors(handler);
