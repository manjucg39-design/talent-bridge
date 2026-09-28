import { Router } from 'express';
import { getAthletes, getAthleteDetail, shortlistAthlete, getShortlist, getScoutStats, updateShortlist, deleteShortlist } from '../controllers/scoutController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
router.use(authenticate, authorize('SCOUT', 'ADMIN'));
router.get('/athletes', getAthletes);
router.get('/athletes/:id', getAthleteDetail);
router.get('/shortlist', getShortlist);
router.get('/stats', getScoutStats);
router.post('/shortlist', shortlistAthlete);
router.put('/shortlist/:id', updateShortlist);
router.delete('/shortlist/:id', deleteShortlist);
export default router;
