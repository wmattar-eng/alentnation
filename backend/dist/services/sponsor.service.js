"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sponsorService = void 0;
const app_1 = require("../app");
exports.sponsorService = {
    // Create a new sponsor
    async createSponsor(input) {
        return app_1.prisma.sponsor.create({
            data: {
                userId: input.userId,
                companyName: input.companyName,
                website: input.website,
                logoUrl: input.logoUrl,
                tier: 'BRONZE',
                budgetTotal: 0,
                budgetSpent: 0
            }
        });
    },
    // Get sponsor by user ID
    async getSponsorByUserId(userId) {
        return app_1.prisma.sponsor.findUnique({
            where: { userId },
            include: {
                campaigns: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });
    },
    // Update sponsor
    async updateSponsor(userId, data) {
        const sponsor = await app_1.prisma.sponsor.findUnique({
            where: { userId }
        });
        if (!sponsor) {
            throw new Error('Sponsor not found');
        }
        return app_1.prisma.sponsor.update({
            where: { id: sponsor.id },
            data
        });
    },
    // Create a new campaign
    async createCampaign(input) {
        // Check sponsor tier limits
        const sponsor = await app_1.prisma.sponsor.findUnique({
            where: { id: input.sponsorId }
        });
        if (!sponsor) {
            throw new Error('Sponsor not found');
        }
        // Validate budget against tier
        const tierLimits = {
            BRONZE: 10000,
            SILVER: 50000,
            GOLD: 200000,
            PLATINUM: Infinity
        };
        if (input.budget > tierLimits[sponsor.tier]) {
            throw new Error(`Budget exceeds ${sponsor.tier} tier limit`);
        }
        return app_1.prisma.sponsorCampaign.create({
            data: {
                sponsorId: input.sponsorId,
                name: input.name,
                type: input.type,
                budget: input.budget,
                dailyBudget: input.dailyBudget,
                startDate: input.startDate,
                endDate: input.endDate,
                headline: input.headline,
                description: input.description,
                imageUrl: input.imageUrl,
                ctaText: input.ctaText,
                ctaUrl: input.ctaUrl,
                targetAudience: input.targetAudience || {},
                status: 'PENDING'
            }
        });
    },
    // Get campaigns by sponsor
    async getCampaignsBySponsor(sponsorId) {
        return app_1.prisma.sponsorCampaign.findMany({
            where: { sponsorId },
            orderBy: { createdAt: 'desc' }
        });
    },
    // Get campaign by ID
    async getCampaignById(campaignId) {
        return app_1.prisma.sponsorCampaign.findUnique({
            where: { id: campaignId },
            include: {
                sponsor: {
                    select: {
                        companyName: true,
                        logoUrl: true
                    }
                }
            }
        });
    },
    // Update campaign
    async updateCampaign(campaignId, userId, data) {
        const sponsor = await app_1.prisma.sponsor.findUnique({
            where: { userId }
        });
        if (!sponsor) {
            throw new Error('Sponsor not found');
        }
        const campaign = await app_1.prisma.sponsorCampaign.findFirst({
            where: {
                id: campaignId,
                sponsorId: sponsor.id
            }
        });
        if (!campaign) {
            throw new Error('Campaign not found or unauthorized');
        }
        return app_1.prisma.sponsorCampaign.update({
            where: { id: campaignId },
            data
        });
    },
    // Update campaign status
    async updateCampaignStatus(campaignId, userId, status) {
        const sponsor = await app_1.prisma.sponsor.findUnique({
            where: { userId }
        });
        if (!sponsor) {
            throw new Error('Sponsor not found');
        }
        const campaign = await app_1.prisma.sponsorCampaign.findFirst({
            where: {
                id: campaignId,
                sponsorId: sponsor.id
            }
        });
        if (!campaign) {
            throw new Error('Campaign not found or unauthorized');
        }
        return app_1.prisma.sponsorCampaign.update({
            where: { id: campaignId },
            data: { status }
        });
    },
    // Get active campaigns for display
    async getActiveCampaigns(filters = {}) {
        const where = {
            status: 'ACTIVE',
            startDate: { lte: new Date() },
            endDate: { gte: new Date() }
        };
        if (filters.type) {
            where.type = filters.type;
        }
        return app_1.prisma.sponsorCampaign.findMany({
            where,
            take: filters.limit || 5,
            orderBy: [
                { sponsor: { tier: 'desc' } }, // Higher tiers first
                { createdAt: 'desc' }
            ],
            include: {
                sponsor: {
                    select: {
                        companyName: true,
                        logoUrl: true,
                        tier: true
                    }
                }
            }
        });
    },
    // Record impression
    async recordImpression(campaignId) {
        return app_1.prisma.sponsorCampaign.update({
            where: { id: campaignId },
            data: {
                impressions: { increment: 1 }
            }
        });
    },
    // Record click
    async recordClick(campaignId) {
        return app_1.prisma.sponsorCampaign.update({
            where: { id: campaignId },
            data: {
                clicks: { increment: 1 }
            }
        });
    },
    // Record conversion
    async recordConversion(campaignId) {
        return app_1.prisma.sponsorCampaign.update({
            where: { id: campaignId },
            data: {
                conversions: { increment: 1 }
            }
        });
    },
    // Get analytics dashboard
    async getAnalyticsDashboard(sponsorId) {
        const campaigns = await app_1.prisma.sponsorCampaign.findMany({
            where: { sponsorId }
        });
        const activeCampaigns = campaigns.filter(c => c.status === 'ACTIVE').length;
        const totalSpend = campaigns.reduce((sum, c) => sum + Number(c.budget), 0);
        const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0);
        const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
        const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
        const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
        const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
        return {
            activeCampaigns,
            totalSpend,
            totalImpressions,
            totalClicks,
            totalConversions,
            ctr: ctr.toFixed(2),
            conversionRate: conversionRate.toFixed(2),
            campaigns: campaigns.map(c => ({
                id: c.id,
                name: c.name,
                status: c.status,
                budget: c.budget,
                impressions: c.impressions,
                clicks: c.clicks,
                conversions: c.conversions,
                ctr: c.impressions > 0 ? ((c.clicks / c.impressions) * 100).toFixed(2) : 0
            }))
        };
    },
    // Get campaign analytics
    async getCampaignAnalytics(campaignId, userId) {
        const sponsor = await app_1.prisma.sponsor.findUnique({
            where: { userId }
        });
        if (!sponsor) {
            throw new Error('Sponsor not found');
        }
        const campaign = await app_1.prisma.sponsorCampaign.findFirst({
            where: {
                id: campaignId,
                sponsorId: sponsor.id
            }
        });
        if (!campaign) {
            throw new Error('Campaign not found');
        }
        const ctr = campaign.impressions > 0
            ? ((campaign.clicks / campaign.impressions) * 100).toFixed(2)
            : 0;
        const conversionRate = campaign.clicks > 0
            ? ((campaign.conversions / campaign.clicks) * 100).toFixed(2)
            : 0;
        return {
            ...campaign,
            ctr,
            conversionRate
        };
    },
    // Fund campaign
    async fundCampaign(input) {
        const sponsor = await app_1.prisma.sponsor.findUnique({
            where: { userId: input.userId }
        });
        if (!sponsor) {
            throw new Error('Sponsor not found');
        }
        const campaign = await app_1.prisma.sponsorCampaign.findFirst({
            where: {
                id: input.campaignId,
                sponsorId: sponsor.id
            }
        });
        if (!campaign) {
            throw new Error('Campaign not found');
        }
        // Update sponsor budget
        await app_1.prisma.sponsor.update({
            where: { id: sponsor.id },
            data: {
                budgetTotal: { increment: input.amount }
            }
        });
        // Activate campaign if pending
        if (campaign.status === 'PENDING') {
            await app_1.prisma.sponsorCampaign.update({
                where: { id: input.campaignId },
                data: { status: 'ACTIVE' }
            });
        }
        // TODO: Integrate with payment provider
        return {
            campaignId: input.campaignId,
            amount: input.amount,
            status: 'completed'
        };
    }
};
//# sourceMappingURL=sponsor.service.js.map