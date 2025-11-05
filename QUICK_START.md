# ⚡ Quick Start Guide

## 🚀 Fastest Way to Get Started (5 minutes)

### Option 1: Infrastructure in Docker + Local Development (Recommended)

This is the fastest and most flexible approach for development.

#### Step 1: Start Infrastructure Services

```bash
# Start PostgreSQL, Redis, and MinIO in Docker
docker-compose -f docker-compose.dev.yml up -d

# Check if services are running
docker-compose -f docker-compose.dev.yml ps
```

#### Step 2: Setup Backend

```bash
cd apps/backend

# Install dependencies
npm install

# Create database tables
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate

# Seed database with demo data
npx tsx prisma/seed.ts

# Start backend server
npm run dev
```

Backend will be running on: **http://localhost:3000**

#### Step 3: Setup Frontend (in new terminal)

```bash
cd apps/frontend

# Install dependencies
npm install

# Start frontend dev server
npm run dev
```

Frontend will be running on: **http://localhost:5173**

---

## 🔐 Login Credentials (After Seeding)

- **Super Admin**: `admin@accounting-bih.com` / `Admin123!`
- **Accountant**: `knjigovodja@example.com` / `Accountant123!`

---

## 🧪 Test the API

### Health Check

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-05T...",
  "environment": "development",
  "version": "1.0.0"
}
```

### Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@accounting-bih.com",
    "password": "Admin123!"
  }'
```

You should receive:
- `accessToken`
- `refreshToken`
- `user` object

---

## 📊 Access Services

| Service | URL | Credentials |
|---------|-----|-------------|
| Backend API | http://localhost:3000 | N/A |
| Frontend | http://localhost:5173 | See login credentials above |
| PostgreSQL | localhost:5432 | user: `accounting_user`, pass: `secure_password` |
| Redis | localhost:6379 | No auth |
| MinIO Console | http://localhost:9001 | user: `minioadmin`, pass: `minioadmin123` |
| Prisma Studio | http://localhost:5555 | Run `npm run studio` in backend |

---

## 🛠️ Common Commands

### Backend

```bash
cd apps/backend

# Development
npm run dev              # Start dev server with hot-reload

# Database
npm run migrate         # Run migrations
npm run seed            # Seed database
npm run studio          # Open Prisma Studio GUI
npx prisma migrate reset  # Reset database (careful!)

# Build
npm run build           # Build for production
npm start               # Start production server

# Testing
npm test                # Run tests
npm run test:watch      # Run tests in watch mode
```

### Frontend

```bash
cd apps/frontend

# Development
npm run dev             # Start dev server with hot-reload

# Build
npm run build           # Build for production
npm run preview         # Preview production build

# Testing
npm test                # Run tests
```

### Docker

```bash
# Infrastructure only (PostgreSQL, Redis, MinIO)
docker-compose -f docker-compose.dev.yml up -d
docker-compose -f docker-compose.dev.yml down

# Full stack (all services including backend and frontend)
docker-compose up -d
docker-compose down

# View logs
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f postgres

# Clean everything
docker-compose down -v
```

---

## 🐛 Troubleshooting

### Backend won't start

**Problem**: `Error: Cannot find module '@/...'`

**Solution**: Generate Prisma Client
```bash
cd apps/backend
npx prisma generate
```

---

**Problem**: `Database connection error`

**Solution**: Check if PostgreSQL is running
```bash
docker-compose -f docker-compose.dev.yml ps

# Restart PostgreSQL
docker-compose -f docker-compose.dev.yml restart postgres
```

---

**Problem**: `Port 3000 is already in use`

**Solution**: Kill the process or use different port
```bash
# Find process
lsof -i :3000

# Kill it
kill -9 <PID>
```

---

### Frontend won't start

**Problem**: `npm install` fails

**Solution**: Delete node_modules and try again
```bash
cd apps/frontend
rm -rf node_modules package-lock.json
npm install
```

---

**Problem**: `Cannot connect to API`

**Solution**: Check VITE_API_URL in `.env`
```bash
# apps/frontend/.env
VITE_API_URL=http://localhost:3000/api
```

---

### Docker Issues

**Problem**: `npm ci` fails in Docker

**Solution**: Already fixed! Dockerfiles now use `npm install`

---

**Problem**: Puppeteer download fails

**Solution**: Already fixed! `PUPPETEER_SKIP_DOWNLOAD=true` is set

---

**Problem**: Services won't start

**Solution**: Check Docker resources
- Increase memory to at least 4GB
- Increase CPUs to at least 2
- Restart Docker Desktop

---

## 📖 Detailed Documentation

For more detailed information, see:

- **[DOCKER_SETUP.md](./DOCKER_SETUP.md)** - Complete Docker guide
- **[README.md](./README.md)** - Full project documentation
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture
- **[PROGRESS.md](./PROGRESS.md)** - Implementation status

---

## 🎯 What Can You Do Now?

After setup, you can:

1. **Login** via frontend (http://localhost:5173)
2. **View companies** - 2 demo companies (RS & FBiH)
3. **Explore chart of accounts** - Basic kontni plan seeded
4. **Create journal entries** - Double-entry bookkeeping
5. **View Prisma Studio** - Visual database browser
6. **Test API endpoints** - Using curl or Postman

---

## 🚀 Next Steps for Development

1. **Explore the codebase**
   - Backend: `apps/backend/src/modules/`
   - Frontend: `apps/frontend/src/modules/`

2. **Read the architecture**
   - See `ARCHITECTURE.md` for system design

3. **Check implementation progress**
   - See `PROGRESS.md` for what's done and what's next

4. **Start developing**
   - Pick a module from `PROGRESS.md`
   - Follow the patterns in existing code
   - Submit PRs!

---

## 💡 Pro Tips

1. **Use Prisma Studio for database inspection**
   ```bash
   cd apps/backend
   npm run studio
   ```

2. **Hot reload works automatically**
   - Backend changes reload automatically (tsx watch)
   - Frontend changes reload automatically (Vite HMR)

3. **Check logs for debugging**
   ```bash
   # Backend logs
   tail -f apps/backend/logs/combined.log

   # Docker logs
   docker-compose logs -f
   ```

4. **Use the test script**
   ```bash
   ./test-docker.sh
   ```

---

**Questions?** Check the documentation or create an issue on GitHub!
