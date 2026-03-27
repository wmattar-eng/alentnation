"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';
// In-memory store
const users = [];
const sponsors = [];
const campaigns = [
    {
        id: 'campaign-1',
        name: 'Summer Hiring Drive',
        type: 'PROJECT_SPONSORED',
        status: 'PENDING',
        headline: 'Looking for top designers',
        description: 'We need creative talent',
        budget: 5000,
        impressions: 0,
        clicks: 0,
        conversions: 0,
        sponsorId: 'sponsor-1',
        sponsor: { companyName: 'TechCorp Saudi', tier: 'GOLD' },
        createdAt: new Date().toISOString(),
    },
    {
        id: 'campaign-2',
        name: 'Vision 2030 Initiative',
        type: 'HOMEPAGE_HERO',
        status: 'ACTIVE',
        headline: 'Shape the future with us',
        description: 'Government digital initiative',
        budget: 50000,
        impressions: 15000,
        clicks: 450,
        conversions: 23,
        sponsorId: 'sponsor-2',
        sponsor: { companyName: 'Ministry of Digital', tier: 'VISION_2030' },
        createdAt: new Date().toISOString(),
    },
];
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: '*', credentials: true }));
app.use(express_1.default.json());
app.use((0, morgan_1.default)('dev'));
// Auth middleware
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token)
        return res.status(401).json({ error: 'No token' });
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch {
        res.status(401).json({ error: 'Invalid token' });
    }
};
// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        mode: 'LIVE_TEST_MODE',
        timestamp: new Date().toISOString(),
        stats: {
            users: users.length,
            sponsors: sponsors.length,
            campaigns: campaigns.length,
        },
    });
});
// Auth routes
app.post('/api/v1/auth/register', async (req, res) => {
    const { email, password, firstName, lastName, role } = req.body;
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
    const user = {
        id: 'user-' + Date.now(),
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role || 'CLIENT',
        createdAt: new Date(),
    };
    users.push(user);
    const token = jsonwebtoken_1.default.sign({ id: user.id, email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, data: { user: { ...user, password: undefined }, token } });
});
app.post('/api/v1/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    if (!user || !await bcryptjs_1.default.compare(password, user.password)) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jsonwebtoken_1.default.sign({ id: user.id, email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, data: { user: { ...user, password: undefined }, token } });
});
// Sponsor routes
app.post('/api/v1/sponsors/register', authMiddleware, (req, res) => {
    const { companyName, website, logoUrl } = req.body;
    const sponsor = {
        id: 'sponsor-' + Date.now(),
        userId: req.user.id,
        companyName,
        website,
        logoUrl,
        tier: 'BRONZE',
        budgetTotal: 0,
        budgetSpent: 0,
        isActive: true,
        createdAt: new Date(),
    };
    sponsors.push(sponsor);
    res.status(201).json({ success: true, data: sponsor });
});
app.get('/api/v1/sponsors/profile', authMiddleware, (req, res) => {
    const sponsor = sponsors.find(s => s.userId === req.user.id);
    if (!sponsor)
        return res.status(404).json({ error: 'Not found' });
    res.json({ success: true, data: sponsor });
});
app.post('/api/v1/sponsors/campaigns', authMiddleware, (req, res) => {
    const { name, type, headline, description, budget, ctaText, ctaUrl } = req.body;
    const sponsor = sponsors.find(s => s.userId === req.user.id);
    if (!sponsor)
        return res.status(403).json({ error: 'Not a sponsor' });
    const campaign = {
        id: 'campaign-' + Date.now(),
        sponsorId: sponsor.id,
        name,
        type,
        status: 'PENDING',
        headline,
        description,
        budget,
        ctaText,
        ctaUrl,
        impressions: 0,
        clicks: 0,
        conversions: 0,
        createdAt: new Date(),
    };
    campaigns.push(campaign);
    res.status(201).json({ success: true, data: campaign });
});
app.get('/api/v1/sponsors/campaigns', authMiddleware, (req, res) => {
    const sponsor = sponsors.find(s => s.userId === req.user.id);
    const myCampaigns = campaigns.filter(c => c.sponsorId === sponsor?.id);
    res.json({ success: true, data: myCampaigns });
});
app.get('/api/v1/sponsors/analytics/dashboard', authMiddleware, (req, res) => {
    const sponsor = sponsors.find(s => s.userId === req.user.id);
    const myCampaigns = campaigns.filter(c => c.sponsorId === sponsor?.id);
    const activeCampaigns = myCampaigns.filter(c => c.status === 'ACTIVE');
    const totalImpressions = myCampaigns.reduce((sum, c) => sum + (c.impressions || 0), 0);
    const totalClicks = myCampaigns.reduce((sum, c) => sum + (c.clicks || 0), 0);
    const totalSpend = myCampaigns.reduce((sum, c) => sum + (c.budget || 0), 0);
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions * 100).toFixed(2) : 0;
    res.json({
        success: true,
        data: {
            activeCampaigns: activeCampaigns.length,
            totalSpend,
            totalImpressions,
            totalClicks,
            totalConversions: 0,
            ctr,
            campaigns: myCampaigns,
        },
    });
});
// Admin routes
app.get('/api/v1/admin/stats', (req, res) => {
    res.json({
        success: true,
        data: {
            pendingCount: campaigns.filter(c => c.status === 'PENDING').length,
            activeCount: campaigns.filter(c => c.status === 'ACTIVE').length,
            totalRevenue: campaigns.reduce((sum, c) => sum + (c.budget || 0), 0),
            totalSponsors: sponsors.length,
        },
    });
});
app.get('/api/v1/admin/campaigns', (req, res) => {
    res.json({ success: true, data: campaigns });
});
app.post('/api/v1/admin/campaigns/:id/approve', (req, res) => {
    const campaign = campaigns.find(c => c.id === req.params.id);
    if (!campaign)
        return res.status(404).json({ error: 'Not found' });
    campaign.status = 'ACTIVE';
    res.json({ success: true, data: campaign });
});
app.post('/api/v1/admin/campaigns/:id/reject', (req, res) => {
    const campaign = campaigns.find(c => c.id === req.params.id);
    if (!campaign)
        return res.status(404).json({ error: 'Not found' });
    campaign.status = 'REJECTED';
    res.json({ success: true, data: campaign });
});
// Webhook routes
app.post('/api/v1/webhooks/stripe', (req, res) => {
    console.log('Stripe webhook:', req.body.type);
    res.json({ received: true });
});
app.post('/api/v1/webhooks/hyperpay', (req, res) => {
    console.log('Hyperpay webhook:', req.body);
    res.json({ received: true });
});
app.listen(PORT, () => {
    console.log(`🚀 TalentNation API LIVE on port ${PORT}`);
    console.log('');
    console.log('📚 Test Endpoints:');
    console.log(`   GET  http://localhost:${PORT}/health`);
    console.log(`   POST http://localhost:${PORT}/api/v1/auth/register`);
    console.log(`   POST http://localhost:${PORT}/api/v1/auth/login`);
    console.log(`   POST http://localhost:${PORT}/api/v1/sponsors/register`);
    console.log(`   GET  http://localhost:${PORT}/api/v1/sponsors/analytics/dashboard`);
    console.log(`   GET  http://localhost:${PORT}/api/v1/admin/campaigns`);
    console.log(`   POST http://localhost:${PORT}/api/v1/admin/campaigns/:id/approve`);
    console.log('');
    console.log('⚠️  MOCK MODE - Data resets on restart');
});
//# sourceMappingURL=server-mock.js.map