import { Request, Response } from 'express';
export declare const sponsorController: {
    registerSponsor(req: Request, res: Response): Promise<void>;
    getSponsorProfile(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateSponsorProfile(req: Request, res: Response): Promise<void>;
    createCampaign(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getMyCampaigns(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateCampaign(req: Request, res: Response): Promise<void>;
    pauseCampaign(req: Request, res: Response): Promise<void>;
    resumeCampaign(req: Request, res: Response): Promise<void>;
    getActiveCampaigns(req: Request, res: Response): Promise<void>;
    getCampaignDetails(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getAnalyticsDashboard(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getCampaignAnalytics(req: Request, res: Response): Promise<void>;
    fundCampaign(req: Request, res: Response): Promise<void>;
};
//# sourceMappingURL=sponsor.controller.d.ts.map