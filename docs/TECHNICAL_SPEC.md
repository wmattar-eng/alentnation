# TalentNation — Technical Specification

## 1. Executive Summary

TalentNation is a bilingual (English/Arabic) talent marketplace platform connecting creative professionals with clients in Saudi Arabia. The platform supports the Kingdom's Vision 2030 by enabling job creation and economic growth in the creative economy.

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   Mobile App    │  │   Web Client    │  │   Admin Panel   │
│    (Flutter)    │  │   (Next.js)     │  │   (Next.js)     │
└────────┬────────┘  └────────┬────────┘  └────────┬────────┘
         │                    │                    │
         └────────────────────┼────────────────────┘
                              │ HTTPS / REST / WebSocket
                              ▼
              ┌───────────────────────────────┐
              │     Load Balancer (NGINX)     │
              └───────────────┬───────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │      API Gateway (Node.js)    │
              │   - Rate Limiting             │
              │   - Auth Validation           │
              │   - Request Routing           │
              └───────────────┬───────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
    ┌─────────────────┐           ┌─────────────────┐
    │  REST API       │           │  WebSocket      │
    │  (Express)      │           │  (Socket.io)    │
    │  - Business     │           │  - Real-time    │
    │    Logic        │           │    Chat         │
    │  - CRUD         │           │  - Notifications│
    └────────┬────────┘           └─────────────────┘
             │
    ┌────────┴────────┐
    ▼                 ▼
┌─────────┐    ┌─────────┐
│PostgreSQL│    │  Redis  │
│(Primary) │    │ (Cache) │
└─────────┘    └─────────┘
```

### 2.2 Deployment Architecture

- **Cloud Provider**: AWS / Google Cloud / Azure
- **Containerization**: Docker + Kubernetes
- **CI/CD**: GitHub Actions → Docker Hub → Kubernetes
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)

---

## 3. Technology Stack

### 3.1 Frontend

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Mobile | Flutter | 3.x | Cross-platform iOS/Android |
| Web | Next.js | 14.x | SSR, SEO, Performance |
| UI Framework | Tailwind CSS | 3.x | Styling |
| Components | shadcn/ui | - | Accessible components |
| State Management | Zustand | 4.x | Global state |
| Forms | React Hook Form + Zod | - | Form handling & validation |
| i18n | next-intl | 3.x | Internationalization |
| Maps | Google Maps API | - | Location services |

### 3.2 Backend

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Runtime | Node.js | 20 LTS | Server runtime |
| Framework | Express.js | 4.x | REST API |
| Language | TypeScript | 5.x | Type safety |
| ORM | Prisma | 5.x | Database access |
| Validation | Zod | 3.x | Schema validation |
| Auth | JWT + bcrypt | - | Authentication |
| Real-time | Socket.io | 4.x | Chat, notifications |
| Queue | Bull + Redis | - | Background jobs |
| Email | Nodemailer | - | Email delivery |
| SMS | Twilio | - | SMS notifications |

### 3.3 Database & Storage

| Component | Technology | Purpose |
|-----------|------------|---------|
| Primary DB | PostgreSQL 15 | Relational data |
| Cache | Redis 7 | Sessions, caching |
| Search | Meilisearch | Full-text search |
| Files | AWS S3 / R2 | File storage |
| CDN | CloudFront | Asset delivery |

### 3.4 External Services

| Service | Provider | Purpose |
|---------|----------|---------|
| Payments (Global) | Stripe | Credit cards, international |
| Payments (Saudi) | Hyperpay | Mada, STC Pay, local |
| Email | SendGrid / AWS SES | Transactional emails |
| Push Notifications | Firebase | Mobile push |
| Analytics | Mixpanel | User analytics |
| Error Tracking | Sentry | Error monitoring |
| Image Processing | Sharp (Node.js) | Image resizing |

---

## 4. Database Design

See `/backend/prisma/schema.prisma` for complete schema.

### 4.1 Core Entities

```
User
├── TalentProfile (1:1)
├── ClientProfile (1:1)
├── Skills (M:N)
├── PortfolioItems (1:N)
├── Projects (1:N as client)
├── Proposals (1:N)
├── Contracts (1:N)
├── Messages (1:N)
├── Reviews (1:N)
└── Notifications (1:N)

Project
├── Client (N:1)
├── Category (N:1)
├── Proposals (1:N)
├── Contract (1:1 optional)
└── Attachments (1:N)

Contract
├── Project (1:1)
├── Client (N:1)
├── Talent (N:1)
├── Milestones (1:N)
├── Payments (1:N)
└── Review (1:1 optional)
```

### 4.2 Key Indexes

- `users(email)` — Login lookups
- `users(role, status)` — Filtering by role
- `projects(client_id, status)` — Client dashboard
- `projects(category_id, status)` — Category browsing
- `proposals(talent_id, status)` — Talent's proposals
- `messages(conversation_id, created_at)` — Chat history
- `notifications(user_id, read)` — Unread notifications

---

## 5. API Design

### 5.1 Authentication

```
POST /auth/register          # Email/password registration
POST /auth/login             # Login
POST /auth/logout            # Logout
POST /auth/refresh           # Refresh access token
POST /auth/forgot-password   # Password reset request
POST /auth/reset-password    # Reset password with token
POST /auth/oauth/:provider   # Google, Apple OAuth
```

### 5.2 Users

```
GET    /users/me                    # Current user profile
PUT    /users/me                    # Update profile
PUT    /users/me/avatar             # Upload avatar
GET    /users/:id                   # Public profile
GET    /users/:id/portfolio         # User portfolio
```

### 5.3 Projects

```
GET    /projects                    # List projects (with filters)
POST   /projects                    # Create project
GET    /projects/:id                # Get project details
PUT    /projects/:id                # Update project
DELETE /projects/:id                # Delete project
POST   /projects/:id/publish        # Publish project

# Client endpoints
GET    /projects/my-projects        # Client's projects
GET    /projects/:id/proposals      # View proposals for project
```

### 5.4 Proposals

```
POST   /projects/:id/proposals      # Submit proposal
GET    /proposals                   # List my proposals
GET    /proposals/:id               # Get proposal details
PUT    /proposals/:id               # Update proposal
DELETE /proposals/:id               # Withdraw proposal
POST   /proposals/:id/accept        # Accept proposal (client)
POST   /proposals/:id/reject        # Reject proposal (client)
```

### 5.5 Contracts

```
GET    /contracts                   # List my contracts
GET    /contracts/:id               # Get contract details
POST   /contracts/:id/milestones    # Add milestone
PUT    /contracts/:id/milestones/:milestoneId  # Update milestone
POST   /contracts/:id/milestones/:milestoneId/submit    # Submit work
POST   /contracts/:id/milestones/:milestoneId/approve   # Approve work
```

### 5.6 Payments

```
POST   /payments/intent             # Create payment intent
POST   /payments/:id/release        # Release from escrow
POST   /payments/:id/refund         # Request refund
GET    /payments/history            # Payment history
```

### 5.7 Messaging

```
GET    /conversations               # List conversations
POST   /conversations               # Start conversation
GET    /conversations/:id/messages  # Get messages
POST   /conversations/:id/messages  # Send message
PUT    /conversations/:id/read      # Mark as read
```

---

## 6. Real-Time Features (WebSocket)

### 6.1 Events

```typescript
// Client → Server
'join_conversation', { conversationId }
'leave_conversation', { conversationId }
'send_message', { conversationId, content, attachments }
'typing_start', { conversationId }
'typing_end', { conversationId }

// Server → Client
'new_message', { message }
'user_typing', { userId, conversationId }
'notification', { notification }
'contract_update', { contractId, status }
'payment_received', { paymentId }
```

---

## 7. Security

### 7.1 Authentication Flow

```
┌──────────┐                    ┌──────────┐
│  Client  │ ──POST /login────▶ │  Server  │
└──────────┘                    └────┬─────┘
     ▲                               │
     │         { access, refresh }   │ Validate credentials
     │◄──────────────────────────────┤
     │                               │
     │ Subsequent requests           │
     ├─────Authorization: Bearer ───▶│
     │                               │
```

### 7.2 Security Measures

| Layer | Implementation |
|-------|---------------|
| Passwords | bcrypt with salt rounds 12 |
| Tokens | JWT (15 min) + Refresh (7 days) |
| HTTPS | TLS 1.3 required |
| Rate Limiting | 100 req/min per IP |
| CORS | Whitelist only |
| Input | Zod validation |
| SQL | Prisma ORM (parameterized) |
| XSS | Content Security Policy |
| File Uploads | Type validation, size limits, virus scan |

---

## 8. Internationalization (i18n)

### 8.1 Supported Languages

- **English** (en) — Default
- **Arabic** (ar) — RTL layout

### 8.2 Implementation

**Web (Next.js)**:
```typescript
// next.config.js
module.exports = {
  i18n: {
    locales: ['en', 'ar'],
    defaultLocale: 'en',
  },
}

// Locale-based routing: /en/projects, /ar/projects
```

**Mobile (Flutter)**:
```dart
MaterialApp(
  localizationsDelegates: [
    AppLocalizations.delegate,
    GlobalMaterialLocalizations.delegate,
    GlobalWidgetsLocalizations.delegate,
  ],
  supportedLocales: [Locale('en'), Locale('ar')],
  locale: currentLocale,
  builder: (context, child) {
    return Directionality(
      textDirection: isArabic ? TextDirection.rtl : TextDirection.ltr,
      child: child!,
    );
  },
)
```

### 8.3 Content Strategy

- Store translations in JSON files
- Use translation keys: `t('project.create.title')`
- Support dynamic content interpolation
- Date/number formatting per locale

---

## 9. Payment Flow

### 9.1 Escrow Model

```
1. Client creates project
2. Talent submits proposal
3. Client accepts proposal → Contract created
4. Client funds milestone (held in escrow)
5. Talent delivers work
6. Client approves → Funds released to talent
7. Platform fee deducted (10-20%)
```

### 9.2 Payment Methods

| Method | Provider | Use Case |
|--------|----------|----------|
| Credit Card | Stripe | International clients |
| Mada | Hyperpay | Saudi debit cards |
| STC Pay | Hyperpay | Mobile wallet |
| Apple Pay | Stripe | iOS users |
| Bank Transfer | Manual | Large corporate payments |

---

## 10. Deployment

### 10.1 Environments

| Environment | URL | Purpose |
|-------------|-----|---------|
| Development | localhost | Local development |
| Staging | staging.talentnation.sa | QA testing |
| Production | talentnation.sa | Live platform |

### 10.2 Docker Configuration

```yaml
# docker-compose.yml
version: '3.8'
services:
  api:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://...
      - REDIS_URL=redis://redis:6379
  
  web:
    build: ./web
    ports:
      - "3000:3000"
  
  postgres:
    image: postgres:15
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
```

---

## 11. Monitoring & Analytics

### 11.1 Key Metrics

| Category | Metrics |
|----------|---------|
| Performance | API response time, Error rate, Uptime |
| Business | User signups, Project postings, Successful contracts |
| Engagement | Daily active users, Messages sent, Time on platform |
| Financial | GMV, Platform revenue, Payment success rate |

### 11.2 Alerting

- PagerDuty integration for critical alerts
- Slack notifications for deployments
- Email alerts for failed payments

---

## 12. Development Roadmap

### Phase 1: Foundation (Weeks 1-2)
- [ ] Project setup & CI/CD
- [ ] Database schema implementation
- [ ] Authentication system
- [ ] Basic user profiles

### Phase 2: Core Marketplace (Weeks 3-5)
- [ ] Project creation & discovery
- [ ] Talent profiles with portfolios
- [ ] Proposal system
- [ ] Basic search & filtering

### Phase 3: Transactions (Weeks 6-7)
- [ ] Contract creation
- [ ] Milestone management
- [ ] Payment integration (Stripe)
- [ ] Saudi payment methods (Hyperpay)

### Phase 4: Communication (Week 8)
- [ ] Real-time messaging
- [ ] Push notifications
- [ ] Email notifications
- [ ] Review & rating system

### Phase 5: Polish & Launch (Weeks 9-10)
- [ ] Admin dashboard
- [ ] Analytics integration
- [ ] Performance optimization
- [ ] Security audit
- [ ] Beta launch

---

## 13. Appendix

### 13.1 Naming Conventions

- **Database**: snake_case, plural table names
- **API**: kebab-case endpoints
- **Code**: camelCase (JS/TS), PascalCase (classes/components)
- **Git**: conventional commits (`feat:`, `fix:`, `docs:`)

### 13.2 Code Style

- ESLint + Prettier for formatting
- Husky pre-commit hooks
- Conventional commit messages

---

*Document Version: 1.0*
*Last Updated: March 27, 2026*
