import { Router } from 'express';
import { getKICs } from '../controllers/clubController';

const router = Router();
router.get('/', getKICs);
export default router;
