import { Router, Request, Response } from 'express';
import StudentService from '../services/StudentService';
import TokenService from '../services/TokenService';
import QRCodeService from '../services/QRCodeService';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { validateBody, sanitizeBody, validationSchemas } from '../middleware/validation';
import { parseOrganizationDetails } from '../models/Student';

const router = Router();

/**
 * POST /api/validate
 * Validate student ID and generate QR code
 */
router.post(
  '/validate',
  sanitizeBody(['studentId']),
  validateBody(validationSchemas.validateStudent),
  asyncHandler(async (req: Request, res: Response) => {
    const { studentId } = req.body;

    // Validate student ID
    const student = await StudentService.validateStudentId(studentId);

    if (!student) {
      throw new AppError('Student ID not found', 404, 'STUDENT_NOT_FOUND');
    }

    // Generate token
    const token = await TokenService.storeToken(student.studentId);

    // Generate QR code
    const qrCode = await QRCodeService.generateQRCode({
      token,
      studentId: student.studentId
    });

    // Return success response
    return res.status(200).json({
      success: true,
      student: {
        studentId: student.studentId,
        name: student.name,
        tshirtSize: student.tshirtSize,
        mealPreference: student.mealPreference,
        involvements: parseOrganizationDetails(student.organizationDetails)
      },
      qrCode,
      token
    });
  })
);

export default router;
