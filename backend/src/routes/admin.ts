import { Router } from 'express';
import { getStats, getPendingVerifications, verifyEntity, rejectEntity, getAllUsers, setUserActive } from '../controllers/adminController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
router.use(authenticate, authorize('ADMIN'));
router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.get('/pending-verifications', getPendingVerifications);
router.put('/verify/:id', verifyEntity);
router.put('/reject/:id', rejectEntity);
router.put('/users/:id/status', setUserActive);
export default router;
