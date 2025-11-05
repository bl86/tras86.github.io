#!/bin/bash

# Setup Script for Accounting System BiH
# This script will set up the entire project from scratch

set -e  # Exit on error

echo "🚀 Setting up Accounting System BiH..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Docker is installed
echo "📦 Checking dependencies..."
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker is installed${NC}"
echo ""

# Step 1: Install dependencies
echo "📥 Installing dependencies..."
if [ ! -d "node_modules" ]; then
    npm install
else
    echo -e "${YELLOW}⚠️  node_modules already exists, skipping npm install${NC}"
fi
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 2: Start infrastructure services
echo "🐳 Starting infrastructure services (PostgreSQL, Redis, MinIO)..."
docker-compose -f docker-compose.dev.yml up -d

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

# Check PostgreSQL health
until docker exec accounting-postgres pg_isready -U accounting_user -d accounting_bih &> /dev/null; do
    echo "   Still waiting for PostgreSQL..."
    sleep 2
done
echo -e "${GREEN}✅ PostgreSQL is ready${NC}"
echo ""

# Step 3: Check if .env file exists in backend
if [ ! -f "apps/backend/.env" ]; then
    echo "📝 Creating .env file from .env.example..."
    if [ -f "apps/backend/.env.example" ]; then
        cp apps/backend/.env.example apps/backend/.env
        echo -e "${GREEN}✅ .env file created${NC}"
    else
        echo -e "${RED}❌ .env.example not found!${NC}"
        echo "Creating default .env file..."
        cat > apps/backend/.env << 'EOF'
NODE_ENV=development
PORT=3000

DATABASE_URL="postgresql://accounting_user:secure_password@localhost:5432/accounting_bih?schema=public"

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key-change-this-in-production-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

REDIS_URL=redis://localhost:6379

MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
MINIO_BUCKET_NAME=accounting-files

CORS_ORIGIN=http://localhost:5173

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

LOG_LEVEL=info
EOF
        echo -e "${GREEN}✅ Default .env file created${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  .env file already exists${NC}"
fi
echo ""

# Step 4: Generate Prisma Client
echo "🔧 Generating Prisma Client..."
cd apps/backend
npx prisma generate
echo -e "${GREEN}✅ Prisma Client generated${NC}"
echo ""

# Step 5: Run database migrations
echo "🗄️  Running database migrations..."
npx prisma migrate dev --name init --skip-generate
echo -e "${GREEN}✅ Database migrations completed${NC}"
echo ""

# Step 6: Seed database
echo "🌱 Seeding database with initial data..."
npx tsx prisma/seed.ts
echo -e "${GREEN}✅ Database seeded${NC}"
echo ""

cd ../..

# Summary
echo ""
echo "=========================================="
echo -e "${GREEN}✅ Setup completed successfully!${NC}"
echo "=========================================="
echo ""
echo "📋 What's running:"
echo "   - PostgreSQL: localhost:5432"
echo "   - Redis: localhost:6379"
echo "   - MinIO: localhost:9000 (Console: localhost:9001)"
echo ""
echo "🚀 To start the backend server:"
echo "   cd apps/backend && npm run dev"
echo ""
echo "📚 Test credentials (after seeding):"
echo "   Email: admin@accounting-bih.com"
echo "   Password: Admin123!"
echo ""
echo "🧪 To test the API:"
echo "   curl http://localhost:3000/health"
echo ""
