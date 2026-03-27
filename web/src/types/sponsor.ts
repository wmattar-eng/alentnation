export type CampaignType = 
  | 'HOMEPAGE_HERO' 
  | 'PROJECT_SPONSORED' 
  | 'SEARCH_SPONSORED' 
  | 'TALENT_FEATURED' 
  | 'SIDEBAR_AD' 
  | 'PUSH_NOTIFICATION' 
  | 'EMAIL_SPOTLIGHT';

export type CampaignStatus = 'PENDING' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'REJECTED';
export type CampaignTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

export interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  headline: string;
  description?: string;
  budget: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr?: number;
  sponsor?: {
    companyName: string;
    logoUrl?: string;
  };
}

export interface Sponsor {
  id: string;
  companyName: string;
  logoUrl?: string;
  website?: string;
  tier: CampaignTier;
  budgetTotal: number;
  budgetSpent: number;
  isActive: boolean;
}
