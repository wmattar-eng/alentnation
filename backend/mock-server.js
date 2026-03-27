const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3001;

// Mock data
const mockUsers = [
  { id: '1', email: 'talent@test.com', firstName: 'Ahmed', lastName: 'Al-Saud', role: 'TALENT' },
  { id: '2', email: 'client@test.com', firstName: 'Mohammed', lastName: 'Al-Rashid', role: 'CLIENT' }
];

const mockSponsors = [
  { id: '1', companyName: 'Tech Corp', tier: 'GOLD', userId: '2' }
];

const mockCampaigns = [
  { id: '1', title: 'Summer Campaign', type: 'HOMEPAGE_HERO', status: 'ACTIVE', budget: 5000 },
  { id: '2', title: 'Product Launch', type: 'SEARCH_SPONSORED', status: 'PENDING', budget: 2500 },
  { id: '3', title: 'Vision 2030 Initiative', type: 'EMAIL_SPOTLIGHT', status: 'ACTIVE', budget: 15000 }
];

// Middleware
app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    mode: 'MOCK_TEST_SERVER',
    timestamp: new Date().toISOString(),
    endpoints: [
      'POST /api/v1/auth/register',
      'POST /api/v1/auth/login',
      'GET  /api/v1/sponsors/campaigns',
      'POST /api/v1/sponsors/campaigns',
      'GET  /api/v1/admin/stats'
    ]
  });
});

// Auth routes
app.post('/api/v1/auth/register', (req, res) => {
  const { email, password, firstName, lastName, role } = req.body;
  const newUser = {
    id: String(mockUsers.length + 1),
    email,
    firstName,
    lastName,
    role: role || 'TALENT'
  };
  mockUsers.push(newUser);
  res.json({
    status: 'success',
    message: 'User registered successfully',
    data: {
      user: newUser,
      token: 'mock_jwt_token_' + Date.now()
    }
  });
});

app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = mockUsers.find(u => u.email === email);
  if (user) {
    res.json({
      status: 'success',
      data: {
        user,
        token: 'mock_jwt_token_' + Date.now()
      }
    });
  } else {
    res.status(401).json({ status: 'error', message: 'Invalid credentials' });
  }
});

// Sponsor routes
app.get('/api/v1/sponsors/campaigns', (req, res) => {
  res.json({
    status: 'success',
    data: mockCampaigns
  });
});

app.post('/api/v1/sponsors/campaigns', (req, res) => {
  const { title, type, budget } = req.body;
  const newCampaign = {
    id: String(mockCampaigns.length + 1),
    title,
    type: type || 'HOMEPAGE_HERO',
    status: 'PENDING',
    budget: budget || 500
  };
  mockCampaigns.push(newCampaign);
  res.json({
    status: 'success',
    message: 'Campaign created successfully',
    data: newCampaign
  });
});

// Admin routes
app.get('/api/v1/admin/stats', (req, res) => {
  res.json({
    status: 'success',
    data: {
      totalUsers: mockUsers.length,
      totalSponsors: mockSponsors.length,
      totalCampaigns: mockCampaigns.length,
      pendingCampaigns: mockCampaigns.filter(c => c.status === 'PENDING').length,
      activeCampaigns: mockCampaigns.filter(c => c.status === 'ACTIVE').length,
      totalRevenue: mockCampaigns.reduce((sum, c) => sum + c.budget, 0)
    }
  });
});

// Webhook routes (mock)
app.post('/api/v1/webhooks/stripe', (req, res) => {
  console.log('Stripe webhook received:', req.body.type);
  res.json({ received: true });
});

app.listen(PORT, () => {
  console.log(`🚀 Mock API Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
