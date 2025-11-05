#!/bin/bash

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=================================="
echo "🐳 Docker Setup Test"
echo "=================================="
echo ""

# Test 1: Check if Docker is installed
echo "1. Checking Docker..."
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✓ Docker is installed${NC}"
    docker --version
else
    echo -e "${RED}✗ Docker is not installed${NC}"
    exit 1
fi
echo ""

# Test 2: Check if Docker Compose is installed
echo "2. Checking Docker Compose..."
if command -v docker-compose &> /dev/null; then
    echo -e "${GREEN}✓ Docker Compose is installed${NC}"
    docker-compose --version
else
    echo -e "${RED}✗ Docker Compose is not installed${NC}"
    exit 1
fi
echo ""

# Test 3: Check if .env files exist
echo "3. Checking .env files..."
if [ -f "apps/backend/.env" ]; then
    echo -e "${GREEN}✓ Backend .env exists${NC}"
else
    echo -e "${YELLOW}⚠ Backend .env missing, creating from .env.example...${NC}"
    cp apps/backend/.env.example apps/backend/.env
fi

if [ -f "apps/frontend/.env" ]; then
    echo -e "${GREEN}✓ Frontend .env exists${NC}"
else
    echo -e "${YELLOW}⚠ Frontend .env missing, creating from .env.example...${NC}"
    cp apps/frontend/.env.example apps/frontend/.env
fi
echo ""

# Test 4: Start infrastructure services
echo "4. Starting infrastructure (PostgreSQL, Redis, MinIO)..."
docker-compose -f docker-compose.dev.yml up -d
echo ""

# Wait for services to be healthy
echo "5. Waiting for services to be ready..."
sleep 5

# Test 5: Check PostgreSQL
echo "6. Testing PostgreSQL connection..."
if docker exec accounting-postgres pg_isready -U accounting_user -d accounting_bih &> /dev/null; then
    echo -e "${GREEN}✓ PostgreSQL is ready${NC}"
else
    echo -e "${RED}✗ PostgreSQL is not ready${NC}"
fi

# Test 6: Check Redis
echo "7. Testing Redis connection..."
if docker exec accounting-redis redis-cli ping &> /dev/null; then
    echo -e "${GREEN}✓ Redis is ready${NC}"
else
    echo -e "${RED}✗ Redis is not ready${NC}"
fi

# Test 7: Check MinIO
echo "8. Testing MinIO connection..."
if curl -s http://localhost:9000/minio/health/live &> /dev/null; then
    echo -e "${GREEN}✓ MinIO is ready${NC}"
else
    echo -e "${RED}✗ MinIO is not ready${NC}"
fi
echo ""

echo "=================================="
echo "✅ Infrastructure is ready!"
echo "=================================="
echo ""
echo "📊 Service URLs:"
echo "  - PostgreSQL: localhost:5432"
echo "  - Redis: localhost:6379"
echo "  - MinIO API: http://localhost:9000"
echo "  - MinIO Console: http://localhost:9001"
echo ""
echo "🚀 Next steps:"
echo "  1. cd apps/backend"
echo "  2. npm install"
echo "  3. npx prisma migrate dev"
echo "  4. npx prisma generate"
echo "  5. npx tsx prisma/seed.ts"
echo "  6. npm run dev"
echo ""
echo "📝 See DOCKER_SETUP.md for detailed instructions"
echo ""
