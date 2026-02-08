import { Router, Request, Response } from 'express';
import StudentService from '../services/StudentService';
import ClaimService from '../services/ClaimService';
import ClaimDAO from '../dao/ClaimDAO';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { validateBody, sanitizeBody, validationSchemas } from '../middleware/validation';
import { parseOrganizationDetails } from '../models/Student';

const router = Router();

/**
 * POST /api/scan
 * Validate scanned QR code token and retrieve student info
 */
router.post(
  '/scan',
  sanitizeBody(['token']),
  validateBody(validationSchemas.scanToken),
  asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.body;

    // Get student by token
    const student = await StudentService.getStudentByToken(token);

    if (!student) {
      throw new AppError('Invalid QR code', 404, 'INVALID_TOKEN');
    }

    // Get claim status
    let claimStatus = await ClaimService.getClaimStatus(student.studentId);

    // Initialize claim record if it doesn't exist
    if (!claimStatus) {
      await ClaimDAO.initializeForStudent(student.studentId);
      claimStatus = await ClaimService.getClaimStatus(student.studentId);
    }

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
      claims: {
        tshirtClaimed: claimStatus?.tshirtClaimed || false,
        mealClaimed: claimStatus?.mealClaimed || false
      }
    });
  })
);

export default router;
