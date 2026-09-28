import { Router } from 'express';
import { getStudents, getStudentById, updateStudentProfile, getMyProfile, addAchievement, deleteAchievement, getStudentStats, createStudentForTeacher, updateStudentForTeacher, removeStudentForTeacher } from '../controllers/studentController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
router.use(authenticate);
router.get('/', authorize('SCOUT', 'ADMIN', 'PE_TEACHER'), getStudents);
router.post('/', authorize('PE_TEACHER'), createStudentForTeacher);
router.put('/:id', authorize('PE_TEACHER'), updateStudentForTeacher);
router.delete('/:id', authorize('PE_TEACHER'), removeStudentForTeacher);
router.get('/me', authorize('STUDENT'), getMyProfile);
router.get('/me/stats', authorize('STUDENT'), getStudentStats);
router.put('/me', authorize('STUDENT'), updateStudentProfile);
router.post('/me/achievements', authorize('STUDENT'), addAchievement);
router.delete('/me/achievements/:id', authorize('STUDENT'), deleteAchievement);
router.get('/:id', authorize('SCOUT', 'ADMIN', 'PE_TEACHER', 'STUDENT'), getStudentById);
router.get('/:id/stats', authorize('SCOUT', 'ADMIN', 'PE_TEACHER'), getStudentStats);
export default router;
