# TalentNation — Deployment & Infrastructure

## 🚀 Quick Deploy (30 minutes)

### Option 1: Render (Recommended for MVP)
**Cost: ~$25-50/month**

```yaml
# render.yaml
services:
  - type: web
    name: talentnation-api
    runtime: node
    buildCommand: npm install && npm run build && npx prisma migrate deploy
    startCommand: npm start
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: talentnation-db
          property: connectionString
      - key: REDIS_URL
        fromService:
          type: redis
          name: talentnation-redis
          property: connectionString
      - key: NODE_ENV
        value: production
      - key: JWT_SECRET
        generateValue: true
      - key: JWT_REFRESH_SECRET
        generateValue: true

  - type: web
    name: talentnation-web
    runtime: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NEXT_PUBLIC_API_URL
        fromService:
          type: web
          name: talentnation-api
          property: url

  - type: redis
    name: talentnation-redis
    ipAllowList: []

databases:
  - name: talentnation-db
    databaseName: talentnation
    user: talentnation
```

**Deploy:**
```bash
# 1. Push to GitHub
git init
git add .
git commit -m "Initial commit"
git push origin main

# 2. Connect to Render
# Go to render.com → New Blueprint Instance → Select repo
# Render auto-detects render.yaml and deploys everything
```

---

### Option 2: Railway (Easier, Slightly More Expensive)
**Cost: ~$50-80/month**

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login & deploy
railway login
railway init
railway add --database postgres
railway add --database redis
railway up
```

---

### Option 3: AWS/GCP (Production Scale)
**Cost: ~$100-300/month**

| Component | AWS | GCP |
|-----------|-----|-----|
| Compute | ECS Fargate | Cloud Run |
| Database | RDS PostgreSQL | Cloud SQL |
| Cache | ElastiCache Redis | Memorystore |
| Storage | S3 | Cloud Storage |
| CDN | CloudFront | Cloud CDN |

---

## 💰 Sponsorship & Monetization Strategy

### Revenue Streams

#### 1. **Featured Listings** (Primary)
```typescript
// Sponsor a project to appear at top
interface SponsoredProject {
  projectId: string;
  sponsorType: 'CLIENT' | 'AGENCY' | 'GOVERNMENT';
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  budget: number; // SAR
  duration: number; // days
  features: string[];
}

// Pricing (SAR/month)
const SPONSOR_TIERS = {
  BRONZE: { price: 500, features: ['Highlighted badge', 'Top 3 placement'] },
  SILVER: { price: 1500, features: ['Featured banner', 'Top placement', 'Analytics'] },
  GOLD: { price: 5000, features: ['Homepage spot', 'Push notifications', 'Priority matching'] },
  PLATINUM: { price: 15000, features: ['Exclusive placement', 'Dedicated account manager', 'Custom branding'] }
};
```

#### 2. **Talent Boost** (Freemium)
- Free: Basic profile, 5 proposals/month
- Pro (99 SAR/month): Unlimited proposals, featured profile, priority in search
- Premium (299 SAR/month): Verified badge, instant chat, analytics dashboard

#### 3. **Transaction Fees**
- Platform fee: 10-15% per contract
- Payment processing: Pass-through cost
- Escrow release: Free

#### 4. **Enterprise/Government Contracts**
- Custom pricing for bulk hiring
- API access for HR systems
- White-label options

---

## 🗄️ Smart Data Storage Strategy

### Database Tiers

#### Hot Data (PostgreSQL on Render/Railway)
- Users, projects, contracts
- Active conversations
- Current payments

#### Warm Data (Supabase - Free tier: 500MB)
- Old messages (>30 days)
- Completed contracts
- Historical proposals

#### Cold Data (AWS S3 Glacier - $0.004/GB)
- Archived projects
- Old attachments
- Audit logs >1 year

### File Storage
```typescript
// Intelligent file routing
interface StorageConfig {
  avatar: { provider: 'cloudinary', transform: 'auto' };
  portfolio: { provider: 'aws_s3', tier: 'standard' };
  documents: { provider: 'aws_s3', tier: 'infrequent' };
  backups: { provider: 'wasabi', tier: 'archive' };
}

// Costs:
// Cloudinary: Free 25GB, then $25/100GB
// AWS S3: $0.023/GB (standard), $0.0125/GB (IA)
// Wasabi: $6.99/TB (no egress fees)
```

---

## 🌍 Hosting Recommendations by Stage

### Stage 1: MVP (0-1,000 users)
**Cost: $25-50/month**

| Service | Provider | Cost |
|---------|----------|------|
| API + Web | Render | $19/month |
| Database | Render PostgreSQL | $7/month |
| Redis | Render Redis | $0 (included) |
| Storage | Cloudinary free tier | $0 |
| Domain | Namecheap | $10/year |
| **Total** | | **~$35/month** |

### Stage 2: Growth (1,000-10,000 users)
**Cost: $100-200/month**

| Service | Provider | Cost |
|---------|----------|------|
| API | Railway/Render Pro | $50/month |
| Database | Supabase/Neon | $25/month |
| CDN + Storage | Cloudflare R2 | $20/month |
| Search | Meilisearch Cloud | $30/month |
| **Total** | | **~$125/month** |

### Stage 3: Scale (10,000+ users)
**Cost: $500-1,500/month**

| Service | Provider | Cost |
|---------|----------|------|
| Kubernetes | AWS EKS/GKE | $200/month |
| Database | RDS/Cloud SQL | $200/month |
| Cache | ElastiCache | $100/month |
| CDN | CloudFront | $50-200/month |
| **Total** | | **~$600-800/month** |

---

## 🎯 Sponsorship Implementation

### Database Schema Additions

```prisma
// Add to schema.prisma

model Sponsor {
  id              String   @id @default(uuid())
  userId          String   @map("user_id")
  companyName     String   @map("company_name")
  logoUrl         String   @map("logo_url")
  website         String?
  tier            SponsorTier
  budgetTotal     Decimal  @map("budget_total") @db.Decimal(12, 2)
  budgetSpent     Decimal  @map("budget_spent") @db.Decimal(12, 2)
  isActive        Boolean  @default(true) @map("is_active")
  
  createdAt       DateTime @default(now()) @map("created_at")
  
  campaigns       SponsorCampaign[]
  
  @@map("sponsors")
}

model SponsorCampaign {
  id              String   @id @default(uuid())
  sponsorId       String   @map("sponsor_id")
  
  // Campaign Details
  name            String
  type            CampaignType
  targetAudience  Json     @map("target_audience") // {skills: [], locations: [], experience: []}
  
  // Budget & Duration
  budget          Decimal  @db.Decimal(10, 2)
  dailyBudget     Decimal? @map("daily_budget") @db.Decimal(10, 2)
  startDate       DateTime @map("start_date")
  endDate         DateTime @map("end_date")
  
  // Content
  headline        String
  description     String?
  imageUrl        String?  @map("image_url")
  ctaText         String   @map("cta_text") // "Apply Now", "Learn More"
  ctaUrl          String   @map("cta_url")
  
  // Performance
  impressions     Int      @default(0)
  clicks          Int      @default(0)
  conversions     Int      @default(0)
  
  status          CampaignStatus @default(PENDING)
  
  createdAt       DateTime @default(now()) @map("created_at")
  
  sponsor         Sponsor  @relation(fields: [sponsorId], references: [id])
  
  @@map("sponsor_campaigns")
}

enum SponsorTier {
  BRONZE
  SILVER
  GOLD
  PLATINUM
}

enum CampaignType {
  HOMEPAGE_HERO      // Large banner on homepage
  PROJECT_SPONSORED  // Sponsored project listing
  SEARCH_SPONSORED   // Sponsored in search results
  TALENT_FEATURED    // Featured talent profile
  SIDEBAR_AD         // Sidebar advertisement
  PUSH_NOTIFICATION  // Push notification ad
  EMAIL_SPOTLIGHT    // Featured in email digest
}

enum CampaignStatus {
  PENDING
  ACTIVE
  PAUSED
  COMPLETED
  REJECTED
}

// Add to Project model
model Project {
  // ... existing fields
  sponsorCampaignId String? @map("sponsor_campaign_id")
  sponsorCampaign   SponsorCampaign? @relation(fields: [sponsorCampaignId], references: [id])
  isSponsored       Boolean @default(false) @map("is_sponsored")
  sponsorRank       Int?    @map("sponsor_rank") // 1 = top placement
}
```

---

## 🔧 Deployment Scripts

### 1-Click Deploy Script
```bash
#!/bin/bash
# deploy.sh

echo "🚀 TalentNation Deployment"

# Check prerequisites
command -v git >/dev/null 2>&1 || { echo "❌ Git required"; exit 1; }

# Create project structure
echo "📁 Creating structure..."
mkdir -p talentnation-deploy
cd talentnation-deploy

# Clone or copy files
cp -r ../talentnation/* .

# Setup backend
echo "⚙️ Setting up backend..."
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed

# Setup web
echo "🌐 Setting up web..."
cd ../web
npm install
npm run build

# Deploy to Render (if CLI available)
if command -v render >/dev/null 2>&1; then
  echo "☁️ Deploying to Render..."
  render blueprint apply
else
  echo "⚠️ Install Render CLI for auto-deploy: npm i -g @render/cli"
  echo "📝 Or manually deploy via render.com/dashboard"
fi

echo "✅ Deployment complete!"
echo "🌐 Your app will be available at: https://talentnation-[random].onrender.com"
```

### Docker Compose (Local + Production)
```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/talentnation
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=dev-secret
    depends_on:
      - db
      - redis
    volumes:
      - ./backend:/app
      - /app/node_modules

  web:
    build: ./web
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:3001
    depends_on:
      - api

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=talentnation
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  # Sponsorship analytics
  analytics:
    image: plausible/analytics
    ports:
      - "8000:8000"
    environment:
      - BASE_URL=http://localhost:8000

volumes:
  postgres_data:
```

---

## 📊 Monitoring & Analytics Dashboard

### Sponsor ROI Tracking
```typescript
// src/services/sponsor-analytics.ts

interface SponsorMetrics {
  campaignId: string;
  impressions: number;
  clicks: number;
  ctr: number; // Click-through rate
  cpc: number; // Cost per click
  conversions: number;
  conversionRate: number;
  roas: number; // Return on ad spend
}

// Real-time sponsor dashboard data
export async function getSponsorDashboard(sponsorId: string) {
  return {
    activeCampaigns: await getActiveCampaigns(sponsorId),
    totalSpend: await getTotalSpend(sponsorId),
    impressions: await getImpressions(sponsorId),
    topPerforming: await getTopCampaigns(sponsorId, 5),
    audienceInsights: await getAudienceBreakdown(sponsorId)
  };
}
```

---

## 🎁 Smart Sponsor Features

### 1. Auto-Optimize Campaigns
```typescript
// AI-powered budget allocation
if (campaign.ctr < 0.02) {
  // Low click rate - suggest new creative
  await notifySponsor(sponsorId, 'Consider updating your ad creative');
}

if (campaign.conversionRate > 0.1) {
  // High conversion - auto-increase budget
  await autoScaleCampaign(campaignId, 1.5);
}
```

### 2. Targeted Sponsorship
```typescript
// Show sponsor only to relevant users
const shouldShowSponsor = (user: User, campaign: SponsorCampaign) => {
  const target = campaign.targetAudience;
  
  return (
    target.skills.some(s => user.skills.includes(s)) &&
    target.locations.includes(user.location) &&
    user.yearsExperience >= target.minExperience
  );
};
```

### 3. Government Partnership Tier
```typescript
// Special tier for Vision 2030 alignment
const GOVERNMENT_TIER = {
  name: 'Vision 2030 Partner',
  price: 50000, // SAR/month
  features: [
    'Official government badge',
    'Priority in "Government Projects" filter',
    'Dedicated landing page',
    'Press release support',
    'Ministry integration API'
  ]
};
```

---

## 💳 Payment Processing

### Stripe Setup (International)
```typescript
// src/services/payment/stripe.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

export async function createEscrowPayment(contractId: string, amount: number) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100, // Convert to cents/halalas
    currency: 'sar',
    metadata: { contractId, type: 'escrow' },
    capture_method: 'manual' // Hold in escrow
  });
  
  return paymentIntent.client_secret;
}

export async function releaseEscrow(paymentIntentId: string, talentStripeId: string) {
  // Transfer to talent minus platform fee
  const transfer = await stripe.transfers.create({
    amount: amount * 0.85 * 100, // 15% platform fee
    currency: 'sar',
    destination: talentStripeId
  });
  
  return transfer;
}
```

### Hyperpay Setup (Saudi)
```typescript
// src/services/payment/hyperpay.ts
// For Mada, STC Pay, local cards

export async function createHyperpaySession(amount: number, orderId: string) {
  const response = await fetch(`${HYPERPAY_BASE_URL}/v1/checkouts`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${HYPERPAY_TOKEN}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      entityId: HYPERPAY_ENTITY_ID,
      amount: amount.toFixed(2),
      currency: 'SAR',
      paymentType: 'DB', // Debit
      merchantTransactionId: orderId
    })
  });
  
  return response.json();
}
```

---

## ✅ Deployment Checklist

- [ ] Create GitHub repository
- [ ] Sign up for Render/Railway account
- [ ] Configure environment variables
- [ ] Setup Stripe account (test mode)
- [ ] Register Hyperpay account (Saudi payments)
- [ ] Configure custom domain
- [ ] Setup SSL certificate
- [ ] Configure backup schedule
- [ ] Setup monitoring (Sentry)
- [ ] Create sponsor onboarding flow
- [ ] Configure analytics (Mixpanel/Plausible)

---

*Ready to deploy! Choose your tier and run the deploy script.*
