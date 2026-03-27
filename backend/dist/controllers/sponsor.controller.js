"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sponsorController = void 0;
const sponsor_service_1 = require("../services/sponsor.service");
exports.sponsorController = {
    // Register as a sponsor
    async registerSponsor(req, res) {
        try {
            const sponsor = await sponsor_service_1.sponsorService.createSponsor({
                userId: req.user.id,
                ...req.body
            });
            res.status(201).json({
                success: true,
                data: sponsor
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    },
    // Get sponsor profile
    async getSponsorProfile(req, res) {
        try {
            const sponsor = await sponsor_service_1.sponsorService.getSponsorByUserId(req.user.id);
            if (!sponsor) {
                return res.status(404).json({
                    success: false,
                    error: 'Sponsor profile not found'
                });
            }
            res.json({
                success: true,
                data: sponsor
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },
    // Update sponsor profile
    async updateSponsorProfile(req, res) {
        try {
            const sponsor = await sponsor_service_1.sponsorService.updateSponsor(req.user.id, req.body);
            res.json({
                success: true,
                data: sponsor
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    },
    // Create a new campaign
    async createCampaign(req, res) {
        try {
            const sponsor = await sponsor_service_1.sponsorService.getSponsorByUserId(req.user.id);
            if (!sponsor) {
                return res.status(403).json({
                    success: false,
                    error: 'Must be a registered sponsor to create campaigns'
                });
            }
            const campaign = await sponsor_service_1.sponsorService.createCampaign({
                sponsorId: sponsor.id,
                ...req.body
            });
            res.status(201).json({
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
    },
    // Get my campaigns
    async getMyCampaigns(req, res) {
        try {
            const sponsor = await sponsor_service_1.sponsorService.getSponsorByUserId(req.user.id);
            if (!sponsor) {
                return res.status(404).json({
                    success: false,
                    error: 'Sponsor profile not found'
                });
            }
            const campaigns = await sponsor_service_1.sponsorService.getCampaignsBySponsor(sponsor.id);
            res.json({
                success: true,
                data: campaigns
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },
    // Update campaign
    async updateCampaign(req, res) {
        try {
            const campaign = await sponsor_service_1.sponsorService.updateCampaign(req.params.id, req.user.id, req.body);
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
    },
    // Pause campaign
    async pauseCampaign(req, res) {
        try {
            const campaign = await sponsor_service_1.sponsorService.updateCampaignStatus(req.params.id, req.user.id, 'PAUSED');
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
    },
    // Resume campaign
    async resumeCampaign(req, res) {
        try {
            const campaign = await sponsor_service_1.sponsorService.updateCampaignStatus(req.params.id, req.user.id, 'ACTIVE');
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
    },
    // Get active campaigns (public)
    async getActiveCampaigns(req, res) {
        try {
            const { type, limit = '5' } = req.query;
            const campaigns = await sponsor_service_1.sponsorService.getActiveCampaigns({
                type: type,
                limit: parseInt(limit)
            });
            res.json({
                success: true,
                data: campaigns
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },
    // Get campaign details (public)
    async getCampaignDetails(req, res) {
        try {
            const campaign = await sponsor_service_1.sponsorService.getCampaignById(req.params.id);
            if (!campaign) {
                return res.status(404).json({
                    success: false,
                    error: 'Campaign not found'
                });
            }
            res.json({
                success: true,
                data: campaign
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },
    // Get analytics dashboard
    async getAnalyticsDashboard(req, res) {
        try {
            const sponsor = await sponsor_service_1.sponsorService.getSponsorByUserId(req.user.id);
            if (!sponsor) {
                return res.status(404).json({
                    success: false,
                    error: 'Sponsor profile not found'
                });
            }
            const analytics = await sponsor_service_1.sponsorService.getAnalyticsDashboard(sponsor.id);
            res.json({
                success: true,
                data: analytics
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },
    // Get campaign analytics
    async getCampaignAnalytics(req, res) {
        try {
            const analytics = await sponsor_service_1.sponsorService.getCampaignAnalytics(req.params.id, req.user.id);
            res.json({
                success: true,
                data: analytics
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    },
    // Fund campaign
    async fundCampaign(req, res) {
        try {
            const { amount, paymentMethod } = req.body;
            const payment = await sponsor_service_1.sponsorService.fundCampaign({
                campaignId: req.params.id,
                userId: req.user.id,
                amount: parseFloat(amount),
                paymentMethod
            });
            res.json({
                success: true,
                data: payment
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }
};
//# sourceMappingURL=sponsor.controller.js.map