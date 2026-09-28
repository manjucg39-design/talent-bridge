import { Router } from 'express';
import { getClubs, getClubById, createClub, getKICs, getClubDashboard, createTrainingRecord } from '../controllers/clubController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
router.get('/', getClubs);
router.get('/dashboard', authenticate, authorize('CLUB', 'ADMIN'), getClubDashboard);
router.post('/training', authenticate, authorize('CLUB', 'ADMIN'), createTrainingRecord);
router.get('/:id', getClubById);
router.post('/', authenticate, authorize('CLUB', 'ADMIN'), createClub);
export default router;
