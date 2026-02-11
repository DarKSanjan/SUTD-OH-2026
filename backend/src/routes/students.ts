import { Router, Request, Response } from 'express';
import StudentDAO from '../dao/StudentDAO';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * GET /api/students/all
 * Retrieve all student records with distribution and consent status
 */
router.get(
  '/students/all',
  asyncHandler(async (req: Request, res: Response) => {
    // Get all students with their claim status
    const students = await StudentDAO.getAllStudents();

    // Return success response
    return res.status(200).json({
      success: true,
      students: students,
      total: students.length
    });
  })
);

export default router;
