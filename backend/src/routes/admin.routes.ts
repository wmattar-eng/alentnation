import { Router } from 'express';
import { prisma } from '../../app';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All admin routes require authentication + admin role
router.use(authMiddleware);
router.use(async (req, res, next) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }
  next();
});

// Get admin stats
router.get('/stats', async (req, res) => {
  try {
    const [
      pendingCount,
      activeCount,
      totalRevenue,
      totalSponsors
    ] = await Promise.all([
      prisma.sponsorCampaign.count({
        where: { status: 'PENDING' }
      }),
      prisma.sponsorCampaign.count({
        where: { status: 'ACTIVE' }
      }),
      prisma.sponsor.aggregate({
        _sum: { budgetTotal: true }
      }),
      prisma.sponsor.count()
    ]);

    res.json({
      success: true,
      data: {
        pendingCount,
        activeCount,
        totalRevenue: totalRevenue._sum.budgetTotal || 0,
        totalSponsors
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

// Get all campaigns (admin view)
router.get('/campaigns', async (req, res) => {
  try {
    const { status, page = '1', limit = '50' } = req.query;
    
    const where: any = {};
    if (status) {
      where.status = status;
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const campaigns = await prisma.sponsorCampaign.findMany({
      where,
      include: {
        sponsor: {
          select: {
            companyName: true,
            logoUrl: true,
            tier: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit as string)
    });

    const total = await prisma.sponsorCampaign.count({ where });

    res.json({
      success: true,
      data: campaigns,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

// Approve campaign
router.post('/campaigns/:id/approve', async (req, res) => {
  try {
    const campaign = await prisma.sponsorCampaign.update({
      where: { id: req.params.id },
      data: { status: 'ACTIVE' }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'CAMPAIGN_APPROVED',
        entityType: 'sponsor_campaign',
        entityId: campaign.id,
        metadata: { campaignName: campaign.name }
      }
    });

    res.json({
      success: true,
      data: campaign
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message
    });
  }
});

// Reject campaign
router.post('/campaigns/:id/reject', async (req, res) => {
  try {
    const campaign = await prisma.sponsorCampaign.update({
      where: { id: req.params.id },
      data: { status: 'REJECTED' }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'CAMPAIGN_REJECTED',
        entityType: 'sponsor_campaign',
        entityId: campaign.id,
        metadata: { campaignName: campaign.name }
      }
    });

    // TODO: Send notification to sponsor

    res.json({
      success: true,
      data: campaign
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message
    });
  }
});

// Get platform revenue
router.get('/revenue', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const where: any = {
      status: 'HELD_IN_ESCROW'
    };

    if (startDate || endDate) {
      where.paidAt = {};
      if (startDate) where.paidAt.gte = new Date(startDate as string);
      if (endDate) where.paidAt.lte = new Date(endDate as string);
    }

    const payments = await prisma.payment.findMany({
      where
    });

    const totalPlatformFees = payments.reduce(
      (sum, p) => sum + Number(p.platformFee),
      0
    );

    const revenueByMonth = payments.reduce((acc, p) => {
      const month = p.paidAt?.toISOString().slice(0, 7); // YYYY-MM
      if (month) {
        acc[month] = (acc[month] || 0) + Number(p.platformFee);
      }
      return acc;
    }, {} as Record<string, number>);

    res.json({
      success: true,
      data: {
        totalPlatformFees,
        totalTransactions: payments.length,
        revenueByMonth
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

export default router;
