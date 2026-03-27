"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const app_1 = require("../../app");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// All admin routes require authentication + admin role
router.use(auth_middleware_1.authMiddleware);
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
        const [pendingCount, activeCount, totalRevenue, totalSponsors] = await Promise.all([
            app_1.prisma.sponsorCampaign.count({
                where: { status: 'PENDING' }
            }),
            app_1.prisma.sponsorCampaign.count({
                where: { status: 'ACTIVE' }
            }),
            app_1.prisma.sponsor.aggregate({
                _sum: { budgetTotal: true }
            }),
            app_1.prisma.sponsor.count()
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
// Get all campaigns (admin view)
router.get('/campaigns', async (req, res) => {
    try {
        const { status, page = '1', limit = '50' } = req.query;
        const where = {};
        if (status) {
            where.status = status;
        }
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const campaigns = await app_1.prisma.sponsorCampaign.findMany({
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
            take: parseInt(limit)
        });
        const total = await app_1.prisma.sponsorCampaign.count({ where });
        res.json({
            success: true,
            data: campaigns,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
// Approve campaign
router.post('/campaigns/:id/approve', async (req, res) => {
    try {
        const campaign = await app_1.prisma.sponsorCampaign.update({
            where: { id: req.params.id },
            data: { status: 'ACTIVE' }
        });
        // Create audit log
        await app_1.prisma.auditLog.create({
            data: {
                userId: req.user.id,
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
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});
// Reject campaign
router.post('/campaigns/:id/reject', async (req, res) => {
    try {
        const campaign = await app_1.prisma.sponsorCampaign.update({
            where: { id: req.params.id },
            data: { status: 'REJECTED' }
        });
        // Create audit log
        await app_1.prisma.auditLog.create({
            data: {
                userId: req.user.id,
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
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});
// Get platform revenue
router.get('/revenue', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const where = {
            status: 'HELD_IN_ESCROW'
        };
        if (startDate || endDate) {
            where.paidAt = {};
            if (startDate)
                where.paidAt.gte = new Date(startDate);
            if (endDate)
                where.paidAt.lte = new Date(endDate);
        }
        const payments = await app_1.prisma.payment.findMany({
            where
        });
        const totalPlatformFees = payments.reduce((sum, p) => sum + Number(p.platformFee), 0);
        const revenueByMonth = payments.reduce((acc, p) => {
            const month = p.paidAt?.toISOString().slice(0, 7); // YYYY-MM
            if (month) {
                acc[month] = (acc[month] || 0) + Number(p.platformFee);
            }
            return acc;
        }, {});
        res.json({
            success: true,
            data: {
                totalPlatformFees,
                totalTransactions: payments.length,
                revenueByMonth
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
exports.default = router;
//# sourceMappingURL=admin.routes.js.map