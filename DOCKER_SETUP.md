# 🐳 Docker Setup Guide

## Quick Start (Without Docker - Recommended for Development)

### 1. Start Infrastructure Only

Start only database, Redis, and MinIO:

```bash
docker-compose -f docker-compose.dev.yml up -d
```

This will start:
- PostgreSQL on port 5432
- Redis on port 6379
- MinIO on ports 9000 (API) and 9001 (Console)

### 2. Run Backend Locally

```bash
cd apps/backend

# Install dependencies (first time only)
npm install

# Run migrations (first time only)
npx prisma migrate dev

# Generate Prisma Client (first time only)
npx prisma generate

# Seed database (first time only)
npx tsx prisma/seed.ts

# Start development server
npm run dev
```

Backend will run on: http://localhost:3000

### 3. Run Frontend Locally

```bash
cd apps/frontend

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

Frontend will run on: http://localhost:5173

---

## Full Docker Setup (All Services)

### Prerequisites
- Docker Desktop installed
- Docker Compose v2.x+

### Start All Services

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

---

## Troubleshooting

### Issue: npm ci fails

**Solution**: Use npm install instead of npm ci (already fixed in Dockerfile)

### Issue: Puppeteer download fails

**Solution**: Set `PUPPETEER_SKIP_DOWNLOAD=true` (already set in Dockerfile)

### Issue: Database connection refused

**Solution**:
```bash
# Check if postgres is running
docker-compose ps

# Check postgres logs
docker-compose logs postgres

# Restart postgres
docker-compose restart postgres
```

### Issue: Port already in use

**Solution**:
```bash
# Find process using port 3000 (backend)
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different ports in docker-compose.yml
```

---

## Database Management

### Access PostgreSQL

```bash
# Using docker exec
docker exec -it accounting-postgres psql -U accounting_user -d accounting_bih

# Or using psql client
psql -h localhost -U accounting_user -d accounting_bih
```

### Run Migrations

```bash
# Inside backend container
docker exec -it accounting-backend npm run migrate

# Or locally
cd apps/backend
npm run migrate
```

### Seed Database

```bash
# Inside backend container
docker exec -it accounting-backend npm run seed

# Or locally
cd apps/backend
npm run seed
```

### Prisma Studio (Database GUI)

```bash
# Inside backend container
docker exec -it accounting-backend npm run studio

# Or locally
cd apps/backend
npm run studio
```

Access at: http://localhost:5555

---

## MinIO Management

Access MinIO Console: http://localhost:9001

Credentials:
- Username: `minioadmin`
- Password: `minioadmin123`

---

## Redis Management

```bash
# Connect to Redis CLI
docker exec -it accounting-redis redis-cli

# Check if Redis is working
docker exec -it accounting-redis redis-cli ping
# Expected output: PONG
```

---

## Environment Variables

### Backend (.env)

Located at: `apps/backend/.env`

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://accounting_user:secure_password@localhost:5432/accounting_bih
JWT_SECRET=your_jwt_secret_change_this
JWT_REFRESH_SECRET=your_refresh_secret_change_this
REDIS_URL=redis://localhost:6379
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
```

### Frontend (.env)

Located at: `apps/frontend/.env`

```env
VITE_API_URL=http://localhost:3000/api
```

---

## Testing Endpoints

### Health Check

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-05T10:30:00.000Z",
  "environment": "development",
  "version": "1.0.0"
}
```

### API Documentation

```bash
curl http://localhost:3000/api
```

### Login (after seeding)

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@accounting-bih.com",
    "password": "Admin123!"
  }'
```

---

## Performance Tips

### 1. Use Volume Mounts for Development

Already configured in docker-compose.yml:
```yaml
volumes:
  - ./apps/backend:/app
  - /app/node_modules
```

This enables hot-reload without rebuilding.

### 2. Increase Docker Resources

In Docker Desktop:
- Memory: 4GB minimum (8GB recommended)
- CPUs: 2 minimum (4 recommended)
- Disk: 20GB minimum

### 3. Clean Docker Cache

```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove everything
docker system prune -a --volumes
```

---

## Development Workflow

### Recommended Setup:

1. **Infrastructure in Docker**: PostgreSQL, Redis, MinIO
2. **Backend Locally**: For faster development and debugging
3. **Frontend Locally**: For faster hot-reload

```bash
# Terminal 1: Start infrastructure
docker-compose -f docker-compose.dev.yml up

# Terminal 2: Run backend
cd apps/backend && npm run dev

# Terminal 3: Run frontend
cd apps/frontend && npm run dev
```

---

## Production Deployment

### Build Images

```bash
# Build backend image
docker build -f docker/Dockerfile.backend -t accounting-backend:latest .

# Build frontend image
docker build -f docker/Dockerfile.frontend -t accounting-frontend:latest .
```

### Run Production Stack

```bash
# Use production profile
docker-compose --profile production up -d
```

---

## Support

If you encounter issues:

1. Check logs: `docker-compose logs -f`
2. Check container status: `docker-compose ps`
3. Restart services: `docker-compose restart`
4. Clean start: `docker-compose down -v && docker-compose up -d`

For further help, check:
- [Docker Documentation](https://docs.docker.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- Project README.md
