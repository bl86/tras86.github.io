# TypeScript Build Fixes Required

## Problem
Backend ne može da se build-uje zbog network restrikcija koje blokiraju download Prisma engine-a.

## Privremeno Rješenje

### Opcija 1: Lokalni Development (Bez Build-a)
```bash
cd apps/backend

# Pokreni direktno sa tsx (ne zahtijeva build)
npm run dev
```

`tsx` pokreće TypeScript direktno bez kompajlacije, ali zahtijeva da Prisma Client bude generisan.

### Opcija 2: Generisanje Prisma Client-a

Ako imate pristup internetu:
```bash
cd apps/backend
npx prisma generate
```

Ako nema pristupa, koristite postojeći engine:
```bash
# Kopiraj engine iz root node_modules
cp -r ../../node_modules/.prisma ./node_modules/
cp -r ../../node_modules/@prisma ./node_modules/
```

### Opcija 3: Docker Development
```bash
# Pokreni samo infrastrukturu
docker-compose -f docker-compose.dev.yml up -d

# Pokreni backend lokalno (gdje imaš bolji internet)
cd apps/backend
npm install
npx prisma generate
npm run dev
```

## TypeScript Greške koje Treba Popraviti

### 1. Unused Variables - Dodati `_` prefix
- [x] `apps/backend/src/modules/auth/presentation/middlewares/authenticate.ts` - Line 24, 54
- [ ] `apps/backend/src/modules/auth/presentation/middlewares/authorize.ts` - Line 17, 50, 92
- [ ] `apps/backend/src/server.ts` - Line 57

### 2. Implicit `any` Types - Dodati eksplicitne tipove
- [ ] `apps/backend/src/modules/companies/application/company.service.ts` - Line 29, 233
- [ ] `apps/backend/src/modules/general-ledger/application/general-ledger.service.ts` - Line 194
- [ ] `apps/backend/src/modules/payroll/application/payroll.service.ts` - Lines 143, 158-162

### 3. Prisma Types - Ne postoje dok se ne regeneriše Prisma Client
Ove greške će se automatski riješiti nakon `prisma generate`:
- `User`, `Company`, `Account`, `JournalEntryStatus`, `FiscalPeriod`, `DocumentType`, `LegalEntity`, `PayrollStatus`, itd.

### 4. JWT Sign Options - TypeScript verzija konflikta
Problem u `apps/backend/src/modules/auth/infrastructure/jwt.ts`:
```typescript
// Trenutno:
return jwt.sign(payload, config.jwt.secret, {
  expiresIn: config.jwt.expiresIn,
});

// Treba:
return jwt.sign(payload, config.jwt.secret, {
  expiresIn: config.jwt.expiresIn
} as jwt.SignOptions);
```

## Kako Testirati

### 1. Provjeri da li ima TypeScript grešaka:
```bash
cd apps/backend
npm run build 2>&1 | grep "error TS"
```

### 2. Pokreni Dev Server:
```bash
npm run dev
```

### 3. Testirati API:
```bash
# Health check
curl http://localhost:3000/health

# Login (nakon seed-a)
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@accounting-bih.com","password":"Admin123!"}'
```

## Status

- ✅ Dependencies instalirani
- ✅ Basic TS greške popravljene (unused vars u auth middleware)
- ⏳ Prisma Client generation - zahtijeva internet ili manual copy
- ⏳ Preostale TS greške - čekaju Prisma Client
- ⏳ Server test - čeka Prisma Client

## Next Steps

1. Riješiti Prisma Client generisanje
2. Popraviti preostale TS greške
3. Testirati sve endpointe
4. Napisati unit testove
5. Napisati integration testove

## Environment Requirements

- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- Internet pristup za Prisma engine download (ili manual copy)
