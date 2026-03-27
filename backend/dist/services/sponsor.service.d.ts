import { CampaignStatus, CampaignType } from '@prisma/client';
interface CreateSponsorInput {
    userId: string;
    companyName: string;
    website?: string;
    logoUrl?: string;
}
interface CreateCampaignInput {
    sponsorId: string;
    name: string;
    type: CampaignType;
    budget: number;
    dailyBudget?: number;
    startDate: Date;
    endDate: Date;
    headline: string;
    description?: string;
    imageUrl?: string;
    ctaText: string;
    ctaUrl: string;
    targetAudience?: {
        skills?: string[];
        locations?: string[];
        minExperience?: number;
    };
}
export declare const sponsorService: {
    createSponsor(input: CreateSponsorInput): Promise<any>;
    getSponsorByUserId(userId: string): Promise<any>;
    updateSponsor(userId: string, data: Partial<CreateSponsorInput>): Promise<any>;
    createCampaign(input: CreateCampaignInput): Promise<any>;
    getCampaignsBySponsor(sponsorId: string): Promise<any>;
    getCampaignById(campaignId: string): Promise<any>;
    updateCampaign(campaignId: string, userId: string, data: Partial<CreateCampaignInput>): Promise<any>;
    updateCampaignStatus(campaignId: string, userId: string, status: CampaignStatus): Promise<any>;
    getActiveCampaigns(filters?: {
        type?: string;
        limit?: number;
    }): Promise<any>;
    recordImpression(campaignId: string): Promise<any>;
    recordClick(campaignId: string): Promise<any>;
    recordConversion(campaignId: string): Promise<any>;
    getAnalyticsDashboard(sponsorId: string): Promise<{
        activeCampaigns: any;
        totalSpend: any;
        totalImpressions: any;
        totalClicks: any;
        totalConversions: any;
        ctr: string;
        conversionRate: string;
        campaigns: any;
    }>;
    getCampaignAnalytics(campaignId: string, userId: string): Promise<any>;
    fundCampaign(input: {
        campaignId: string;
        userId: string;
        amount: number;
        paymentMethod: string;
    }): Promise<{
        campaignId: string;
        amount: number;
        status: string;
    }>;
};
export {};
//# sourceMappingURL=sponsor.service.d.ts.map