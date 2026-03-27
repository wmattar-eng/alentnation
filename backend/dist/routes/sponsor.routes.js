"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const sponsor_controller_1 = require("../controllers/sponsor.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const router = (0, express_1.Router)();
// Public routes
router.get('/campaigns/active', sponsor_controller_1.sponsorController.getActiveCampaigns);
router.get('/campaigns/:id', sponsor_controller_1.sponsorController.getCampaignDetails);
// Protected routes - require authentication
router.use(auth_middleware_1.authMiddleware);
// Sponsor management
router.post('/register', [
    (0, express_validator_1.body)('companyName').notEmpty().trim(),
    (0, express_validator_1.body)('website').optional().isURL(),
    validate_middleware_1.validate
], sponsor_controller_1.sponsorController.registerSponsor);
router.get('/profile', sponsor_controller_1.sponsorController.getSponsorProfile);
router.put('/profile', sponsor_controller_1.sponsorController.updateSponsorProfile);
// Campaign management
router.post('/campaigns', [
    (0, express_validator_1.body)('name').notEmpty().trim(),
    (0, express_validator_1.body)('type').isIn(['HOMEPAGE_HERO', 'PROJECT_SPONSORED', 'SEARCH_SPONSORED', 'TALENT_FEATURED', 'SIDEBAR_AD', 'PUSH_NOTIFICATION', 'EMAIL_SPOTLIGHT']),
    (0, express_validator_1.body)('budget').isFloat({ min: 500 }),
    (0, express_validator_1.body)('startDate').isISO8601(),
    (0, express_validator_1.body)('endDate').isISO8601(),
    (0, express_validator_1.body)('headline').notEmpty().trim().isLength({ max: 100 }),
    (0, express_validator_1.body)('ctaText').notEmpty().trim(),
    (0, express_validator_1.body)('ctaUrl').isURL(),
    validate_middleware_1.validate
], sponsor_controller_1.sponsorController.createCampaign);
router.get('/campaigns', sponsor_controller_1.sponsorController.getMyCampaigns);
router.put('/campaigns/:id', sponsor_controller_1.sponsorController.updateCampaign);
router.post('/campaigns/:id/pause', sponsor_controller_1.sponsorController.pauseCampaign);
router.post('/campaigns/:id/resume', sponsor_controller_1.sponsorController.resumeCampaign);
// Analytics
router.get('/analytics/dashboard', sponsor_controller_1.sponsorController.getAnalyticsDashboard);
router.get('/analytics/campaigns/:id', sponsor_controller_1.sponsorController.getCampaignAnalytics);
// Payment
router.post('/campaigns/:id/fund', [
    (0, express_validator_1.param)('id').isUUID(),
    (0, express_validator_1.body)('amount').isFloat({ min: 500 }),
    (0, express_validator_1.body)('paymentMethod').isIn(['stripe', 'hyperpay']),
    validate_middleware_1.validate
], sponsor_controller_1.sponsorController.fundCampaign);
exports.default = router;
//# sourceMappingURL=sponsor.routes.js.map