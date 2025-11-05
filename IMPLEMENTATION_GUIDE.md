# 📘 Implementation Guide - Accounting System BiH

Kompletni vodič za implementaciju svih modula knjigovodstvenog sistema.

## 🎯 Pregled

Ovaj dokument opisuje detaljnu implementaciju svakog modula sistema, sa code primjerima i best practices.

## 📋 Implementacijski Plan

### ✅ Phase 1: Core Infrastructure (COMPLETED)

#### 1.1 Project Setup ✅
- [x] Monorepo struktura sa workspaces
- [x] TypeScript konfiguracija
- [x] Docker i Docker Compose setup
- [x] Environment varijable

#### 1.2 Database Schema ✅
- [x] Prisma schema sa svim modelima
- [x] Multi-schema support (public, audit)
- [x] Indexing strategy
- [x] Relationships i constraints

#### 1.3 Authentication & Authorization ✅
- [x] JWT authentication
- [x] Refresh token mechanism
- [x] Password hashing (bcrypt)
- [x] RBAC middleware
- [x] Company access control

#### 1.4 Shared Infrastructure ✅
- [x] Logger (Winston)
- [x] Redis cache
- [x] Error handling
- [x] Request logging
- [x] Validation (Zod)

---

## 🚧 Phase 2: Chart of Accounts & General Ledger (NEXT)

### Module 1: Chart of Accounts (Kontni Plan)

#### 2.1 Domain Layer

**File**: \`apps/backend/src/modules/chart-of-accounts/domain/entities/account.entity.ts\`

\`\`\`typescript
/**
 * Account Entity
 * Represents a single account in the chart of accounts
 */

import { AccountType, AccountCategory } from '@prisma/client';

export interface AccountTranslations {
  sr: string;
  hr?: string;
  bs?: string;
  en?: string;
  de?: string;
}

export class AccountEntity {
  constructor(
    public readonly id: string,
    public readonly code: string,
    public readonly name: string,
    public readonly type: AccountType,
    public readonly category: AccountCategory,
    public readonly companyId: string,
    public readonly isActive: boolean,
    public readonly nameTranslations?: AccountTranslations,
    public readonly parentId?: string,
    public readonly requiresCostCenter?: boolean,
    public readonly requiresPartner?: boolean
  ) {}

  /**
   * Validate account code format
   * BiH standard: 6 digits (e.g., "430100")
   */
  static validateAccountCode(code: string): boolean {
    return /^\d{6}$/.test(code);
  }

  /**
   * Get account name in specific language
   */
  getNameInLanguage(language: string): string {
    if (!this.nameTranslations) return this.name;
    return this.nameTranslations[language as keyof AccountTranslations] || this.name;
  }

  /**
   * Check if account is a balance sheet account
   */
  isBalanceSheetAccount(): boolean {
    return this.type === 'ASSET' || this.type === 'LIABILITY';
  }

  /**
   * Check if account is an income statement account
   */
  isIncomeStatementAccount(): boolean {
    return this.type === 'REVENUE' || this.type === 'EXPENSE';
  }
}
\`\`\`

#### 2.2 Application Layer

**File**: \`apps/backend/src/modules/chart-of-accounts/application/chart-of-accounts.service.ts\`

\`\`\`typescript
/**
 * Chart of Accounts Service
 * Business logic for account management
 */

import { prisma } from '@/shared/infrastructure/database/prisma';
import { cache } from '@/shared/infrastructure/cache/redis';
import { NotFoundError, ConflictError, BadRequestError } from '@/shared/domain/errors/app-error';
import { CreateAccountDto, UpdateAccountDto } from '../presentation/dtos/account.dto';
import { AccountType, Account } from '@prisma/client';

export class ChartOfAccountsService {
  /**
   * Get all accounts for a company
   */
  async getAccounts(companyId: string): Promise<Account[]> {
    const cacheKey = \`accounts:company:\${companyId}\`;

    // Try cache first
    const cached = await cache.get<Account[]>(cacheKey);
    if (cached) return cached;

    // Get from database
    const accounts = await prisma.account.findMany({
      where: { companyId, isActive: true },
      include: {
        parent: true,
        children: true,
      },
      orderBy: { code: 'asc' },
    });

    // Cache for 1 hour
    await cache.set(cacheKey, accounts, 3600);

    return accounts;
  }

  /**
   * Get account by ID
   */
  async getAccountById(accountId: string, companyId: string): Promise<Account> {
    const account = await prisma.account.findFirst({
      where: { id: accountId, companyId },
      include: {
        parent: true,
        children: true,
        mappings: true,
      },
    });

    if (!account) {
      throw new NotFoundError('Account not found');
    }

    return account;
  }

  /**
   * Get account by code
   */
  async getAccountByCode(code: string, companyId: string): Promise<Account | null> {
    return prisma.account.findFirst({
      where: { code, companyId },
    });
  }

  /**
   * Create new account
   */
  async createAccount(companyId: string, data: CreateAccountDto): Promise<Account> {
    // Validate account code format
    if (!/^\d{6}$/.test(data.code)) {
      throw new BadRequestError('Invalid account code format. Must be 6 digits.');
    }

    // Check if account code already exists
    const existing = await this.getAccountByCode(data.code, companyId);
    if (existing) {
      throw new ConflictError(\`Account with code \${data.code} already exists\`);
    }

    // If parent specified, validate it exists
    if (data.parentId) {
      const parent = await prisma.account.findFirst({
        where: { id: data.parentId, companyId },
      });

      if (!parent) {
        throw new BadRequestError('Parent account not found');
      }
    }

    // Create account
    const account = await prisma.account.create({
      data: {
        code: data.code,
        name: data.name,
        type: data.type,
        category: data.category,
        companyId,
        parentId: data.parentId,
        nameTranslations: data.nameTranslations,
        requiresCostCenter: data.requiresCostCenter || false,
        requiresPartner: data.requiresPartner || false,
        requiresAnalytical: data.requiresAnalytical || false,
      },
    });

    // Invalidate cache
    await cache.del(\`accounts:company:\${companyId}\`);

    return account;
  }

  /**
   * Update account
   */
  async updateAccount(
    accountId: string,
    companyId: string,
    data: UpdateAccountDto
  ): Promise<Account> {
    // Check if account exists
    await this.getAccountById(accountId, companyId);

    // If changing code, check for conflicts
    if (data.code) {
      const existing = await this.getAccountByCode(data.code, companyId);
      if (existing && existing.id !== accountId) {
        throw new ConflictError(\`Account with code \${data.code} already exists\`);
      }
    }

    // Update account
    const account = await prisma.account.update({
      where: { id: accountId },
      data: {
        code: data.code,
        name: data.name,
        type: data.type,
        category: data.category,
        parentId: data.parentId,
        nameTranslations: data.nameTranslations,
        requiresCostCenter: data.requiresCostCenter,
        requiresPartner: data.requiresPartner,
        requiresAnalytical: data.requiresAnalytical,
      },
    });

    // Invalidate cache
    await cache.del(\`accounts:company:\${companyId}\`);

    return account;
  }

  /**
   * Deactivate account (soft delete)
   */
  async deactivateAccount(accountId: string, companyId: string): Promise<void> {
    // Check if account exists
    await this.getAccountById(accountId, companyId);

    // Check if account has children
    const children = await prisma.account.count({
      where: { parentId: accountId, isActive: true },
    });

    if (children > 0) {
      throw new BadRequestError('Cannot deactivate account with active children');
    }

    // Check if account has transactions
    const hasTransactions = await prisma.journalEntryLine.count({
      where: { accountId },
    });

    if (hasTransactions > 0) {
      throw new BadRequestError('Cannot deactivate account with transactions');
    }

    // Deactivate
    await prisma.account.update({
      where: { id: accountId },
      data: { isActive: false },
    });

    // Invalidate cache
    await cache.del(\`accounts:company:\${companyId}\`);
  }

  /**
   * Get accounts by type
   */
  async getAccountsByType(companyId: string, type: AccountType): Promise<Account[]> {
    return prisma.account.findMany({
      where: { companyId, type, isActive: true },
      orderBy: { code: 'asc' },
    });
  }

  /**
   * Get account hierarchy (tree structure)
   */
  async getAccountHierarchy(companyId: string): Promise<Account[]> {
    const accounts = await this.getAccounts(companyId);

    // Build tree structure
    const accountMap = new Map<string, Account & { children: Account[] }>();
    const rootAccounts: (Account & { children: Account[] })[] = [];

    // Initialize all accounts
    accounts.forEach((acc) => {
      accountMap.set(acc.id, { ...acc, children: [] });
    });

    // Build hierarchy
    accounts.forEach((acc) => {
      const account = accountMap.get(acc.id)!;
      if (acc.parentId) {
        const parent = accountMap.get(acc.parentId);
        if (parent) {
          parent.children.push(account);
        }
      } else {
        rootAccounts.push(account);
      }
    });

    return rootAccounts;
  }

  /**
   * Import chart of accounts from standard template
   */
  async importStandardTemplate(
    companyId: string,
    template: 'RS' | 'FBIH' | 'IFRS'
  ): Promise<void> {
    // Implementation for importing standard templates
    // This would load pre-defined account structures
    throw new Error('Not implemented yet');
  }

  /**
   * Map account to foreign standard (e.g., German SKR03)
   */
  async addAccountMapping(
    accountId: string,
    standard: string,
    mappedCode: string,
    mappedName: string
  ): Promise<void> {
    await prisma.accountMapping.create({
      data: {
        accountId,
        standard,
        mappedCode,
        mappedName,
      },
    });
  }
}
\`\`\`

#### 2.3 Presentation Layer

**File**: \`apps/backend/src/modules/chart-of-accounts/presentation/dtos/account.dto.ts\`

\`\`\`typescript
/**
 * Account DTOs
 */

import { z } from 'zod';

export const createAccountSchema = z.object({
  code: z.string().regex(/^\d{6}$/, 'Account code must be 6 digits'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  type: z.enum(['ASSET', 'LIABILITY', 'EXPENSE', 'REVENUE', 'CLOSING']),
  category: z.enum([
    'CURRENT_ASSETS',
    'FIXED_ASSETS',
    'CURRENT_LIABILITIES',
    'LONG_TERM_LIABILITIES',
    'EQUITY',
    'OPERATING_REVENUE',
    'FINANCIAL_REVENUE',
    'OPERATING_EXPENSES',
    'FINANCIAL_EXPENSES',
    'COST_OF_GOODS_SOLD',
  ]),
  parentId: z.string().optional(),
  nameTranslations: z
    .object({
      sr: z.string(),
      hr: z.string().optional(),
      bs: z.string().optional(),
      en: z.string().optional(),
      de: z.string().optional(),
    })
    .optional(),
  requiresCostCenter: z.boolean().optional(),
  requiresPartner: z.boolean().optional(),
  requiresAnalytical: z.boolean().optional(),
});

export type CreateAccountDto = z.infer<typeof createAccountSchema>;

export const updateAccountSchema = createAccountSchema.partial();

export type UpdateAccountDto = z.infer<typeof updateAccountSchema>;
\`\`\`

---

## 📝 Implementation Checklist

### Completed ✅
- [x] Project structure
- [x] Database schema
- [x] Authentication module
- [x] Authorization (RBAC)
- [x] Docker configuration
- [x] Shared infrastructure
- [x] Error handling
- [x] Logging
- [x] Caching

### In Progress 🚧
- [ ] Chart of Accounts module
- [ ] General Ledger module

### Pending 📅
- [ ] KIF/KUF modules
- [ ] Payroll module
- [ ] Reports module
- [ ] FIA integration
- [ ] Frontend implementation
- [ ] i18n implementation
- [ ] PDF generation
- [ ] Excel export
- [ ] Testing

---

## 🎯 Next Steps

1. **Implement Chart of Accounts Module**
   - Complete CRUD operations
   - Add account hierarchy logic
   - Implement standard templates

2. **Implement General Ledger Module**
   - Journal entry creation
   - Double-entry validation
   - Posting mechanism
   - Period locking

3. **Implement KIF/KUF Modules**
   - Invoice management
   - VAT calculation
   - GL integration

4. **Frontend Development**
   - Setup React application
   - Implement authentication UI
   - Create dashboard
   - Implement all modules UI

5. **Testing**
   - Unit tests for all services
   - Integration tests for APIs
   - E2E tests for critical flows

---

## 💡 Best Practices

### 1. SOLID Principles

- **Single Responsibility**: Svaka klasa ima jednu odgovornost
- **Open/Closed**: Otvoreno za ekstenziju, zatvoreno za modifikaciju
- **Liskov Substitution**: Subtypes moraju biti zamjenjivi za base types
- **Interface Segregation**: Mnogo malih interfejsa umjesto jednog velikog
- **Dependency Inversion**: Zavisiti od apstrakcija, ne konkretnih implementacija

### 2. DRY (Don't Repeat Yourself)

- Ekstrakcija zajedničkog koda u shared utilities
- Korištenje generic funkcija gdje je moguće
- Kreiranje reusable komponenti

### 3. Clean Code

- Deskriptivna imena varijabli i funkcija
- Kratke, fokusirane funkcije
- Komentari samo gdje je potrebno objašnjenje "zašto", ne "šta"
- Konzistentno formatiranje (Prettier)

### 4. Error Handling

- Korištenje custom error klasa
- Validacija na granicama sistema
- Meaningful error messages
- Proper error logging

### 5. Security

- Uvijek validirati input
- Koristiti prepared statements (Prisma)
- Hash passwords (bcrypt)
- JWT sa refresh tokens
- RBAC za sve protected resources

---

## 📚 Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [SOLID Principles](https://www.digitalocean.com/community/conceptual_articles/s-o-l-i-d-the-first-five-principles-of-object-oriented-design)

---

**Last Updated**: 2025-11-05
