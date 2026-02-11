import { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import QRCode from 'qrcode';
import { withCors, sendError, sendSuccess, findStudentById, createToken, parseOrganizationDetails } from './_shared';

async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return sendError(res, 405, 'Method not allowed', 'METHOD_NOT_ALLOWED');
  }

  try {
    const { studentId } = req.body;

    if (!studentId || typeof studentId !== 'string' || studentId.trim() === '') {
      return sendError(res, 400, 'Student ID is required', 'VALIDATION_ERROR');
    }

    const student = await findStudentById(studentId.trim());
    if (!student) {
      return sendError(res, 404, 'Student ID not found', 'STUDENT_NOT_FOUND');
    }

    const token = crypto.randomBytes(32).toString('hex');
    await createToken(token, student.studentId);

    const qrData = JSON.stringify({ token, studentId: student.studentId });
    const qrCode = await QRCode.toDataURL(qrData, { errorCorrectionLevel: 'M', type: 'image/png', margin: 1 });

    // Get collection status
    const claimStatus = await getClaimStatus(student.studentId);

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
      collectionStatus: {
        shirtCollected: claimStatus?.tshirtClaimed || false,
        mealCollected: claimStatus?.mealClaimed || false,
      },
    });
  } catch (error) {
    console.error('Error in /api/validate:', error);
    return sendError(res, 500, 'Internal server error', 'INTERNAL_SERVER_ERROR');
  }
}

export default withCors(handler);
