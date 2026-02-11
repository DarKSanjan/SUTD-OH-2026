import { Router, Request, Response } from 'express';
import StudentService from '../services/StudentService';
import ClaimService from '../services/ClaimService';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { validateBody, sanitizeBody, validationSchemas } from '../middleware/validation';

const router = Router();

/**
 * GET /api/distribution-status/:studentId
 * Get distribution status for a student
 */
router.get(
  '/distribution-status/:studentId',
  asyncHandler(async (req: Request, res: Response) => {
    const { studentId } = req.params;

    // Verify student exists
    const student = await StudentService.validateStudentId(studentId);

    if (!student) {
      throw new AppError('Student not found', 404, 'STUDENT_NOT_FOUND');
    }

    // Get claim status
    const claimStatus = await ClaimService.getClaimStatus(student.studentId);

    // Return status
    return res.status(200).json({
      success: true,
      status: {
        tshirtClaimed: claimStatus?.tshirtClaimed || false,
        mealClaimed: claimStatus?.mealClaimed || false
      }
    });
  })
);

/**
 * PATCH /api/distribution-status
 * Update distribution status (bidirectional - supports both checking and unchecking)
 */
router.patch(
  '/distribution-status',
  sanitizeBody(['studentId']),
  validateBody(validationSchemas.updateDistributionStatus),
  asyncHandler(async (req: Request, res: Response) => {
    const { studentId, itemType, collected } = req.body;

    // Verify student exists
    const student = await StudentService.validateStudentId(studentId);

    if (!student) {
      throw new AppError('Student not found', 404, 'STUDENT_NOT_FOUND');
    }

    // Update distribution status using the actual student ID from database
    const updatedClaim = await ClaimService.updateDistributionStatus(
      student.studentId,  // Use the actual student ID from database
      itemType, 
      collected
    );

    // Return success response with updated status
    return res.status(200).json({
      success: true,
      claim: {
        studentId: updatedClaim.studentId,
        tshirtClaimed: updatedClaim.tshirtClaimed,
        mealClaimed: updatedClaim.mealClaimed
      }
    });
  })
);

export default router;
