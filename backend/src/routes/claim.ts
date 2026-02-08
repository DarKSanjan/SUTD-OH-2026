import { Router, Request, Response } from 'express';
import StudentService from '../services/StudentService';
import ClaimService from '../services/ClaimService';
import ClaimDAO from '../dao/ClaimDAO';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { validateBody, sanitizeBody, validationSchemas } from '../middleware/validation';

const router = Router();

/**
 * POST /api/claim
 * Record item distribution (t-shirt or meal coupon)
 */
router.post(
  '/claim',
  sanitizeBody(['token']),
  validateBody(validationSchemas.recordClaim),
  asyncHandler(async (req: Request, res: Response) => {
    const { token, itemType } = req.body;

    // Get student by token
    const student = await StudentService.getStudentByToken(token);

    if (!student) {
      throw new AppError('Invalid QR code', 404, 'INVALID_TOKEN');
    }

    // Initialize claim record if it doesn't exist
    let claimStatus = await ClaimService.getClaimStatus(student.studentId);
    if (!claimStatus) {
      await ClaimDAO.initializeForStudent(student.studentId);
    }

    // Check if already claimed
    const alreadyClaimed = await ClaimService.isAlreadyClaimed(student.studentId, itemType);

    if (alreadyClaimed) {
      throw new AppError('Item already claimed', 409, 'ALREADY_CLAIMED');
    }

    // Record the claim
    const success = await ClaimService.recordClaim(student.studentId, itemType);

    if (!success) {
      throw new AppError('Item already claimed', 409, 'ALREADY_CLAIMED');
    }

    // Get updated claim status
    const updatedClaims = await ClaimService.getClaimStatus(student.studentId);

    // Return success response
    return res.status(200).json({
      success: true,
      claims: {
        tshirtClaimed: updatedClaims?.tshirtClaimed || false,
        mealClaimed: updatedClaims?.mealClaimed || false
      }
    });
  })
);

export default router;
