"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const opportunityController_1 = require("../controllers/opportunityController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', opportunityController_1.getOpportunities);
router.get('/matched', auth_1.authenticate, (0, auth_1.authorize)('STUDENT'), opportunityController_1.getMatchedOpportunities);
router.get('/my', auth_1.authenticate, (0, auth_1.authorize)('GOVERNMENT_ORGANIZATION'), opportunityController_1.getOrgOpportunities);
router.get('/applications/org', auth_1.authenticate, (0, auth_1.authorize)('GOVERNMENT_ORGANIZATION'), opportunityController_1.getOrgApplications);
router.get('/:id', opportunityController_1.getOpportunityById);
router.post('/', auth_1.authenticate, (0, auth_1.authorize)('GOVERNMENT_ORGANIZATION', 'ADMIN'), opportunityController_1.createOpportunity);
router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)('GOVERNMENT_ORGANIZATION', 'ADMIN'), opportunityController_1.updateOpportunity);
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)('GOVERNMENT_ORGANIZATION'), opportunityController_1.deleteOpportunity);
// Applications
router.post('/apply', auth_1.authenticate, (0, auth_1.authorize)('STUDENT'), opportunityController_1.applyToOpportunity);
router.get('/applications/my', auth_1.authenticate, (0, auth_1.authorize)('STUDENT'), opportunityController_1.getMyApplications);
router.put('/applications/:id/status', auth_1.authenticate, (0, auth_1.authorize)('GOVERNMENT_ORGANIZATION', 'ADMIN'), opportunityController_1.updateApplicationStatus);
exports.default = router;
