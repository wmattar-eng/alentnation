import { Request, Response } from 'express';
import { sponsorService } from '../services/sponsor.service';
import { prisma } from '../app';

export const sponsorController = {
  // Register as a sponsor
  async registerSponsor(req: Request, res: Response) {
    try {
      const sponsor = await sponsorService.createSponsor({
        userId: req.user!.id,
        ...req.body
      });
      
      res.status(201).json({
        success: true,
        data: sponsor
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: (error as Error).message
      });
    }
  },

  // Get sponsor profile
  async getSponsorProfile(req: Request, res: Response) {
    try {
      const sponsor = await sponsorService.getSponsorByUserId(req.user!.id);
      
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
    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error as Error).message
      });
    }
  },

  // Update sponsor profile
  async updateSponsorProfile(req: Request, res: Response) {
    try {
      const sponsor = await sponsorService.updateSponsor(req.user!.id, req.body);
      
      res.json({
        success: true,
        data: sponsor
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: (error as Error).message
      });
    }
  },

  // Create a new campaign
  async createCampaign(req: Request, res: Response) {
    try {
      const sponsor = await sponsorService.getSponsorByUserId(req.user!.id);
      
      if (!sponsor) {
        return res.status(403).json({
          success: false,
          error: 'Must be a registered sponsor to create campaigns'
        });
      }
      
      const campaign = await sponsorService.createCampaign({
        sponsorId: sponsor.id,
        ...req.body
      });
      
      res.status(201).json({
        success: true,
        data: campaign
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: (error as Error).message
      });
    }
  },

  // Get my campaigns
  async getMyCampaigns(req: Request, res: Response) {
    try {
      const sponsor = await sponsorService.getSponsorByUserId(req.user!.id);
      
      if (!sponsor) {
        return res.status(404).json({
          success: false,
          error: 'Sponsor profile not found'
        });
      }
      
      const campaigns = await sponsorService.getCampaignsBySponsor(sponsor.id);
      
      res.json({
        success: true,
        data: campaigns
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error as Error).message
      });
    }
  },

  // Update campaign
  async updateCampaign(req: Request, res: Response) {
    try {
      const campaign = await sponsorService.updateCampaign(
        req.params.id,
        req.user!.id,
        req.body
      );
      
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
  },

  // Pause campaign
  async pauseCampaign(req: Request, res: Response) {
    try {
      const campaign = await sponsorService.updateCampaignStatus(
        req.params.id,
        req.user!.id,
        'PAUSED'
      );
      
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
  },

  // Resume campaign
  async resumeCampaign(req: Request, res: Response) {
    try {
      const campaign = await sponsorService.updateCampaignStatus(
        req.params.id,
        req.user!.id,
        'ACTIVE'
      );
      
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
  },

  // Get active campaigns (public)
  async getActiveCampaigns(req: Request, res: Response) {
    try {
      const { type, limit = '5' } = req.query;
      
      const campaigns = await sponsorService.getActiveCampaigns({
        type: type as string,
        limit: parseInt(limit as string)
      });
      
      res.json({
        success: true,
        data: campaigns
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error as Error).message
      });
    }
  },

  // Get campaign details (public)
  async getCampaignDetails(req: Request, res: Response) {
    try {
      const campaign = await sponsorService.getCampaignById(req.params.id);
      
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
    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error as Error).message
      });
    }
  },

  // Get analytics dashboard
  async getAnalyticsDashboard(req: Request, res: Response) {
    try {
      const sponsor = await sponsorService.getSponsorByUserId(req.user!.id);
      
      if (!sponsor) {
        return res.status(404).json({
          success: false,
          error: 'Sponsor profile not found'
        });
      }
      
      const analytics = await sponsorService.getAnalyticsDashboard(sponsor.id);
      
      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error as Error).message
      });
    }
  },

  // Get campaign analytics
  async getCampaignAnalytics(req: Request, res: Response) {
    try {
      const analytics = await sponsorService.getCampaignAnalytics(
        req.params.id,
        req.user!.id
      );
      
      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: (error as Error).message
      });
    }
  },

  // Fund campaign
  async fundCampaign(req: Request, res: Response) {
    try {
      const { amount, paymentMethod } = req.body;
      
      const payment = await sponsorService.fundCampaign({
        campaignId: req.params.id,
        userId: req.user!.id,
        amount: parseFloat(amount),
        paymentMethod
      });
      
      res.json({
        success: true,
        data: payment
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: (error as Error).message
      });
    }
  }
};
