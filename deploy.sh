#!/bin/bash
set -e

echo "🚀 TalentNation One-Click Deploy"
echo "================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Install from https://nodejs.org${NC}"
    exit 1
fi

if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git not found. Install git first.${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js 18+ required. Current: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites met${NC}"

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -d "backend" ]; then
    echo -e "${YELLOW}⚠️  Run this script from the talentnation root directory${NC}"
    exit 1
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."

# Backend
echo "  → Backend..."
cd backend
npm install
cd ..

# Web
echo "  → Web..."
cd web
npm install
cd ..

echo -e "${GREEN}✅ Dependencies installed${NC}"

# Setup environment
echo ""
echo "⚙️  Setting up environment..."

if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo -e "${YELLOW}⚠️  Created backend/.env - Please edit with your credentials${NC}"
fi

# Generate Prisma client
echo "  → Generating Prisma client..."
cd backend
npx prisma generate
cd ..

# Database setup (if local)
echo ""
read -p "🗄️  Setup local database with Docker? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v docker &> /dev/null; then
        echo "  → Starting PostgreSQL and Redis..."
        docker-compose up -d db redis
        
        # Wait for database
        echo "  → Waiting for database..."
        sleep 5
        
        # Run migrations
        cd backend
        npx prisma migrate dev --name init
        cd ..
        
        echo -e "${GREEN}✅ Database ready${NC}"
    else
        echo -e "${YELLOW}⚠️  Docker not found. Skipping database setup.${NC}"
    fi
fi

# Build web app
echo ""
echo "🏗️  Building web application..."
cd web
npm run build
cd ..

echo -e "${GREEN}✅ Web app built${NC}"

# Deployment options
echo ""
echo "☁️  Choose deployment target:"
echo "  1) Render (Recommended - Free tier available)"
echo "  2) Railway (Easy - Free trial)"
echo "  3) Local development only"
echo "  4) Exit"

read -p "Select option (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🚀 Deploying to Render..."
        
        if ! command -v render &> /dev/null; then
            echo "  → Installing Render CLI..."
            npm install -g @render/cli
        fi
        
        # Check if logged in
        if ! render whoami &> /dev/null; then
            echo "  → Please login to Render:"
            render login
        fi
        
        # Create blueprint
        if [ ! -f "render.yaml" ]; then
            cat > render.yaml << 'EOF'
services:
  - type: web
    name: talentnation-api
    runtime: node
    repo: https://github.com/YOUR_USERNAME/talentnation
    buildCommand: cd backend && npm install && npm run build && npx prisma migrate deploy
    startCommand: cd backend && npm start
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: talentnation-db
          property: connectionString
      - key: REDIS_URL
        fromService:
          type: redis
          name: talentnation-redis
          property: connectionString
      - key: NODE_ENV
        value: production

  - type: web
    name: talentnation-web
    runtime: node
    repo: https://github.com/YOUR_USERNAME/talentnation
    buildCommand: cd web && npm install && npm run build
    startCommand: cd web && npm start

  - type: redis
    name: talentnation-redis
    ipAllowList: []
    plan: free

databases:
  - name: talentnation-db
    databaseName: talentnation
    user: talentnation
    plan: free
EOF
            echo -e "${YELLOW}⚠️  Created render.yaml - Please update with your GitHub repo URL${NC}"
        fi
        
        echo "  → Push to GitHub first:"
        echo "    git add ."
        echo "    git commit -m 'Ready for deploy'"
        echo "    git push origin main"
        echo ""
        echo "  → Then deploy via Render dashboard:"
        echo "    https://dashboard.render.com/blueprint/new"
        ;;
        
    2)
        echo ""
        echo "🚀 Deploying to Railway..."
        
        if ! command -v railway &> /dev/null; then
            echo "  → Installing Railway CLI..."
            npm install -g @railway/cli
        fi
        
        echo "  → Login to Railway:"
        railway login
        
        echo "  → Initialize project:"
        railway init
        
        echo "  → Add PostgreSQL database:"
        railway add --database postgres
        
        echo "  → Add Redis:"
        railway add --database redis
        
        echo "  → Deploy:"
        railway up
        ;;
        
    3)
        echo ""
        echo "💻 Starting local development servers..."
        
        # Start backend
        echo "  → Starting API server on http://localhost:3001"
        cd backend
        npm run dev &
        BACKEND_PID=$!
        cd ..
        
        # Start web
        echo "  → Starting web server on http://localhost:3000"
        cd web
        npm run dev &
        WEB_PID=$!
        cd ..
        
        echo ""
        echo -e "${GREEN}✅ Servers running!${NC}"
        echo "  API: http://localhost:3001"
        echo "  Web: http://localhost:3000"
        echo ""
        echo "Press Ctrl+C to stop"
        
        # Wait for interrupt
        wait $BACKEND_PID $WEB_PID
        ;;
        
    4)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid option${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}🎉 Setup complete!${NC}"
