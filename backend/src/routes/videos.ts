import { Router } from 'express';
import { uploadVideo, getVideo, getVideosByTest } from '../controllers/videoController';
import { authenticate, authorize } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();
router.use(authenticate);
router.post('/upload', authorize('PE_TEACHER'), upload.single('video'), uploadVideo);
router.get('/test/:testId', authorize('PE_TEACHER', 'SCOUT', 'ADMIN', 'STUDENT'), getVideosByTest);
router.get('/:id', authorize('PE_TEACHER', 'SCOUT', 'ADMIN', 'STUDENT'), getVideo);
export default router;
