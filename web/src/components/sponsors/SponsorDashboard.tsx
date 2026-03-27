'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Campaign, CampaignStatus } from '@/types/sponsor';

const STATUS_COLORS: Record<CampaignStatus, string> = {
  PENDING: 'bg-yellow-500',
  ACTIVE: 'bg-green-500',
  PAUSED: 'bg-orange-500',
  COMPLETED: 'bg-blue-500',
  REJECTED: 'bg-red-500',
};

const STATUS_LABELS: Record<CampaignStatus, string> = {
  PENDING: 'Pending',
  ACTIVE: 'Active',
  PAUSED: 'Paused',
  COMPLETED: 'Completed',
  REJECTED: 'Rejected',
};

export function SponsorDashboard() {
  const t = useTranslations('sponsors');
  const [analytics, setAnalytics] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [analyticsRes, campaignsRes] = await Promise.all([
        fetch('/api/v1/sponsors/analytics/dashboard'),
        fetch('/api/v1/sponsors/campaigns'),
      ]);

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData.data);
      }

      if (campaignsRes.ok) {
        const campaignsData = await campaignsRes.json();
        setCampaigns(campaignsData.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePause = async (campaignId: string) => {
    await fetch(`/api/v1/sponsors/campaigns/${campaignId}/pause`, { method: 'POST' });
    fetchDashboardData();
  };

  const handleResume = async (campaignId: string) => {
    await fetch(`/api/v1/sponsors/campaigns/${campaignId}/resume`, { method: 'POST' });
    fetchDashboardData();
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('activeCampaigns')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics?.activeCampaigns || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('totalSpend')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {(analytics?.totalSpend || 0).toLocaleString()} SAR
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('totalImpressions')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {(analytics?.totalImpressions || 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('ctr')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics?.ctr || 0}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('myCampaigns')}</CardTitle>
            <Button variant="outline" onClick={() => window.location.href = '/sponsors/campaigns/new'}>
              {t('createCampaign')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active">
            <TabsList>
              <TabsTrigger value="active">{t('active')}</TabsTrigger>
              <TabsTrigger value="all">{t('all')}</TabsTrigger>
              <TabsTrigger value="completed">{t('completed')}</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              {campaigns.filter(c => c.status === 'ACTIVE').map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  onPause={() => handlePause(campaign.id)}
                />
              ))}
              {campaigns.filter(c => c.status === 'ACTIVE').length === 0 && (
                <p className="text-muted-foreground text-center py-8">{t('noActiveCampaigns')}</p>
              )}
            </TabsContent>

            <TabsContent value="all" className="space-y-4">
              {campaigns.map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  onPause={() => handlePause(campaign.id)}
                  onResume={() => handleResume(campaign.id)}
                />
              ))}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {campaigns.filter(c => c.status === 'COMPLETED').map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function CampaignCard({
  campaign,
  onPause,
  onResume,
}: {
  campaign: Campaign;
  onPause?: () => void;
  onResume?: () => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold">{campaign.name}</h4>
          <Badge className={STATUS_COLORS[campaign.status]}>
            {STATUS_LABELS[campaign.status]}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{campaign.headline}</p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>👁 {(campaign.impressions || 0).toLocaleString()}</span>
          <span>🖱 {(campaign.clicks || 0).toLocaleString()}</span>
          <span>📊 {campaign.ctr || 0}% CTR</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {campaign.status === 'ACTIVE' && onPause && (
          <Button variant="outline" size="sm" onClick={onPause}>
            Pause
          </Button>
        )}
        {campaign.status === 'PAUSED' && onResume && (
          <Button variant="outline" size="sm" onClick={onResume}>
            Resume
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={() => window.location.href = `/sponsors/campaigns/${campaign.id}`}>
          View
        </Button>
      </div>
    </div>
  );
}
