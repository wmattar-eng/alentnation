'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CampaignType, CampaignTier } from '@/types/sponsor';

const CAMPAIGN_TYPES: { value: CampaignType; label: string; description: string }[] = [
  { value: 'HOMEPAGE_HERO', label: 'Homepage Hero', description: 'Large banner on homepage' },
  { value: 'PROJECT_SPONSORED', label: 'Featured Project', description: 'Sponsored project listing' },
  { value: 'SEARCH_SPONSORED', label: 'Search Result', description: 'Top placement in search' },
  { value: 'TALENT_FEATURED', label: 'Featured Talent', description: 'Promote talent profiles' },
  { value: 'SIDEBAR_AD', label: 'Sidebar Ad', description: 'Sidebar advertisement' },
  { value: 'PUSH_NOTIFICATION', label: 'Push Notification', description: 'Mobile push ad' },
  { value: 'EMAIL_SPOTLIGHT', label: 'Email Spotlight', description: 'Featured in email digest' },
];

const TIERS: { value: CampaignTier; label: string; price: number; features: string[] }[] = [
  { 
    value: 'BRONZE', 
    label: 'Bronze', 
    price: 500, 
    features: ['Highlighted badge', 'Top 3 placement', 'Basic analytics'] 
  },
  { 
    value: 'SILVER', 
    label: 'Silver', 
    price: 1500, 
    features: ['Featured banner', 'Top placement', 'Advanced analytics', 'Priority support'] 
  },
  { 
    value: 'GOLD', 
    label: 'Gold', 
    price: 5000, 
    features: ['Homepage spot', 'Push notifications', 'Dedicated account manager'] 
  },
  { 
    value: 'PLATINUM', 
    label: 'Platinum', 
    price: 15000, 
    features: ['Exclusive placement', 'Custom branding', 'API access', 'White-glove service'] 
  },
];

export function CreateCampaignForm() {
  const t = useTranslations('sponsors');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTier, setSelectedTier] = useState<CampaignTier>('BRONZE');
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'PROJECT_SPONSORED' as CampaignType,
    headline: '',
    description: '',
    ctaText: 'Apply Now',
    ctaUrl: '',
    budget: 500,
    duration: 30,
    targetSkills: '',
    targetLocations: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/v1/sponsors/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tier: selectedTier,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + formData.duration * 24 * 60 * 60 * 1000).toISOString(),
          targetAudience: {
            skills: formData.targetSkills.split(',').map(s => s.trim()).filter(Boolean),
            locations: formData.targetLocations.split(',').map(s => s.trim()).filter(Boolean),
          }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/sponsors/campaigns/${data.data.id}/payment`);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create campaign');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Tier Selection */}
      <Card>
        <CardHeader>
          <CardTitle>{t('selectTier')}</CardTitle>
          <CardDescription>{t('tierDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {TIERS.map((tier) => (
              <div
                key={tier.value}
                onClick={() => {
                  setSelectedTier(tier.value);
                  setFormData(prev => ({ ...prev, budget: tier.price }));
                }}
                className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedTier === tier.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <h3 className="font-bold text-lg">{tier.label}</h3>
                <p className="text-2xl font-bold text-primary mt-2">
                  {tier.price.toLocaleString()} SAR
                  <span className="text-sm text-muted-foreground font-normal">/mo</span>
                </p>
                <ul className="mt-4 space-y-2 text-sm">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Campaign Details */}
      <Card>
        <CardHeader>
          <CardTitle>{t('campaignDetails')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">{t('campaignName')}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('campaignNamePlaceholder')}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">{t('campaignType')}</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as CampaignType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CAMPAIGN_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-muted-foreground">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="headline">{t('headline')}</Label>
            <Input
              id="headline"
              value={formData.headline}
              onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
              placeholder={t('headlinePlaceholder')}
              maxLength={100}
              required
            />
            <p className="text-xs text-muted-foreground">
              {formData.headline.length}/100
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('description')}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('descriptionPlaceholder')}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="ctaText">{t('ctaText')}</Label>
              <Input
                id="ctaText"
                value={formData.ctaText}
                onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                placeholder="Apply Now"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ctaUrl">{t('ctaUrl')}</Label>
              <Input
                id="ctaUrl"
                type="url"
                value={formData.ctaUrl}
                onChange={(e) => setFormData({ ...formData, ctaUrl: e.target.value })}
                placeholder="https://..."
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Targeting */}
      <Card>
        <CardHeader>
          <CardTitle>{t('targeting')}</CardTitle>
          <CardDescription>{t('targetingDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="targetSkills">{t('targetSkills')}</Label>
            <Input
              id="targetSkills"
              value={formData.targetSkills}
              onChange={(e) => setFormData({ ...formData, targetSkills: e.target.value })}
              placeholder="UI Design, React, Node.js (comma separated)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetLocations">{t('targetLocations')}</Label>
            <Input
              id="targetLocations"
              value={formData.targetLocations}
              onChange={(e) => setFormData({ ...formData, targetLocations: e.target.value })}
              placeholder="Riyadh, Jeddah, Dammam (comma separated)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">{t('duration')}</Label>
            <Select
              value={formData.duration.toString()}
              onValueChange={(value) => setFormData({ ...formData, duration: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">1 Week</SelectItem>
                <SelectItem value="14">2 Weeks</SelectItem>
                <SelectItem value="30">1 Month</SelectItem>
                <SelectItem value="90">3 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Budget */}
      <Card>
        <CardHeader>
          <CardTitle>{t('budget')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="font-medium">{t('totalBudget')}</p>
              <p className="text-sm text-muted-foreground">
                {formData.duration} days · {selectedTier} tier
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">
                {formData.budget.toLocaleString()} SAR
              </p>
              <p className="text-sm text-muted-foreground">{t('platformFeeIncluded')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={isLoading}>
          {isLoading ? t('creating') : t('createAndPay')}
        </Button>
      </div>
    </form>
  );
}
