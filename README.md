# 🧾 Accounting System BiH (RS & FBiH)

Modern, full-stack accounting system for Bosnia and Herzegovina (Republika Srpska & Federacija BiH).

---

## 🚀 Quick Start - JEDNA KOMANDA!

```bash
docker-compose up --build
```

**To je sve!** Nakon 1-2 minute sistema se pokrene:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Docs**: http://localhost:3000/api
- **MinIO Console**: http://localhost:9001 (admin: minioadmin / minioadmin123)

### 📋 Default Login

```
Email: admin@accounting-bih.com
Password: Admin123!
```

---

## 🎯 Šta Sistem Radi

✅ **Backend API (Node.js + TypeScript)**
- Authentication & Authorization (JWT + RBAC)
- Multi-company Management (Multi-tenancy)
- Chart of Accounts (Kontni Plan)
- General Ledger (Glavna Knjiga) - Double-entry bookkeeping
- Payroll for RS & FBiH (sa tačnim stopama za 2025)
- Partners Management (Kupci/Dobavljači)
- Cost Centers

✅ **Frontend (React + TypeScript)**
- Login with authentication
- Dashboard with backend status
- Ready for module implementation

✅ **Infrastructure**
- PostgreSQL 15
- Redis (caching)
- MinIO (S3-compatible storage)
- Sve u Docker-u - bez manuelnog setup-a!

---

## 📂 Struktura

```
.
├── apps/
│   ├── backend/          # Node.js API (Express + Prisma)
│   └── frontend/         # React App (Vite + Tailwind)
├── docker/               # Docker configuration files
├── docker-compose.yml    # Complete stack definition
└── README.md            # You are here
```

---

## 🛠️ Development

### Pojedinačni Servisi

```bash
# Samo infrastructure (PostgreSQL + Redis + MinIO)
docker-compose up postgres redis minio

# Backend only
docker-compose up backend

# Frontend only
docker-compose up frontend
```

### Logs

```bash
# Svi servisi
docker-compose logs -f

# Samo backend
docker-compose logs -f backend

# Samo frontend
docker-compose logs -f frontend
```

### Restart Servisa

```bash
# Sve ponovo
docker-compose restart

# Samo backend
docker-compose restart backend
```

### Stop All

```bash
docker-compose down

# Sa brisanjem volume-a (čisti restart)
docker-compose down -v
```

---

## 🧪 Testing API

### Health Check

```bash
curl http://localhost:3000/health
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

### Get Companies (sa tokenom)

```bash
TOKEN="your_access_token_here"
curl http://localhost:3000/api/v1/companies \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🏗️ Architecture

- **Clean Architecture** - Domain, Application, Infrastructure, Presentation layers
- **Modular Monolith** - Organized by business modules
- **PostgreSQL** - Relational database with Prisma ORM
- **Redis** - Caching and session management
- **MinIO** - File storage (invoices, reports, attachments)
- **JWT Authentication** - Secure token-based auth
- **RBAC** - Role-based access control

---

## 📊 Database

Database se automatski:
1. Kreira na startup-u
2. Pokreće migracije (Prisma migrate)
3. Seed-uje sa test dataom

**Seed Data uključuje:**
- Super Admin user: `admin@accounting-bih.com / Admin123!`
- Test Company: "Acme Holding d.o.o."
- Basic Chart of Accounts

---

## 🔧 Troubleshooting

### "Port already in use"

```bash
# Provjeri koji proces koristi port
lsof -i :3000
lsof -i :5173
lsof -i :5432

# Ili promijeni port u docker-compose.yml
```

### "Cannot connect to Docker daemon"

```bash
# Provjeri da li Docker radi
docker ps

# Start Docker service (Linux)
sudo systemctl start docker
```

### "Out of memory"

```bash
# Daj više memorije Docker-u (Docker Desktop > Settings > Resources)
# Preporučeno: minimum 4GB RAM
```

### Backend se ne pokreće

```bash
# Provjeri logs
docker-compose logs backend

# Rebuild bez cache-a
docker-compose build --no-cache backend
docker-compose up backend
```

---

## 🚧 Što Slijedi (Roadmap)

- [ ] Invoice Module (KIF/KUF)
- [ ] FoxPro DB Import
- [ ] Financial Reports (Balance Sheet, P&L, Cash Flow)
- [ ] PDF Export Service
- [ ] Excel/CSV Export
- [ ] FIA API Integration
- [ ] Multi-language (SR, HR, BS, EN, DE)
- [ ] Complete Frontend UI for all modules
- [ ] Unit & Integration Tests

---

## 📝 Tech Stack

**Backend:**
- Node.js 20 + TypeScript
- Express.js
- Prisma ORM
- PostgreSQL 15
- Redis 7
- JWT (jsonwebtoken)
- Zod (validation)
- Winston (logging)
- BullMQ (job queue)

**Frontend:**
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Zustand (state management)
- React Query
- Axios

**Infrastructure:**
- Docker & Docker Compose
- PostgreSQL 15
- Redis 7
- MinIO (S3-compatible)

---

## 👨‍💻 Development Notes

### Environment Variables

Backend `.env` se automatski kreira od environment varijabli u `docker-compose.yml`.

Za lokalni development bez Docker-a:

```bash
cd apps/backend
cp .env.example .env
# Edit .env with your values
```

### Database Migrations

```bash
# Novi migration
docker-compose exec backend npx prisma migrate dev --name migration_name

# Apply migrations (production)
docker-compose exec backend npx prisma migrate deploy

# Prisma Studio (GUI)
docker-compose exec backend npx prisma studio
```

---

## 📄 License

Proprietary - All Rights Reserved

---

## 🤝 Contributing

Ovo je interni projekt. Za pitanja ili bug report-e, kontaktirajte development team.

---

**Made with ❤️ for Bosna i Hercegovina 🇧🇦**
