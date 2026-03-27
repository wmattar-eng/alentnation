import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// Routes
import authRoutes from './routes/auth.routes';
import sponsorRoutes from './routes/sponsor.routes';
import webhookRoutes from './routes/webhook.routes';
import adminRoutes from './routes/admin.routes';

// Middleware
import { errorHandler } from './middleware/error.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('dev'));

// Mock Prisma for testing
export const prisma = {
  user: {
    findUnique: async () => null,
    create: async (data: any) => ({ id: 'mock-user-1', ...data.data }),
  },
  sponsor: {
    findUnique: async () => null,
    create: async (data: any) => ({ 
      id: 'mock-sponsor-1', 
      companyName: data.data?.companyName || 'Test Company',
      tier: 'BRONZE',
      budgetTotal: 0,
      budgetSpent: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    findMany: async () => [],
    count: async () => 5,
    aggregate: async () => ({ _sum: { budgetTotal: 50000 } }),
  },
  sponsorCampaign: {
    findUnique: async () => null,
    create: async (data: any) => ({
      id: 'mock-campaign-' + Date.now(),
      ...data.data,
      status: 'PENDING',
      impressions: 0,
      clicks: 0,
      conversions: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    findMany: async () => mockCampaigns,
    count: async () => mockCampaigns.length,
    update: async ({ where, data }: any) => {
      const campaign = mockCampaigns.find(c => c.id === where.id);
      if (campaign) {
        Object.assign(campaign, data);
      }
      return campaign;
    },
  },
  payment: {
    findMany: async () => [],
  },
  auditLog: {
    create: async (data: any) => data,
  },
  $disconnect: async () => {},
};

// Mock Redis
export const redis = {
  get: async () => null,
  set: async () => 'OK',
  quit: async () => {},
};

// Mock campaigns for testing
const mockCampaigns = [
  {
    id: 'campaign-1',
    name: 'Summer Hiring Drive',
    type: 'PROJECT_SPONSORED',
    status: 'PENDING',
    headline: 'Looking for top designers',
    description: 'We need creative talent for our summer projects',
    budget: 5000,
    impressions: 0,
    clicks: 0,
    conversions: 0,
    sponsorId: 'sponsor-1',
    sponsor: { companyName: 'TechCorp Saudi', logoUrl: null, tier: 'GOLD' },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'campaign-2',
    name: 'Vision 2030 Initiative',
    type: 'HOMEPAGE_HERO',
    status: 'ACTIVE',
    headline: 'Shape the future with us',
    description: 'Join the largest government digital initiative',
    budget: 50000,
    impressions: 15000,
    clicks: 450,
    conversions: 23,
    sponsorId: 'sponsor-2',
    sponsor: { companyName: 'Ministry of Digital', logoUrl: null, tier: 'VISION_2030' },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    mode: 'MOCK_MODE - NO DATABASE',
    timestamp: new Date().toISOString(),
    endpoints: [
      'POST /api/v1/auth/register',
      'POST /api/v1/auth/login',
      'GET  /api/v1/sponsors/profile',
      'POST /api/v1/sponsors/campaigns',
      'GET  /api/v1/sponsors/analytics/dashboard',
      'GET  /api/v1/admin/stats',
      'GET  /api/v1/admin/campaigns',
    ]
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/sponsors', sponsorRoutes);
app.use('/api/v1/webhooks', webhookRoutes);
app.use('/api/v1/admin', adminRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} (MOCK MODE)`);
  console.log(`📚 Health check: http://localhost:${PORT}/health`);
  console.log(`💰 Sponsor API: http://localhost:${PORT}/api/v1/sponsors`);
  console.log(`⚠️  Running with MOCK DATA - no database needed`);
});

export default app;
