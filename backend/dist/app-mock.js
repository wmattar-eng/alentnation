"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = exports.prisma = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// Routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const sponsor_routes_1 = __importDefault(require("./routes/sponsor.routes"));
const webhook_routes_1 = __importDefault(require("./routes/webhook.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
// Middleware
const error_middleware_1 = require("./middleware/error.middleware");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Security middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);
// Body parsing
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Logging
app.use((0, morgan_1.default)('dev'));
// Mock Prisma for testing
exports.prisma = {
    user: {
        findUnique: async () => null,
        create: async (data) => ({ id: 'mock-user-1', ...data.data }),
    },
    sponsor: {
        findUnique: async () => null,
        create: async (data) => ({
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
        create: async (data) => ({
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
        update: async ({ where, data }) => {
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
        create: async (data) => data,
    },
    $disconnect: async () => { },
};
// Mock Redis
exports.redis = {
    get: async () => null,
    set: async () => 'OK',
    quit: async () => { },
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
app.use('/api/v1/auth', auth_routes_1.default);
app.use('/api/v1/sponsors', sponsor_routes_1.default);
app.use('/api/v1/webhooks', webhook_routes_1.default);
app.use('/api/v1/admin', admin_routes_1.default);
// Error handling
app.use(error_middleware_1.errorHandler);
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
exports.default = app;
//# sourceMappingURL=app-mock.js.map