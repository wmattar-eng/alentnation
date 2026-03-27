# 🚀 TalentNation - Render.com Deployment Guide

This guide will walk you through deploying the TalentNation platform to Render.com.

## 📋 Prerequisites

- A [Render.com](https://render.com) account
- Git repository with your TalentNation code
- Stripe account (test mode)
- (Optional) Google Cloud account for OAuth

## 🚀 Quick Deploy (One-Click)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

Click the button above or follow the manual steps below.

## 🔧 Manual Deployment Steps

### 1. Fork/Push Code to Git Repository

Ensure your code is in a Git repository (GitHub, GitLab, or Bitbucket).

### 2. Create Blueprint on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **Blueprint**
3. Connect your Git repository
4. Select the `render.yaml` file
5. Click **Apply**

Render will automatically create:
- PostgreSQL database
- Redis cache
- Backend API service
- Frontend web service

### 3. Configure Environment Variables

After the initial deployment, you need to set the following secrets manually:

#### Backend Service (`talentnation-api`):

```bash
# Stripe (Test Mode)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (Gmail example)
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

To set these:
1. Go to Render Dashboard
2. Click on `talentnation-api` service
3. Go to **Environment** tab
4. Add each secret as an environment variable

### 4. Run Database Migrations

Once the services are deployed:

1. Go to `talentnation-api` service
2. Click **Shell** tab
3. Run: `npm run db:deploy`

### 5. (Optional) Seed Database

To add demo data:

```bash
# In the Render Shell for talentnation-api
npm run db:seed
```

Demo accounts created:
- Admin: `admin@talentnation.sa` / `admin123`
- Talent: `talent@example.com` / `talent123`
- Client: `client@example.com` / `client123`

### 6. Configure Stripe Webhooks

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/webhooks)
2. Click **Add endpoint**
3. Endpoint URL: `https://talentnation-api.onrender.com/api/v1/webhooks/stripe`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `invoice.payment_succeeded`
5. Copy the webhook secret to `STRIPE_WEBHOOK_SECRET`

### 7. Configure Google OAuth (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URI:
   ```
   https://talentnation-api.onrender.com/api/v1/auth/google/callback
   ```
4. Copy Client ID and Client Secret to environment variables

## 🔗 Service URLs

After deployment, your services will be available at:

| Service | URL Pattern |
|---------|-------------|
| Web App | `https://talentnation-web.onrender.com` |
| API | `https://talentnation-api.onrender.com` |
| Health Check | `https://talentnation-api.onrender.com/health` |

## 🔄 Auto-Deploy

By default, Render will auto-deploy when you push to the main branch. To disable:

1. Go to each service in Render Dashboard
2. Go to **Settings** tab
3. Toggle **Auto-Deploy** to **No**

## 📊 Monitoring

### Logs
- View logs in Render Dashboard for each service
- Or use: `render logs --service talentnation-api`

### Health Checks
- API Health: `https://talentnation-api.onrender.com/health`

### Metrics
- CPU/Memory usage available in Render Dashboard

## 🛠️ Troubleshooting

### Database Connection Issues

If the API can't connect to the database:

1. Check `DATABASE_URL` is correctly set
2. Ensure database is running (check status in Dashboard)
3. Run migrations: `npm run db:deploy`

### CORS Errors

If you see CORS errors in the browser:

1. Check `FRONTEND_URL` is set correctly in the API service
2. Verify the frontend URL matches what you're accessing

### Build Failures

If builds fail:

1. Check build logs in Render Dashboard
2. Ensure all environment variables are set
3. Verify `package.json` scripts are correct

### Migration Failures

If migrations fail:

```bash
# In Render Shell
npx prisma migrate reset --force  # WARNING: This deletes all data!
npx prisma migrate dev --name init
```

## 💰 Costs

Render pricing for this stack:

| Service | Plan | Monthly Cost |
|---------|------|--------------|
| PostgreSQL | Starter | ~$7 |
| Redis | Starter | ~$0 (free tier) |
| API | Standard | ~$7 |
| Web | Standard | ~$7 |
| **Total** | | **~$21/month** |

For production, upgrade to:
- PostgreSQL: Standard ($15+)
- API/Web: Pro ($25+ each)

## 🌍 Custom Domains

To use a custom domain:

1. Go to service settings in Render Dashboard
2. Click **Custom Domains**
3. Add your domain
4. Follow DNS configuration instructions
5. Update `FRONTEND_URL` environment variable

## 🔒 Security Checklist

- [ ] Change default JWT secrets
- [ ] Use strong database passwords
- [ ] Enable Stripe webhook verification
- [ ] Configure CORS properly
- [ ] Set up SSL (automatic on Render)
- [ ] Enable 2FA on Render account
- [ ] Review and rotate API keys regularly

## 📚 Additional Resources

- [Render Docs](https://render.com/docs)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Stripe Testing](https://stripe.com/docs/testing)

## 🆘 Support

For issues specific to TalentNation, check:
- Backend logs in Render Dashboard
- Browser DevTools Network tab for API errors
- Stripe Dashboard for payment issues
