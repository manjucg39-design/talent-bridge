import { Router } from 'express';
import { createTest, getTestsByStudent, getMyStudents, getTeacherStats, updateTest, deleteTest } from '../controllers/testController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
router.use(authenticate);
router.post('/', authorize('PE_TEACHER'), createTest);
router.put('/:id', authorize('PE_TEACHER'), updateTest);
router.delete('/:id', authorize('PE_TEACHER'), deleteTest);
router.get('/my-students', authorize('PE_TEACHER'), getMyStudents);
router.get('/teacher-stats', authorize('PE_TEACHER'), getTeacherStats);
router.get('/:studentId', authorize('PE_TEACHER', 'SCOUT', 'ADMIN', 'STUDENT'), getTestsByStudent);
export default router;
