import { Router } from 'express';
import { getOpportunities, getOpportunityById, createOpportunity, updateOpportunity, deleteOpportunity, getMatchedOpportunities, applyToOpportunity, getMyApplications, updateApplicationStatus, getOrgOpportunities, getOrgApplications } from '../controllers/opportunityController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
router.get('/', getOpportunities);
router.get('/matched', authenticate, authorize('STUDENT'), getMatchedOpportunities);
router.get('/my', authenticate, authorize('GOVERNMENT_ORGANIZATION'), getOrgOpportunities);
router.get('/applications/org', authenticate, authorize('GOVERNMENT_ORGANIZATION'), getOrgApplications);
router.get('/:id', getOpportunityById);
router.post('/', authenticate, authorize('GOVERNMENT_ORGANIZATION', 'ADMIN'), createOpportunity);
router.put('/:id', authenticate, authorize('GOVERNMENT_ORGANIZATION', 'ADMIN'), updateOpportunity);
router.delete('/:id', authenticate, authorize('GOVERNMENT_ORGANIZATION'), deleteOpportunity);

// Applications
router.post('/apply', authenticate, authorize('STUDENT'), applyToOpportunity);
router.get('/applications/my', authenticate, authorize('STUDENT'), getMyApplications);
router.put('/applications/:id/status', authenticate, authorize('GOVERNMENT_ORGANIZATION', 'ADMIN'), updateApplicationStatus);
export default router;
