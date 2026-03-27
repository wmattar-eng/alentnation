#!/bin/bash

# Stripe Quick Setup Script
# This helps you configure Stripe for TalentNation

echo "💳 Stripe Setup for TalentNation"
echo "================================="
echo ""

# Check if running in production or test mode
read -p "Setup for (1) Test mode or (2) Live mode? [1]: " mode
mode=${mode:-1}

if [ "$mode" = "2" ]; then
    echo "⚠️  LIVE MODE - Real money will be charged!"
    read -p "Are you sure? Type 'yes' to continue: " confirm
    if [ "$confirm" != "yes" ]; then
        echo "Cancelled. Defaulting to test mode."
        mode=1
    fi
fi

echo ""
echo "Step 1: Get your API keys from Stripe Dashboard"
if [ "$mode" = "1" ]; then
    echo "   URL: https://dashboard.stripe.com/test/apikeys"
else
    echo "   URL: https://dashboard.stripe.com/apikeys"
fi
echo ""

# Get keys from user
read -p "Enter your Secret Key (sk_...): " secret_key
read -p "Enter your Publishable Key (pk_...): " publishable_key

echo ""
echo "Step 2: Webhook Setup"
echo "   Go to: https://dashboard.stripe.com/webhooks"
echo "   Click 'Add endpoint'"
echo ""

if [ "$mode" = "1" ]; then
    webhook_url="https://talentnation-api.onrender.com/api/v1/webhooks/stripe"
    echo "   Use this URL: $webhook_url"
else
    read -p "Enter your production API URL: " api_url
    webhook_url="$api_url/api/v1/webhooks/stripe"
fi

echo ""
echo "   Required webhook events:"
echo "   - payment_intent.succeeded"
echo "   - payment_intent.payment_failed"
echo "   - charge.succeeded"
echo "   - charge.refunded"
echo "   - invoice.payment_succeeded"
echo ""

read -p "Enter your Webhook Secret (whsec_...): " webhook_secret

# Update .env file
env_file="/root/.openclaw/workspace/talentnation/backend/.env.production"

if [ -f "$env_file" ]; then
    # Backup
    cp "$env_file" "$env_file.backup"
    
    # Update keys
    sed -i "s|STRIPE_SECRET_KEY=.*|STRIPE_SECRET_KEY=$secret_key|" "$env_file"
    sed -i "s|STRIPE_PUBLISHABLE_KEY=.*|STRIPE_PUBLISHABLE_KEY=$publishable_key|" "$env_file"
    sed -i "s|STRIPE_WEBHOOK_SECRET=.*|STRIPE_WEBHOOK_SECRET=$webhook_secret|" "$env_file"
    
    echo ""
    echo "✅ Stripe configured in .env.production"
else
    echo ""
    echo "⚠️  .env.production not found. Create it with:"
    echo ""
    echo "STRIPE_SECRET_KEY=$secret_key"
    echo "STRIPE_PUBLISHABLE_KEY=$publishable_key"
    echo "STRIPE_WEBHOOK_SECRET=$webhook_secret"
fi

echo ""
echo "🧪 Testing your setup..."
echo ""

# Test Stripe connection
if command -v curl &> /dev/null; then
    response=$(curl -s https://api.stripe.com/v1/account \
        -u "$secret_key:" \
        2>/dev/null)
    
    if echo "$response" | grep -q "\"id\":"; then
        echo "✅ Stripe connection successful!"
        echo "   Account: $(echo $response | grep -o '"id": "[^"]*"' | head -1)"
    else
        echo "❌ Stripe connection failed. Check your keys."
    fi
else
    echo "ℹ️  Install curl to test Stripe connection"
fi

echo ""
echo "📋 Summary:"
echo "==========="
echo "Mode: $([ "$mode" = "1" ] && echo "TEST" || echo "LIVE")"
echo "Secret Key: ${secret_key:0:15}..."
echo "Publishable Key: ${publishable_key:0:15}..."
echo "Webhook URL: $webhook_url"
echo ""
echo "🎯 Next steps:"
echo "1. Deploy your API to the webhook URL"
echo "2. Test payment with card: 4242 4242 4242 4242"
echo "3. Check webhook events in Stripe dashboard"
echo ""
echo "💰 Ready to accept payments!"
