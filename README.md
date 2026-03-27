# TalentNation — MVP Project Structure

```
talentnation/
├── mobile/                          # Flutter App (iOS + Android)
│   ├── lib/
│   │   ├── main.dart
│   │   ├── core/
│   │   │   ├── constants/
│   │   │   ├── theme/
│   │   │   ├── localization/        # en.json, ar.json
│   │   │   └── utils/
│   │   ├── data/
│   │   │   ├── models/
│   │   │   ├── repositories/
│   │   │   └── services/
│   │   ├── presentation/
│   │   │   ├── screens/
│   │   │   ├── widgets/
│   │   │   └── blocs/               # State management
│   │   └── config/
│   ├── android/
│   ├── ios/
│   └── pubspec.yaml
│
├── web/                             # Next.js Web App
│   ├── src/
│   │   ├── app/                     # App Router (Next.js 14)
│   │   │   ├── [locale]/            # i18n routing
│   │   │   ├── api/
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── store/                   # Zustand/Redux
│   │   └── styles/
│   ├── public/
│   ├── next.config.js
│   └── package.json
│
├── backend/                         # Node.js API
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── app.js
│   ├── prisma/                      # Database schema
│   ├── tests/
│   └── package.json
│
├── shared/                          # Shared types/contracts
│   ├── types/
│   ├── constants/
│   └── validation/
│
└── docs/                            # Documentation
    ├── ARCHITECTURE.md
    ├── API.md
    ├── DEPLOYMENT.md
    └── CHANGELOG.md
```

## Technology Stack

| Layer | Tech | Purpose |
|-------|------|---------|
| Mobile | Flutter 3.x | Cross-platform iOS/Android |
| Web | Next.js 14 + TypeScript | SSR, SEO, Performance |
| Backend | Node.js + Express | REST API |
| Database | PostgreSQL 15 | Primary datastore |
| Cache | Redis | Sessions, rate limiting |
| ORM | Prisma | Type-safe database access |
| Auth | JWT + Refresh tokens | Stateless authentication |
| i18n | intl (Flutter) / next-intl | Arabic/English support |
| Storage | AWS S3 / Cloudflare R2 | File uploads |
| Payments | Stripe + Hyperpay | International + Saudi payments |
| Search | Algolia / Meilisearch | Talent/project search |
| Real-time | Socket.io | Chat, notifications |

## Development Phases

### Phase 1: Foundation (Weeks 1-2)
- [ ] Project setup + CI/CD
- [ ] Database schema + migrations
- [ ] Authentication (email, Google, Apple)
- [ ] Basic user profiles

### Phase 2: Core Marketplace (Weeks 3-5)
- [ ] Project posting (clients)
- [ ] Talent profiles + portfolios
- [ ] Matching algorithm v1
- [ ] Proposal system

### Phase 3: Transactions (Weeks 6-7)
- [ ] Escrow payments
- [ ] Milestone tracking
- [ ] Invoicing
- [ ] Reviews system

### Phase 4: Polish (Week 8)
- [ ] Real-time chat
- [ ] Notifications
- [ ] Admin dashboard
- [ ] Saudi compliance features

---
*Generated: March 27, 2026*
