import { Router, Request, Response } from 'express';
import StudentService from '../services/StudentService';
import StudentDAO from '../dao/StudentDAO';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { validateBody, sanitizeBody, validationSchemas } from '../middleware/validation';

const router = Router();

/**
 * POST /api/consent
 * Record PDPA consent for a student
 */
router.post(
  '/consent',
  sanitizeBody(['studentId']),
  validateBody(validationSchemas.recordConsent),
  asyncHandler(async (req: Request, res: Response) => {
    const { studentId, consented } = req.body;

    // Validate student exists
    const student = await StudentService.validateStudentId(studentId);

    if (!student) {
      throw new AppError('Student ID not found', 404, 'STUDENT_NOT_FOUND');
    }

    // Update consent status
    await StudentDAO.updateConsent(studentId, consented);

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Consent recorded successfully'
    });
  })
);

export default router;
