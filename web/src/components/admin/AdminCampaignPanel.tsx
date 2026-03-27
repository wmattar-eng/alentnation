'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Campaign } from '@/types/sponsor';

export function AdminCampaignPanel() {
  const t = useTranslations('admin');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [campaignsRes, statsRes] = await Promise.all([
        fetch('/api/v1/admin/campaigns'),
        fetch('/api/v1/admin/stats'),
      ]);

      if (campaignsRes.ok) {
        const data = await campaignsRes.json();
        setCampaigns(data.data);
      }

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedCampaign) return;

    try {
      const res = await fetch(`/api/v1/admin/campaigns/${selectedCampaign.id}/approve`, {
        method: 'POST',
      });

      if (res.ok) {
        fetchData();
        setSelectedCampaign(null);
        setActionType(null);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleReject = async () => {
    if (!selectedCampaign) return;

    try {
      const res = await fetch(`/api/v1/admin/campaigns/${selectedCampaign.id}/reject`, {
        method: 'POST',
      });

      if (res.ok) {
        fetchData();
        setSelectedCampaign(null);
        setActionType(null);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {stats?.pendingCount || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {stats?.activeCount || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {(stats?.totalRevenue || 0).toLocaleString()} SAR
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Sponsors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats?.totalSponsors || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList>
              <TabsTrigger value="pending">
                Pending ({campaigns.filter(c => c.status === 'PENDING').length})
              </TabsTrigger>
              <TabsTrigger value="active">
                Active ({campaigns.filter(c => c.status === 'ACTIVE').length})
              </TabsTrigger>
              <TabsTrigger value="all">All ({campaigns.length})</TabsTrigger>
            </TabsList>

            {['pending', 'active', 'all'].map((tab) => (
              <TabsContent key={tab} value={tab}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Sponsor</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns
                      .filter((c) => tab === 'all' || c.status.toLowerCase() === tab)
                      .map((campaign) => (
                        <TableRow key={campaign.id}>
                          <TableCell>
                            <div className="font-medium">{campaign.name}</div>
                            <div className="text-sm text-muted-foreground truncate max-w-xs">
                              {campaign.headline}
                            </div>
                          </TableCell>
                          <TableCell>{campaign.sponsor?.companyName}</TableCell>
                          <TableCell>{campaign.type}</TableCell>
                          <TableCell>{campaign.budget.toLocaleString()} SAR</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                campaign.status === 'ACTIVE'
                                  ? 'default'
                                  : campaign.status === 'PENDING'
                                  ? 'secondary'
                                  : 'outline'
                              }
                            >
                              {campaign.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedCampaign(campaign)}
                              >
                                Review
                              </Button>
                              {campaign.status === 'PENDING' && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      setSelectedCampaign(campaign);
                                      setActionType('approve');
                                    }}
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedCampaign(campaign);
                                      setActionType('reject');
                                    }}
                                  >
                                    Reject
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!selectedCampaign && !actionType} onOpenChange={() => setSelectedCampaign(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Campaign</DialogTitle>
          </DialogHeader>
          {selectedCampaign && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Campaign Name</label>
                  <p className="font-medium">{selectedCampaign.name}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Sponsor</label>
                  <p className="font-medium">{selectedCampaign.sponsor?.companyName}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Type</label>
                  <p className="font-medium">{selectedCampaign.type}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Budget</label>
                  <p className="font-medium">{selectedCampaign.budget.toLocaleString()} SAR</p>
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Headline</label>
                <p className="font-medium">{selectedCampaign.headline}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Description</label>
                <p>{selectedCampaign.description || 'No description'}</p>
              </div>
              <DialogFooter>
                {selectedCampaign.status === 'PENDING' && (
                  <>
                    <Button variant="outline" onClick={() => setSelectedCampaign(null)}>
                      Close
                    </Button>
                    <Button variant="destructive" onClick={handleReject}>
                      Reject
                    </Button>
                    <Button onClick={handleApprove}>Approve</Button>
                  </>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog open={!!actionType} onOpenChange={() => setActionType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve Campaign?' : 'Reject Campaign?'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve'
                ? 'This campaign will go live immediately.'
                : 'This campaign will be rejected and the sponsor notified.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionType(null)}>Cancel</Button>
            <Button
              variant={actionType === 'reject' ? 'destructive' : 'default'}
              onClick={actionType === 'approve' ? handleApprove : handleReject}
            >
              {actionType === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
