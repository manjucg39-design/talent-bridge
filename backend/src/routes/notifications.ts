import { Router } from 'express';
import { getNotifications, markRead, markAllRead } from '../controllers/notificationController';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);
router.get('/', getNotifications);
router.put('/:id/read', markRead);
router.put('/read-all', markAllRead);
export default router;
