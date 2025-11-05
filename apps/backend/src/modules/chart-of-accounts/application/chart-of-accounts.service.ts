/**
 * Chart of Accounts Service
 * Business logic for account management
 */

import { prisma } from '@/shared/infrastructure/database/prisma';
import { cache } from '@/shared/infrastructure/cache/redis';
import { NotFoundError, ConflictError, BadRequestError } from '@/shared/domain/errors/app-error';
import { CreateAccountDto, UpdateAccountDto, AccountMappingDto } from '../presentation/dtos/account.dto';
import { AccountType, Account } from '@prisma/client';

export class ChartOfAccountsService {
  /**
   * Get all accounts for a company
   */
  async getAccounts(companyId: string): Promise<Account[]> {
    const cacheKey = `accounts:company:${companyId}`;

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
      throw new ConflictError(`Account with code ${data.code} already exists`);
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
    await cache.del(`accounts:company:${companyId}`);

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
        throw new ConflictError(`Account with code ${data.code} already exists`);
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
    await cache.del(`accounts:company:${companyId}`);

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
      throw new BadRequestError('Cannot deactivate account with transactions. Please hide instead.');
    }

    // Deactivate
    await prisma.account.update({
      where: { id: accountId },
      data: { isActive: false },
    });

    // Invalidate cache
    await cache.del(`accounts:company:${companyId}`);
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
   * Add account mapping to foreign standard
   */
  async addAccountMapping(
    accountId: string,
    companyId: string,
    data: AccountMappingDto
  ): Promise<void> {
    // Check if account exists
    await this.getAccountById(accountId, companyId);

    // Check if mapping already exists
    const existing = await prisma.accountMapping.findFirst({
      where: {
        accountId,
        standard: data.standard,
      },
    });

    if (existing) {
      throw new ConflictError(`Mapping to ${data.standard} already exists`);
    }

    // Create mapping
    await prisma.accountMapping.create({
      data: {
        accountId,
        standard: data.standard,
        mappedCode: data.mappedCode,
        mappedName: data.mappedName,
      },
    });

    // Invalidate cache
    await cache.del(`accounts:company:${companyId}`);
  }

  /**
   * Get account mappings
   */
  async getAccountMappings(accountId: string, companyId: string) {
    // Check access
    await this.getAccountById(accountId, companyId);

    return prisma.accountMapping.findMany({
      where: { accountId },
    });
  }

  /**
   * Search accounts by code or name
   */
  async searchAccounts(companyId: string, query: string): Promise<Account[]> {
    return prisma.account.findMany({
      where: {
        companyId,
        isActive: true,
        OR: [
          { code: { contains: query } },
          { name: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 20,
      orderBy: { code: 'asc' },
    });
  }

  /**
   * Bulk create accounts (for importing templates)
   */
  async bulkCreateAccounts(
    companyId: string,
    accounts: CreateAccountDto[]
  ): Promise<{ created: number; errors: string[] }> {
    const errors: string[] = [];
    let created = 0;

    for (const accountData of accounts) {
      try {
        await this.createAccount(companyId, accountData);
        created++;
      } catch (error: any) {
        errors.push(`Account ${accountData.code}: ${error.message}`);
      }
    }

    return { created, errors };
  }

  /**
   * Get account balance for a period
   */
  async getAccountBalance(
    accountId: string,
    companyId: string,
    fiscalYear: number,
    fiscalPeriod: string
  ) {
    // Check access
    await this.getAccountById(accountId, companyId);

    const balance = await prisma.accountBalance.findFirst({
      where: {
        accountId,
        fiscalYear,
        fiscalPeriod: fiscalPeriod as any,
      },
    });

    if (!balance) {
      return {
        openingDebit: 0,
        openingCredit: 0,
        debitTurnover: 0,
        creditTurnover: 0,
        closingDebit: 0,
        closingCredit: 0,
      };
    }

    return balance;
  }
}
