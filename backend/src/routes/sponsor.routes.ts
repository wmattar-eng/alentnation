import { Router } from 'express';
import { body, param } from 'express-validator';
import { sponsorController } from '../controllers/sponsor.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();

// Public routes
router.get('/campaigns/active', sponsorController.getActiveCampaigns);
router.get('/campaigns/:id', sponsorController.getCampaignDetails);

// Protected routes - require authentication
router.use(authMiddleware);

// Sponsor management
router.post('/register', [
  body('companyName').notEmpty().trim(),
  body('website').optional().isURL(),
  validate
], sponsorController.registerSponsor);

router.get('/profile', sponsorController.getSponsorProfile);
router.put('/profile', sponsorController.updateSponsorProfile);

// Campaign management
router.post('/campaigns', [
  body('name').notEmpty().trim(),
  body('type').isIn(['HOMEPAGE_HERO', 'PROJECT_SPONSORED', 'SEARCH_SPONSORED', 'TALENT_FEATURED', 'SIDEBAR_AD', 'PUSH_NOTIFICATION', 'EMAIL_SPOTLIGHT']),
  body('budget').isFloat({ min: 500 }),
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
  body('headline').notEmpty().trim().isLength({ max: 100 }),
  body('ctaText').notEmpty().trim(),
  body('ctaUrl').isURL(),
  validate
], sponsorController.createCampaign);

router.get('/campaigns', sponsorController.getMyCampaigns);
router.put('/campaigns/:id', sponsorController.updateCampaign);
router.post('/campaigns/:id/pause', sponsorController.pauseCampaign);
router.post('/campaigns/:id/resume', sponsorController.resumeCampaign);

// Analytics
router.get('/analytics/dashboard', sponsorController.getAnalyticsDashboard);
router.get('/analytics/campaigns/:id', sponsorController.getCampaignAnalytics);

// Payment
router.post('/campaigns/:id/fund', [
  param('id').isUUID(),
  body('amount').isFloat({ min: 500 }),
  body('paymentMethod').isIn(['stripe', 'hyperpay']),
  validate
], sponsorController.fundCampaign);

export default router;
