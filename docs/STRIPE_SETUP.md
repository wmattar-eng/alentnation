# Stripe Configuration for TalentNation

## Test Mode Setup (Use These First)

### Step 1: Create Stripe Account
1. Go to https://dashboard.stripe.com/register
2. Complete registration
3. Switch to "Test mode" (toggle in top right)

### Step 2: Get API Keys
In Test mode, go to Developers → API keys:

```
Publishable key: pk_test_...
Secret key:      sk_test_...
```

### Step 3: Setup Webhook
1. Go to Developers → Webhooks
2. Add endpoint: https://YOUR_API_URL/api/v1/webhooks/stripe
3. Select events:
   - payment_intent.succeeded
   - payment_intent.payment_failed
   - charge.succeeded
   - charge.refunded
   - invoice.payment_succeeded
   - customer.subscription.created

4. Copy webhook signing secret: `whsec_...`

### Step 4: Add to Environment

```bash
# Backend .env
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here  
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

## Test Cards

Use these for testing payments:

| Card Number | Result |
|-------------|--------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Declined |
| 4000 0000 0000 9995 | Insufficient funds |

Use any future expiry date and any 3-digit CVC.

## Testing Flow

1. Create sponsor account
2. Create campaign (500 SAR)
3. Click "Pay with Stripe"
4. Use test card 4242...
5. Payment succeeds → Campaign funded
6. Check webhook logs in Stripe dashboard

## Live Mode (After Testing)

1. Toggle to "Live mode" in Stripe
2. Get live API keys (sk_live_, pk_live_)
3. Update webhook URL to production domain
4. Replace test keys in environment
5. Deploy with live keys

## Stripe Connect (For Talent Payouts)

To pay talent directly:
1. Enable Stripe Connect in dashboard
2. Talent creates Connect account
3. Use transfers to send earnings
4. Platform takes fee on each transfer

## Fees

- Stripe: 2.9% + 0.30 SAR per transaction
- Your platform: 10-15% (you decide)
- Example: 1000 SAR payment
  - Stripe fee: 29.30 SAR
  - Your fee: 100 SAR
  - Talent gets: 870.70 SAR
