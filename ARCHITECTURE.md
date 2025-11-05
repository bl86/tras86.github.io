# Arhitektura Knjigovodstvenog Sistema za BiH/RS

## 🎯 Pregled Sistema

Enterprise knjigovodstveni sistem dizajniran prema SOLID principima, Clean Architecture, i najbolje industrijske prakse.

## 🏗️ Arhitekturni Stil

**Modular Monolith sa mogućnošću migracije na Microservices**

### Razlozi:
- Lakše održavanje u početnoj fazi
- Jednostavnije deployment
- Mogućnost ekstraktovanja modula u mikroservise kasnije
- Shared database za transakcijsku konzistentnost

## 📐 Arhitekturni Layeri (Clean Architecture)

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│                    (React Frontend)                          │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (Express)                       │
│              Controllers, Middlewares, Routes                │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer                          │
│            Use Cases, Business Logic, Services               │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    Domain Layer                              │
│           Entities, Value Objects, Domain Events             │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                Infrastructure Layer                          │
│        Database, External APIs, File System, Email           │
└─────────────────────────────────────────────────────────────┘
```

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js 20+ LTS
- **Language**: TypeScript 5+
- **Framework**: Express.js (with TypeScript decorators)
- **ORM**: Prisma (type-safe, excellent TypeScript support)
- **Database**: PostgreSQL 15+ (transakciona konzistentnost)
- **Authentication**: JWT + Refresh Tokens
- **Authorization**: CASL (RBAC/ABAC)
- **Validation**: Zod
- **Testing**: Jest, Supertest
- **Documentation**: OpenAPI/Swagger
- **PDF Generation**: Puppeteer / PDFKit
- **Excel/CSV**: ExcelJS
- **Queue**: BullMQ (Redis)
- **Logging**: Winston + Morgan
- **Monitoring**: Prometheus + Grafana

### Frontend
- **Framework**: React 18+ with TypeScript
- **State Management**: Zustand + React Query (TanStack Query)
- **Routing**: React Router v6
- **UI Components**: shadcn/ui (Radix UI + Tailwind)
- **Forms**: React Hook Form + Zod
- **Tables**: TanStack Table
- **i18n**: react-i18next
- **Charts**: Recharts / Chart.js
- **Date Handling**: date-fns
- **Testing**: Vitest, React Testing Library

### DevOps
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Reverse Proxy**: Nginx
- **Process Manager**: PM2

## 📦 Struktura Projekta

```
accounting-system-bih/
├── apps/
│   ├── backend/                    # Node.js API
│   │   ├── src/
│   │   │   ├── modules/            # Business modules
│   │   │   │   ├── auth/
│   │   │   │   ├── users/
│   │   │   │   ├── companies/
│   │   │   │   ├── chart-of-accounts/
│   │   │   │   ├── general-ledger/
│   │   │   │   ├── kif/            # Knjiga izlaznih faktura
│   │   │   │   ├── kuf/            # Knjiga ulaznih faktura
│   │   │   │   ├── payroll/
│   │   │   │   ├── reports/
│   │   │   │   └── fia-integration/
│   │   │   ├── shared/             # Shared code
│   │   │   │   ├── domain/
│   │   │   │   ├── infrastructure/
│   │   │   │   ├── application/
│   │   │   │   └── presentation/
│   │   │   ├── config/
│   │   │   └── server.ts
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── seeds/
│   │   ├── tests/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── frontend/                   # React Application
│       ├── src/
│       │   ├── modules/            # Feature modules
│       │   │   ├── auth/
│       │   │   ├── dashboard/
│       │   │   ├── companies/
│       │   │   ├── chart-of-accounts/
│       │   │   ├── general-ledger/
│       │   │   ├── kif/
│       │   │   ├── kuf/
│       │   │   ├── payroll/
│       │   │   └── reports/
│       │   ├── shared/
│       │   │   ├── components/
│       │   │   ├── hooks/
│       │   │   ├── utils/
│       │   │   ├── api/
│       │   │   └── types/
│       │   ├── locales/            # i18n translations
│       │   │   ├── sr/
│       │   │   ├── hr/
│       │   │   ├── bs/
│       │   │   ├── en/
│       │   │   └── de/
│       │   ├── App.tsx
│       │   └── main.tsx
│       ├── package.json
│       └── tsconfig.json
│
├── packages/                       # Shared packages
│   ├── types/                      # Shared TypeScript types
│   ├── utils/                      # Shared utilities
│   └── constants/                  # Shared constants
│
├── docker/
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── nginx.conf
│
├── docker-compose.yml
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── cd.yml
└── README.md
```

## 🔐 Security Architecture

### Authentication Flow
```
1. User Login → JWT Access Token (15min) + Refresh Token (7 days)
2. Access Token stored in memory (React state)
3. Refresh Token stored in httpOnly cookie
4. Automatic token refresh before expiry
5. MFA support (TOTP)
```

### Authorization (RBAC + ABAC)

**Roles:**
- `SUPER_ADMIN` - Sistemski administrator
- `ADMIN` - Administrator kompanije
- `ACCOUNTANT` - Knjigovođa
- `ACCOUNTANT_ASSISTANT` - Pomoćni knjigovođa
- `VIEWER` - Read-only pristup
- `AUDITOR` - Eksterne revizije

**Permissions:**
```typescript
enum Permission {
  // Companies
  COMPANY_CREATE = 'company:create',
  COMPANY_READ = 'company:read',
  COMPANY_UPDATE = 'company:update',
  COMPANY_DELETE = 'company:delete',

  // General Ledger
  GL_ENTRY_CREATE = 'gl:entry:create',
  GL_ENTRY_READ = 'gl:entry:read',
  GL_ENTRY_UPDATE = 'gl:entry:update',
  GL_ENTRY_DELETE = 'gl:entry:delete',
  GL_ENTRY_APPROVE = 'gl:entry:approve',

  // KIF/KUF
  INVOICE_CREATE = 'invoice:create',
  INVOICE_READ = 'invoice:read',
  INVOICE_UPDATE = 'invoice:update',
  INVOICE_DELETE = 'invoice:delete',

  // Payroll
  PAYROLL_CREATE = 'payroll:create',
  PAYROLL_READ = 'payroll:read',
  PAYROLL_CALCULATE = 'payroll:calculate',
  PAYROLL_APPROVE = 'payroll:approve',

  // Reports
  REPORT_VIEW = 'report:view',
  REPORT_EXPORT = 'report:export',

  // Users
  USER_MANAGE = 'user:manage',
  ROLE_MANAGE = 'role:manage',
}
```

### Multi-Tenancy Strategy

**Organizational Model:**
```
User (Accountant)
  ↓ has many
UserCompanyAccess
  ↓ has many
Company (Firma)
  ↓ has many
Books (KIF, KUF, GL, Payroll)
```

**Data Isolation:**
- Row-Level Security (RLS) na database nivou
- Svaki query filtrira po company_id
- Middleware provjerava pristup prije svake operacije

## 📊 Domain Model

### Core Entities

#### 1. Chart of Accounts (Kontni Plan)
```typescript
entity Account {
  code: string            // npr. "430100"
  name: string           // multilanguage
  nameTranslations: JSON
  type: AccountType      // ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE
  category: AccountCategory
  parent?: Account
  isActive: boolean
  requiresCostCenter: boolean
  requiresPartner: boolean
  company: Company
  mappings: AccountMapping[]  // za konverziju u njemački/drugi plan
}

enum AccountType {
  ASSET = '0',           // Aktiva
  LIABILITY = '1',       // Pasiva
  EXPENSE = '2',         // Rashodi
  REVENUE = '3',         // Prihodi
  CLOSING = '4',         // Zatvaranje
}
```

#### 2. General Ledger Entry (Stavka Glavne Knjige)
```typescript
entity JournalEntry {
  entryNumber: string
  entryDate: Date
  postingDate: Date
  description: string
  documentNumber?: string
  documentType: DocumentType
  status: EntryStatus    // DRAFT, POSTED, APPROVED, REVERSED
  fiscalYear: number
  fiscalPeriod: number
  company: Company
  createdBy: User
  approvedBy?: User
  approvedAt?: Date
  lines: JournalEntryLine[]
  attachments: Attachment[]
}

entity JournalEntryLine {
  account: Account
  debit: Decimal         // Duguje
  credit: Decimal        // Potražuje
  description: string
  costCenter?: CostCenter
  partner?: Partner
  analyticalAccount?: string
}
```

#### 3. KIF/KUF (Invoices)
```typescript
entity Invoice {
  type: InvoiceType      // INPUT (KIF) or OUTPUT (KUF)
  invoiceNumber: string
  invoiceDate: Date
  dueDate: Date
  partner: Partner
  taxBase: Decimal
  vatAmount: Decimal
  totalAmount: Decimal
  vatRate: VATRate
  currency: Currency
  exchangeRate?: Decimal
  status: InvoiceStatus
  items: InvoiceItem[]
  journalEntry?: JournalEntry  // povezano sa GL
  company: Company
}

enum InvoiceType {
  INPUT = 'KIF',   // Knjiga izlaznih faktura
  OUTPUT = 'KUF',  // Knjiga ulaznih faktura
}
```

#### 4. Payroll (Obračun Plata)
```typescript
entity PayrollRun {
  period: string         // "2025-01"
  entity: LegalEntity    // RS or FBiH
  status: PayrollStatus
  employees: EmployeePayroll[]
  totalGross: Decimal
  totalNet: Decimal
  totalTax: Decimal
  totalSocialContributions: Decimal
  company: Company
  calculatedBy: User
  approvedBy?: User
}

entity EmployeePayroll {
  employee: Employee
  grossSalary: Decimal
  netSalary: Decimal
  taxableBase: Decimal
  incomeTax: Decimal     // Porez na dohodak

  // RS contributions
  pioContribution?: Decimal      // PIO (penzijsko)
  healthContribution?: Decimal   // Zdravstveno
  unemploymentContribution?: Decimal // Nezaposlenost

  // FBiH contributions (ako je potrebno)
  ...

  deductions: PayrollDeduction[]
  additions: PayrollAddition[]
}
```

## 🧮 Business Logic Modules

### 1. Chart of Accounts Module

**Features:**
- CRUD operacije za kontni plan
- Import/Export kontnog plana
- Mapping između različitih standarda (BiH, DE, IFRS)
- Validacija hijerarhije računa
- Multi-language support za nazive računa

**Key Classes:**
- `ChartOfAccountsService`
- `AccountRepository`
- `AccountMappingService`
- `AccountValidator`

### 2. General Ledger Module

**Features:**
- Kreiranje i knjiženje stavki
- Dvostruko knjiženje (Debit = Credit validacija)
- Zaključavanje perioda
- Reversal entries (storno knjiženja)
- Audit trail za sve izmjene

**Key Classes:**
- `GeneralLedgerService`
- `JournalEntryService`
- `PostingService`
- `PeriodLockService`

### 3. KIF/KUF Module

**Features:**
- Unos izlaznih i ulaznih faktura
- Automatsko knjiženje u glavnu knjigu
- PDV (VAT) kalkulacija
- Valutna podrška
- Generisanje PDF faktura

**Key Classes:**
- `InvoiceService`
- `VATCalculator`
- `InvoiceGLIntegration`
- `InvoicePDFGenerator`

### 4. Payroll Module (RS & FBiH)

**Features:**
- Obračun plata po zakonima RS i FBiH
- Kalkulacija doprinosa i poreza
- Generisanje platnih listi
- Export za banke
- Integracija sa glavnom knjigom

**Tax Rates (2025):**
```typescript
// Republika Srpska
const RS_TAX_RATES = {
  INCOME_TAX: 0.10,           // 10% porez na dohodak
  PIO_EMPLOYEE: 0.185,        // 18.5% PIO zaposleni
  PIO_EMPLOYER: 0.105,        // 10.5% PIO poslodavac
  HEALTH_EMPLOYEE: 0.125,     // 12.5% zdravstveno zaposleni
  HEALTH_EMPLOYER: 0.105,     // 10.5% zdravstveno poslodavac
  UNEMPLOYMENT: 0.01,         // 1% nezaposlenost (samo poslodavac)
};

// Federacija BiH
const FBIH_TAX_RATES = {
  INCOME_TAX: 0.10,           // 10% porez na dohodak
  PIO_EMPLOYEE: 0.17,         // 17% PIO zaposleni
  PIO_EMPLOYER: 0.06,         // 6% PIO poslodavac
  HEALTH_EMPLOYEE: 0.125,     // 12.5% zdravstveno zaposleni
  HEALTH_EMPLOYER: 0.105,     // 10.5% zdravstveno poslodavac
  UNEMPLOYMENT_EMPLOYEE: 0.015, // 1.5% nezaposlenost zaposleni
  UNEMPLOYMENT_EMPLOYER: 0.005, // 0.5% nezaposlenost poslodavac
};
```

**Key Classes:**
- `PayrollService`
- `RSPayrollCalculator`
- `FBIHPayrollCalculator`
- `TaxCalculator`
- `ContributionCalculator`

### 5. Reports Module

**Financial Reports:**
1. **Bilans Stanja (Balance Sheet)**
   - Aktiva / Pasiva
   - Komparativni bilans
   - Export u PDF/CSV/Excel

2. **Bilans Uspjeha (Income Statement / P&L)**
   - Prihodi / Rashodi
   - Po periodima
   - Analitički izvještaji

3. **Tokovi Gotovine (Cash Flow Statement)**
   - Operativne aktivnosti
   - Investicione aktivnosti
   - Finansijske aktivnosti

4. **Bruto Bilans (Trial Balance)**
   - Saldo lista
   - Promet po kontima
   - Analitička kartice

5. **KIF/KUF Izvještaji**
   - Knjiga izlaznih faktura
   - Knjiga ulaznih faktura
   - PDV prijava

6. **Platne Liste (Payroll Reports)**
   - Rekapitulacija plata
   - Doprinosi po zaposlenom
   - Izvještaji za PIO/Zdravstvo

**Key Classes:**
- `ReportService`
- `BalanceSheetGenerator`
- `IncomeStatementGenerator`
- `CashFlowGenerator`
- `TrialBalanceGenerator`
- `PDFExportService`
- `CSVExportService`
- `ExcelExportService`

### 6. FIA Integration Module

**FIA (Finansijska informaciona agencija)** - integracija za dostavu završnih računa.

**Features:**
- Export podataka u FIA format (XML)
- Validacija podataka prema FIA specifikaciji
- API integracija sa FIA sistemom
- Praćenje statusa dostave

**Key Classes:**
- `FIAIntegrationService`
- `FIAExportService`
- `FIAValidator`
- `FIAAPIClient`

## 🌍 Internationalization (i18n)

**Supported Languages:**
- `sr` - Srpski (ćirilica i latinica)
- `hr` - Hrvatski
- `bs` - Bosanski
- `en` - English
- `de` - Deutsch

**Implementation:**
```typescript
// Backend: i18next
import i18next from 'i18next';

// Frontend: react-i18next
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();
t('accounting.general_ledger');
```

**Database Translations:**
```typescript
// JSONB kolone za multi-language content
{
  nameTranslations: {
    sr: "Gotovina u banci",
    hr: "Gotovina u banci",
    bs: "Gotovina u banci",
    en: "Cash in bank",
    de: "Bargeld in der Bank"
  }
}
```

## 🔄 Data Flow Example: Invoice Posting

```
1. User creates invoice (KIF/KUF)
   ↓
2. Invoice validation (amounts, VAT, partner)
   ↓
3. Generate journal entry (double-entry bookkeeping)
   ↓
4. Post to General Ledger
   ↓
5. Update account balances
   ↓
6. Send notification
   ↓
7. Audit log
```

## 🧪 Testing Strategy

### Backend Testing
```typescript
// Unit Tests (70% coverage minimum)
describe('PayrollCalculator', () => {
  it('should calculate RS payroll correctly', () => {
    const result = rsCalculator.calculate(3000);
    expect(result.netSalary).toBe(2145);
  });
});

// Integration Tests
describe('GeneralLedger API', () => {
  it('should create and post journal entry', async () => {
    const response = await request(app)
      .post('/api/v1/journal-entries')
      .send(mockEntry);
    expect(response.status).toBe(201);
  });
});

// E2E Tests (Critical flows only)
describe('Invoice to GL flow', () => {
  it('should post invoice to general ledger', async () => {
    // Test end-to-end flow
  });
});
```

### Frontend Testing
```typescript
// Component Tests
describe('ChartOfAccounts', () => {
  it('should render accounts tree', () => {
    render(<ChartOfAccounts />);
    expect(screen.getByText('430100')).toBeInTheDocument();
  });
});

// Integration Tests with MSW
describe('Invoice Form', () => {
  it('should submit invoice and show success', async () => {
    // Test with mocked API
  });
});
```

## 📈 Performance Optimization

1. **Database:**
   - Proper indexing (compound indexes)
   - Materialized views za izvještaje
   - Connection pooling
   - Query optimization

2. **API:**
   - Response caching (Redis)
   - Pagination (cursor-based)
   - Rate limiting
   - Compression (gzip)

3. **Frontend:**
   - Code splitting (lazy loading)
   - Virtual scrolling za velike liste
   - React Query caching
   - Image optimization

## 🚀 Deployment Architecture

```
┌─────────────┐
│   Nginx     │ (Reverse Proxy, SSL)
└──────┬──────┘
       │
   ┌───┴───┐
   │       │
┌──▼──┐  ┌─▼──────┐
│React│  │Node.js │
│ App │  │  API   │
└─────┘  └───┬────┘
             │
     ┌───────┼───────┐
     │       │       │
  ┌──▼──┐ ┌─▼───┐ ┌─▼────┐
  │PG DB│ │Redis│ │MinIO │
  └─────┘ └─────┘ └──────┘
```

**Docker Compose Services:**
- `nginx` - Reverse proxy
- `frontend` - React application
- `backend` - Node.js API
- `postgres` - Database
- `redis` - Cache + Queue
- `minio` - File storage (S3-compatible)

## 🔒 Compliance & Audit

**Features:**
- Immutable audit log (event sourcing za kritične operacije)
- User action tracking
- Data retention policies
- GDPR compliance (data export/deletion)
- Digital signatures za završne račune

## 📋 Implementation Phases

### Phase 1: Core Infrastructure (Weeks 1-2)
- Project setup
- Authentication & Authorization
- Multi-tenancy foundation
- Database schema
- Basic UI components

### Phase 2: Chart of Accounts & GL (Weeks 3-4)
- Chart of accounts module
- General ledger
- Journal entries
- Basic reporting

### Phase 3: KIF/KUF (Weeks 5-6)
- Invoice management
- VAT calculation
- GL integration
- PDF generation

### Phase 4: Payroll (Weeks 7-9)
- RS payroll calculator
- FBiH payroll calculator
- Payroll reports
- Bank export

### Phase 5: Reports & Export (Weeks 10-11)
- Financial statements
- PDF/CSV/Excel export
- Custom reports
- Dashboards

### Phase 6: FIA Integration (Week 12)
- FIA API integration
- XML export
- Validation
- Testing

### Phase 7: Testing & Polish (Weeks 13-14)
- End-to-end testing
- Performance optimization
- Security audit
- Documentation

## 🎨 UI/UX Principles

1. **Desktop-first** (accounting software is primarily desktop)
2. **Keyboard shortcuts** za brzi unos
3. **Bulk operations** (masovne operacije)
4. **Smart defaults** (pamti prethodne izbore)
5. **Inline validation** (real-time feedback)
6. **Print-friendly** izvještaji
7. **Dark mode** podrška

## 📚 Documentation Requirements

1. **Technical Documentation:**
   - API documentation (OpenAPI/Swagger)
   - Database schema documentation
   - Architecture decision records (ADR)

2. **User Documentation:**
   - User manual (multi-language)
   - Video tutorials
   - FAQ

3. **Developer Documentation:**
   - Setup guide
   - Contributing guidelines
   - Code style guide

---

**Autor:** Senior Software Architect
**Datum:** 2025-11-05
**Verzija:** 1.0
**Status:** ✅ Ready for Implementation
