# 📊 Accounting System BiH - Modern Knjigovodstveni Sistem

Moderan knjigovodstveni sistem dizajniran specifično za **Bosnu i Hercegovinu** (Republika Srpska i Federacija BiH), izgrađen koristeći najbolje prakse sofverskog inženjerstva.

## 🎯 Karakteristike

### Knjigovodstvene Funkcionalnosti
- ✅ **Kontni Plan** - Fleksibilan kontni plan sa multi-language podrškom
- ✅ **Glavna Knjiga** - Dvostruko knjiženje sa automatskom validacijom
- ✅ **KIF/KUF** - Knjiga izlaznih i ulaznih faktura
- ✅ **Obračun Plata** - Kalkulacija po zakonima RS i FBiH
- ✅ **Finansijski Izvještaji** - Bilans stanja, bilans uspjeha, tokovi gotovine
- ✅ **FIA Integracija** - Export u FIA format za završne račune
- ✅ **PDF/CSV Export** - Izvještaji u multiple formatima

### Tehnološke Karakteristike
- 🏗️ **Clean Architecture** - Modularna i maintainable arhitektura
- 🔐 **RBAC** - Role-based access control
- 🌍 **Multi-language** - Srpski, Hrvatski, Bosanski, Engleski, Njemački
- 👥 **Multi-user** - Multiple knjigovođe, multiple kompanije
- 🔒 **Security First** - JWT, bcrypt, audit logging
- 📊 **Real-time** - Redis cache i background jobs
- 🐳 **Docker Ready** - Containerizovan deployment
- ✨ **Type Safety** - 100% TypeScript

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 20+ LTS
- **Language**: TypeScript 5+
- **Framework**: Express.js
- **Database**: PostgreSQL 15+ (Prisma ORM)
- **Cache**: Redis
- **Authentication**: JWT + Refresh Tokens
- **Authorization**: CASL (RBAC)
- **Validation**: Zod
- **Testing**: Jest
- **PDF Generation**: Puppeteer / PDFKit
- **Excel**: ExcelJS

### Frontend
- **Framework**: React 18+ with TypeScript
- **State Management**: Zustand + React Query
- **UI Components**: shadcn/ui (Radix UI + Tailwind CSS)
- **Forms**: React Hook Form + Zod
- **Routing**: React Router v6
- **i18n**: react-i18next
- **Charts**: Recharts
- **Testing**: Vitest + React Testing Library

### DevOps
- **Containerization**: Docker + Docker Compose
- **Reverse Proxy**: Nginx
- **CI/CD**: GitHub Actions

## 📋 Preduvjeti

- Node.js 20.x ili noviji
- Docker Desktop (za development sa Docker Compose)
- PostgreSQL 15+ (ako ne koristite Docker)
- Redis (ako ne koristite Docker)

## 🚀 Instalacija i Pokretanje

### 1. Clone Repository

\`\`\`bash
git clone <repository-url>
cd tras86.github.io
\`\`\`

### 2. Instalacija Dependencies

\`\`\`bash
# Install root dependencies
npm install

# Install backend dependencies
npm install --workspace=apps/backend

# Install frontend dependencies
npm install --workspace=apps/frontend
\`\`\`

### 3. Environment Configuration

#### Backend (.env)

\`\`\`bash
cd apps/backend
cp .env.example .env
# Edit .env with your configuration
\`\`\`

Ključne environment varijable:
- \`DATABASE_URL\` - PostgreSQL connection string
- \`JWT_SECRET\` - Secret za JWT tokene
- \`REDIS_URL\` - Redis connection string

#### Frontend (.env)

\`\`\`bash
cd apps/frontend
cp .env.example .env
\`\`\`

### 4. Database Setup

\`\`\`bash
# Generate Prisma Client
npm run generate --workspace=apps/backend

# Run migrations
npm run migrate --workspace=apps/backend

# Seed database (optional)
npm run seed --workspace=apps/backend
\`\`\`

### 5. Pokretanje sa Docker Compose (Preporučeno)

\`\`\`bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
\`\`\`

Servisi će biti dostupni na:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **MinIO**: http://localhost:9001

### 6. Pokretanje Bez Dockera

#### Backend

\`\`\`bash
npm run dev:backend
\`\`\`

#### Frontend

\`\`\`bash
npm run dev:frontend
\`\`\`

#### Oba Istovremeno

\`\`\`bash
npm run dev
\`\`\`

## 📚 API Documentation

API dokumentacija je dostupna na: http://localhost:3000/api

### Authentication Endpoints

\`\`\`
POST   /api/v1/auth/register       - Register new user
POST   /api/v1/auth/login          - Login user
POST   /api/v1/auth/refresh        - Refresh access token
POST   /api/v1/auth/logout         - Logout user
GET    /api/v1/auth/me             - Get current user
POST   /api/v1/auth/change-password - Change password
\`\`\`

### Example: Login Request

\`\`\`bash
curl -X POST http://localhost:3000/api/v1/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123"
  }'
\`\`\`

### Example: Protected Request

\`\`\`bash
curl -X GET http://localhost:3000/api/v1/auth/me \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
\`\`\`

## 🏗️ Arhitektura

Projekat koristi **Clean Architecture** sa slijedećim layerima:

\`\`\`
┌─────────────────────────────────────────────────┐
│           Presentation Layer                     │
│        (Controllers, Routes, DTOs)               │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│          Application Layer                       │
│          (Use Cases, Services)                   │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│             Domain Layer                         │
│        (Entities, Value Objects)                 │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│         Infrastructure Layer                     │
│     (Database, Cache, External APIs)             │
└─────────────────────────────────────────────────┘
\`\`\`

Detaljnija arhitektura se nalazi u [ARCHITECTURE.md](./ARCHITECTURE.md).

## 📁 Struktura Projekta

\`\`\`
accounting-system-bih/
├── apps/
│   ├── backend/                    # Node.js API
│   │   ├── src/
│   │   │   ├── modules/            # Business modules
│   │   │   │   ├── auth/           # ✅ Implementirano
│   │   │   │   ├── companies/      # 🚧 U razvoju
│   │   │   │   ├── chart-of-accounts/
│   │   │   │   ├── general-ledger/
│   │   │   │   ├── kif/
│   │   │   │   ├── kuf/
│   │   │   │   ├── payroll/
│   │   │   │   └── reports/
│   │   │   ├── shared/
│   │   │   │   ├── domain/
│   │   │   │   ├── infrastructure/
│   │   │   │   └── presentation/
│   │   │   └── server.ts
│   │   └── prisma/
│   │       └── schema.prisma       # Database schema
│   │
│   └── frontend/                   # React Application
│       └── src/
│           ├── modules/
│           ├── shared/
│           └── locales/
│
├── docker/                         # Docker configurations
├── docker-compose.yml
└── ARCHITECTURE.md                 # Detailed architecture
\`\`\`

## 🧪 Testing

### Backend Tests

\`\`\`bash
# Run all tests
npm run test --workspace=apps/backend

# Watch mode
npm run test:watch --workspace=apps/backend

# Coverage
npm run test:coverage --workspace=apps/backend
\`\`\`

### Frontend Tests

\`\`\`bash
# Run all tests
npm run test --workspace=apps/frontend

# UI mode
npm run test:ui --workspace=apps/frontend
\`\`\`

## 🔒 Security Best Practices

- ✅ JWT Authentication sa Refresh Tokens
- ✅ Bcrypt password hashing (12 rounds)
- ✅ Role-Based Access Control (RBAC)
- ✅ Audit logging za sve kritične operacije
- ✅ Rate limiting
- ✅ CORS protection
- ✅ Helmet.js za HTTP headers security
- ✅ Input validation sa Zod
- ✅ SQL injection protection (Prisma ORM)

## 📊 Database Schema

Database schema je definisan u `apps/backend/prisma/schema.prisma`.

Ključni modeli:
- **User** - Korisnici sistema
- **Company** - Kompanije (multi-tenancy)
- **Account** - Kontni plan
- **JournalEntry** - Stavke glavne knjige
- **Invoice** - KIF/KUF fakture
- **PayrollRun** - Obračuni plata
- **Employee** - Zaposleni

Pogledajte [Prisma Studio](https://www.prisma.io/studio) za vizuelni pregled:

\`\`\`bash
npm run studio --workspace=apps/backend
\`\`\`

## 🌍 Internationalization (i18n)

Sistem podržava 5 jezika:
- 🇷🇸 **Srpski** (sr) - Default
- 🇭🇷 **Hrvatski** (hr)
- 🇧🇦 **Bosanski** (bs)
- 🇬🇧 **Engleski** (en)
- 🇩🇪 **Njemački** (de)

Translation fajlovi se nalaze u:
- Backend: \`apps/backend/src/locales/\`
- Frontend: \`apps/frontend/src/locales/\`

## 📈 Roadmap

### ✅ Phase 1: Core Infrastructure (Completed)
- [x] Project setup
- [x] Database schema
- [x] Authentication & Authorization
- [x] Docker configuration

### 🚧 Phase 2: Chart of Accounts & General Ledger (In Progress)
- [ ] Chart of accounts CRUD
- [ ] General ledger entries
- [ ] Account balances
- [ ] Period locking

### 📅 Phase 3: KIF/KUF
- [ ] Invoice management
- [ ] VAT calculation
- [ ] GL integration
- [ ] PDF generation

### 📅 Phase 4: Payroll
- [ ] RS payroll calculator
- [ ] FBiH payroll calculator
- [ ] Payroll reports

### 📅 Phase 5: Reports
- [ ] Balance sheet
- [ ] Income statement
- [ ] Cash flow
- [ ] Trial balance

### 📅 Phase 6: FIA Integration
- [ ] FIA API client
- [ ] XML export
- [ ] Data validation

## 🤝 Contributing

Za doprinos projektu:

1. Fork repository
2. Kreirajte feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit promjene (\`git commit -m 'Add amazing feature'\`)
4. Push na branch (\`git push origin feature/amazing-feature\`)
5. Otvorite Pull Request

## 📝 License

Proprietary - All rights reserved.

## 👥 Authors

- Senior Software Architect - System Design & Implementation

## 📞 Support

Za pitanja i podršku:
- Email: support@accounting-bih.com
- Documentation: [ARCHITECTURE.md](./ARCHITECTURE.md)

---

**Napravljeno sa ❤️ za BiH knjigovođe**
