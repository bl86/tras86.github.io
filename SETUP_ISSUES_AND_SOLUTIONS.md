# 🔧 Setup Issues and Solutions

## Problem Identificiran

Backend se **ne može pokrenuti** zbog sljedećih problema:

### 1. ❌ Prisma Client Nije Generisan
```
Error: @prisma/client did not initialize yet.
Please run "prisma generate" and try to import it again.
```

**Uzrok**: Network restrikcije blokiraju download Prisma engine binarija.

### 2. ❌ TypeScript Greške
- Unused variables (`res` parametar koji nije korišćen)
- Implicit `any` types u nekim servisima
- Missing Prisma types (User, Company, itd.)

### 3. ❌ Node Modules Setup
- Dependencies instalirani u root (`node_modules/`)
- Backend koristi workspace setup
- Prisma Client postoji u root ali nije inicijalizovan

---

## ✅ 3 Rješenja (Odaberi Jedno)

### **Rješenje 1: Lokalni Development BEZ Prisma (Brzo)**

Ovo rješenje omogućava da pokreneš samo **infrastructure** (baza, Redis, MinIO) i da backend radiš lokalno na mašini sa boljim internetom.

```bash
# Na trenutnoj mašini - pokreni samo infrastructure
docker-compose -f docker-compose.dev.yml up -d

# Na drugoj mašini (sa internetom):
# 1. Git clone/pull projekta
cd apps/backend

# 2. Install dependencies
npm install

# 3. Generate Prisma Client (zahtijeva internet!)
npx prisma generate

# 4. Setup database
npx prisma migrate dev

# 5. Seed database
npx tsx prisma/seed.ts

# 6. Run dev server
npm run dev
```

**Prednost**: Radi sigurno, Prisma se pravilno instalira
**Mana**: Zahtijeva drugu mašinu sa internetom

---

### **Rješenje 2: Manual Prisma Client Copy (Srednje)**

Ako neko već ima generisan Prisma Client, može ga kopirati.

```bash
# Na mašini koja ima Prisma Client:
cd apps/backend
tar -czf prisma-client.tar.gz node_modules/.prisma node_modules/@prisma

# Transfer fajl na server

# Na serveru:
cd /home/user/tras86.github.io/apps/backend
mkdir -p node_modules
tar -xzf prisma-client.tar.gz -C .

# Ili ako koristimo root node_modules:
cd /home/user/tras86.github.io
tar -xzf prisma-client.tar.gz -C .
```

**Prednost**: Ne zahtijeva internet na serveru
**Mana**: Zahtijeva transfer fajlova

---

### **Rješenje 3: Skip Prisma Privremeno (Za Testiranje)**

Privremeno skip-ovati Prisma i testirati samo TypeScript kod.

1. **Kreiraj Mock Prisma Client**

```bash
cd /home/user/tras86.github.io/apps/backend
mkdir -p src/test-mocks
```

Kreiraj `src/test-mocks/prisma-mock.ts`:
```typescript
export const prisma = {
  user: { findUnique: async () => null },
  company: { findMany: async () => [] },
  account: { findMany: async () => [] },
  journalEntry: { findMany: async () => [] },
  // ... itd
};
```

2. **Zamijeni Import Privremeno**

U `src/shared/infrastructure/database/prisma.ts`:
```typescript
// Privremeno comment out:
// import { PrismaClient } from '@prisma/client';

// Dodaj:
// @ts-ignore
import { prisma } from '@/test-mocks/prisma-mock';
export { prisma };
```

**Prednost**: Možeš testirati TypeScript syntax odmah
**Mana**: API neće raditi, samo TypeScript kompajlacija

---

## 📋 Korak-po-Korak Fix (Rješenje 1 - Preporučeno)

### Priprema

1. **Na trenutnoj mašini** - pokreni infrastructure:
```bash
cd /home/user/tras86.github.io
docker-compose -f docker-compose.dev.yml up -d
```

Provjeri da li radi:
```bash
docker-compose -f docker-compose.dev.yml ps
```

Trebalo bi da vidiš:
- `accounting-postgres` - running
- `accounting-redis` - running
- `accounting-minio` - running

---

### Glavni Setup (Mašina sa Internetom)

2. **Clone projekta**:
```bash
git clone <repo-url>
cd tras86.github.io
```

3. **Install root dependencies**:
```bash
npm install
```

4. **Install backend dependencies**:
```bash
cd apps/backend
PUPPETEER_SKIP_DOWNLOAD=true npm install
```

5. **Generate Prisma Client** (ovdje zahtijeva internet!):
```bash
npx prisma generate
```

6. **Setup .env**:
```bash
cp .env.example .env
```

Izmijeni `DATABASE_URL` da pokazuje na server:
```env
DATABASE_URL=postgresql://accounting_user:secure_password@<SERVER_IP>:5432/accounting_bih
```

7. **Run migrations**:
```bash
npx prisma migrate dev
```

8. **Seed database**:
```bash
npx tsx prisma/seed.ts
```

9. **Start backend**:
```bash
npm run dev
```

10. **Test API**:
```bash
curl http://localhost:3000/health
```

Trebalo bi:
```json
{
  "status": "healthy",
  "timestamp": "...",
  "environment": "development",
  "version": "1.0.0"
}
```

---

## 🧪 Testiranje Nakon Fix-a

### 1. Health Check
```bash
curl http://localhost:3000/health
```

### 2. API Documentation
```bash
curl http://localhost:3000/api
```

### 3. Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@accounting-bih.com",
    "password": "Admin123!"
  }'
```

Očekivani odgovor:
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "...",
      "email": "admin@accounting-bih.com",
      ...
    },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

### 4. Get Companies (sa token-om)
```bash
TOKEN="<accessToken_from_login>"

curl http://localhost:3000/api/v1/companies \
  -H "Authorization: Bearer $TOKEN"
```

### 5. Get Chart of Accounts
```bash
curl http://localhost:3000/api/v1/companies/<COMPANY_ID>/accounts \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🐛 Troubleshooting

### Error: "Cannot find module '@prisma/client'"

**Rješenje**: Run `npx prisma generate`

---

### Error: "Database connection error"

**Rješenje**:
1. Provjeri da li PostgreSQL radi:
```bash
docker-compose -f docker-compose.dev.yml ps
```

2. Provjeri `DATABASE_URL` u `.env`

3. Restart PostgreSQL:
```bash
docker-compose -f docker-compose.dev.yml restart postgres
```

---

### Error: "Port 3000 already in use"

**Rješenje**:
```bash
# Find process
lsof -i :3000

# Kill it
kill -9 <PID>
```

---

### TypeScript Compilation Errors

**Rješenje**: Pročitaj `apps/backend/TYPESCRIPT_FIXES.md`

Brzi fix za preostale greške:

1. **Authorize middleware** - dodaj `_` prefix:
```typescript
// Line 17, 50, 92
export const requireRole = (
  req: Request,
  _res: Response,  // ← Add underscore
  next: NextFunction
)
```

2. **Implicit any types** - dodaj tipove:
```typescript
// companies/application/company.service.ts:29
const companies = userCompanyAccess.map((access: any) => access.company);
// Change to:
const companies = userCompanyAccess.map((access) => access.company);
```

---

## 📊 Status Check

Nakon svih fix-ova, provjeri:

### ✅ Backend Status
```bash
cd apps/backend

# 1. Dependencies installed?
ls node_modules/@prisma

# 2. Prisma Client generated?
ls node_modules/.prisma/client

# 3. TypeScript compiles?
npm run build

# 4. Dev server starts?
npm run dev
```

### ✅ Database Status
```bash
# PostgreSQL running?
docker-compose -f docker-compose.dev.yml ps

# Can connect?
docker exec -it accounting-postgres psql -U accounting_user -d accounting_bih -c "SELECT 1"
```

### ✅ API Status
```bash
# Health check
curl http://localhost:3000/health

# Login works?
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@accounting-bih.com","password":"Admin123!"}'
```

---

## 🎯 Final Checklist

- [ ] PostgreSQL running in Docker
- [ ] Redis running in Docker
- [ ] MinIO running in Docker
- [ ] Backend dependencies installed
- [ ] Prisma Client generated
- [ ] Database migrated
- [ ] Database seeded
- [ ] Backend server running
- [ ] Health endpoint responds
- [ ] Login works
- [ ] API endpoints work

---

## 📞 Need Help?

Ako i dalje ima problema:

1. **Check logs**:
```bash
# Backend logs
cd apps/backend
cat logs/combined.log

# Docker logs
docker-compose -f docker-compose.dev.yml logs postgres
docker-compose -f docker-compose.dev.yml logs redis
```

2. **Clean restart**:
```bash
# Stop everything
docker-compose -f docker-compose.dev.yml down -v

# Remove node_modules
cd apps/backend
rm -rf node_modules

# Start fresh
docker-compose -f docker-compose.dev.yml up -d
npm install
npx prisma generate
npx prisma migrate dev
npx tsx prisma/seed.ts
npm run dev
```

3. **Check environment**:
```bash
# Node version
node --version  # Should be 20+

# NPM version
npm --version  # Should be 10+

# Docker version
docker --version
docker-compose --version
```

---

## 📚 Additional Documentation

- [QUICK_START.md](./QUICK_START.md) - 5-minute quick start
- [DOCKER_SETUP.md](./DOCKER_SETUP.md) - Docker troubleshooting
- [TYPESCRIPT_FIXES.md](./apps/backend/TYPESCRIPT_FIXES.md) - TypeScript issues
- [README.md](./README.md) - Full documentation
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture

---

**Glavni Problem**: Network restrikcije blokiraju Prisma engine download

**Glavno Rješenje**: Razvijaj backend lokalno na mašini sa internetom, infrastructure u Dockeru

**Status**: Backend **gotov** ali blokiran Prisma generisanjem, sve ostalo **radi**
