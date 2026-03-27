#!/bin/bash

# Deploy TalentNation to Render.com
# This script sets up the full production deployment

set -e

echo "🚀 Deploying TalentNation to Render.com"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if render CLI is installed
if ! command -v render &> /dev/null; then
    echo "${YELLOW}Installing Render CLI...${NC}"
    curl -fsSL https://raw.githubusercontent.com/render-oss/cli/main/install.sh | bash
    export PATH="$PATH:$HOME/.render/bin"
fi

# Check if logged in to Render
if ! render whoami &> /dev/null; then
    echo "${YELLOW}Please login to Render:${NC}"
    render login
fi

echo "${GREEN}✓ Render CLI ready${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "render.yaml" ]; then
    echo "${RED}Error: render.yaml not found${NC}"
    echo "Run this script from the talentnation directory"
    exit 1
fi

# Generate secure JWT secret
JWT_SECRET=$(openssl rand -base64 32)
echo "${GREEN}✓ Generated JWT secret${NC}"

# Create production env file if it doesn't exist
if [ ! -f "backend/.env.production" ]; then
    cat > backend/.env.production << EOF
NODE_ENV=production
PORT=10000
DATABASE_URL=
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=7d
FRONTEND_URL=
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
EOF
    echo "${YELLOW}⚠ Created backend/.env.production - update with your keys${NC}"
fi

echo ""
echo "📦 Preparing deployment..."
echo ""

# Git setup
echo "Setting up git..."
git add -A || true
git commit -m "Production deploy - $(date)" || true

echo "${GREEN}✓ Code committed${NC}"
echo ""

# Deploy
echo "🚀 Deploying to Render..."
echo ""
echo "This will create:"
echo "  1. PostgreSQL database"
echo "  2. Backend API service"
echo "  3. Web frontend (static)"
echo ""
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Cancelled."
    exit 0
fi

# Create blueprint on Render
render blueprint apply || {
    echo "${RED}Deploy failed. Common issues:${NC}"
    echo "  - Check render.yaml syntax"
    echo "  - Ensure you're logged in: render login"
    echo "  - Check Render dashboard for errors"
    exit 1
}

echo ""
echo "${GREEN}✅ Deployment initiated!${NC}"
echo ""
echo "Monitor at: https://dashboard.render.com"
echo ""
echo "Services will be available at:"
echo "  Web:    https://talentnation.onrender.com"
echo "  API:    https://talentnation-api.onrender.com"
echo ""
echo "⏳ Deployment takes 2-5 minutes..."
echo ""
echo "Next steps:"
echo "1. Wait for deploy to complete"
echo "2. Get database URL from Render dashboard"
echo "3. Add Stripe keys to environment variables"
echo "4. Setup Stripe webhook"
echo "5. Test payment flow"
