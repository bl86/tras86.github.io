/**
 * General Ledger Service
 * Core accounting logic - Double-entry bookkeeping
 */

import { prisma } from '@/shared/infrastructure/database/prisma';
import { NotFoundError, BadRequestError, ForbiddenError } from '@/shared/domain/errors/app-error';
import { Decimal } from 'decimal.js';
import { JournalEntryStatus, FiscalPeriod, DocumentType } from '@prisma/client';

interface JournalEntryLineDto {
  accountId: string;
  debit: number;
  credit: number;
  description?: string;
  costCenterId?: string;
  partnerId?: string;
  analyticalAccount?: string;
}

interface CreateJournalEntryDto {
  entryDate: Date;
  postingDate: Date;
  description: string;
  documentNumber?: string;
  documentType: DocumentType;
  fiscalYear: number;
  fiscalPeriod: FiscalPeriod;
  lines: JournalEntryLineDto[];
}

export class GeneralLedgerService {
  /**
   * Create journal entry
   */
  async createJournalEntry(
    companyId: string,
    userId: string,
    data: CreateJournalEntryDto
  ) {
    // Validate double-entry (Debit = Credit)
    const totalDebit = data.lines.reduce((sum, line) => sum.plus(line.debit), new Decimal(0));
    const totalCredit = data.lines.reduce((sum, line) => sum.plus(line.credit), new Decimal(0));

    if (!totalDebit.equals(totalCredit)) {
      throw new BadRequestError(
        `Journal entry not balanced. Debit: ${totalDebit}, Credit: ${totalCredit}`
      );
    }

    if (data.lines.length < 2) {
      throw new BadRequestError('Journal entry must have at least 2 lines');
    }

    // Check if period is locked
    await this.checkPeriodLocked(companyId, data.fiscalYear, data.fiscalPeriod);

    // Generate entry number
    const entryNumber = await this.generateEntryNumber(companyId, data.fiscalYear);

    // Validate all accounts exist and belong to company
    for (const line of data.lines) {
      const account = await prisma.account.findFirst({
        where: { id: line.accountId, companyId },
      });

      if (!account) {
        throw new BadRequestError(`Account ${line.accountId} not found`);
      }

      // Validate cost center if required
      if (account.requiresCostCenter && !line.costCenterId) {
        throw new BadRequestError(`Account ${account.code} requires cost center`);
      }

      // Validate partner if required
      if (account.requiresPartner && !line.partnerId) {
        throw new BadRequestError(`Account ${account.code} requires partner`);
      }
    }

    // Create journal entry
    const journalEntry = await prisma.journalEntry.create({
      data: {
        entryNumber,
        entryDate: data.entryDate,
        postingDate: data.postingDate,
        description: data.description,
        documentNumber: data.documentNumber,
        documentType: data.documentType,
        status: JournalEntryStatus.DRAFT,
        fiscalYear: data.fiscalYear,
        fiscalPeriod: data.fiscalPeriod,
        companyId,
        createdById: userId,
        lines: {
          create: data.lines.map((line, index) => ({
            accountId: line.accountId,
            debit: line.debit,
            credit: line.credit,
            description: line.description,
            costCenterId: line.costCenterId,
            partnerId: line.partnerId,
            analyticalAccount: line.analyticalAccount,
            lineNumber: index + 1,
          })),
        },
      },
      include: {
        lines: {
          include: {
            account: true,
            costCenter: true,
            partner: true,
          },
        },
      },
    });

    return journalEntry;
  }

  /**
   * Post journal entry (change status from DRAFT to POSTED)
   */
  async postJournalEntry(entryId: string, companyId: string, _userId: string) {
    const entry = await this.getJournalEntryById(entryId, companyId);

    if (entry.status !== JournalEntryStatus.DRAFT) {
      throw new BadRequestError(`Cannot post entry with status ${entry.status}`);
    }

    // Check if period is locked
    await this.checkPeriodLocked(companyId, entry.fiscalYear, entry.fiscalPeriod);

    // Post entry
    const posted = await prisma.journalEntry.update({
      where: { id: entryId },
      data: { status: JournalEntryStatus.POSTED },
      include: { lines: true },
    });

    // Update account balances
    await this.updateAccountBalances(posted);

    return posted;
  }

  /**
   * Approve journal entry
   */
  async approveJournalEntry(entryId: string, companyId: string, userId: string) {
    const entry = await this.getJournalEntryById(entryId, companyId);

    if (entry.status !== JournalEntryStatus.POSTED) {
      throw new BadRequestError('Only posted entries can be approved');
    }

    return prisma.journalEntry.update({
      where: { id: entryId },
      data: {
        status: JournalEntryStatus.APPROVED,
        approvedById: userId,
        approvedAt: new Date(),
      },
    });
  }

  /**
   * Reverse journal entry (create reversal entry)
   */
  async reverseJournalEntry(
    entryId: string,
    companyId: string,
    userId: string,
    reversalDate: Date
  ) {
    const originalEntry = await prisma.journalEntry.findFirst({
      where: { id: entryId, companyId },
      include: { lines: true },
    });

    if (!originalEntry) {
      throw new NotFoundError('Journal entry not found');
    }

    if (originalEntry.status !== JournalEntryStatus.POSTED &&
        originalEntry.status !== JournalEntryStatus.APPROVED) {
      throw new BadRequestError('Can only reverse posted or approved entries');
    }

    // Create reversal entry with swapped debits and credits
    const reversalLines = originalEntry.lines.map((line: {
      accountId: string;
      debit: { toString: () => string };
      credit: { toString: () => string };
      description: string | null;
      costCenterId: string | null;
      partnerId: string | null;
      analyticalAccount: string | null;
    }) => ({
      accountId: line.accountId,
      debit: parseFloat(line.credit.toString()),
      credit: parseFloat(line.debit.toString()),
      description: `Storno: ${line.description || ''}`,
      costCenterId: line.costCenterId,
      partnerId: line.partnerId,
      analyticalAccount: line.analyticalAccount,
    }));

    const reversalEntry = await this.createJournalEntry(companyId, userId, {
      entryDate: reversalDate,
      postingDate: reversalDate,
      description: `STORNO: ${originalEntry.description}`,
      documentNumber: originalEntry.documentNumber,
      documentType: originalEntry.documentType,
      fiscalYear: reversalDate.getFullYear(),
      fiscalPeriod: this.getFiscalPeriodFromDate(reversalDate),
      lines: reversalLines,
    });

    // Link reversal to original
    await prisma.journalEntry.update({
      where: { id: reversalEntry.id },
      data: {
        isReversal: true,
        reversalOfId: entryId,
      },
    });

    // Auto-post reversal
    await this.postJournalEntry(reversalEntry.id, companyId, userId);

    return reversalEntry;
  }

  /**
   * Get journal entries for company
   */
  async getJournalEntries(
    companyId: string,
    filters: {
      fiscalYear?: number;
      fiscalPeriod?: FiscalPeriod;
      status?: JournalEntryStatus;
      accountId?: string;
      dateFrom?: Date;
      dateTo?: Date;
      page?: number;
      limit?: number;
    }
  ) {
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = { companyId };

    if (filters.fiscalYear) where.fiscalYear = filters.fiscalYear;
    if (filters.fiscalPeriod) where.fiscalPeriod = filters.fiscalPeriod;
    if (filters.status) where.status = filters.status;
    if (filters.dateFrom || filters.dateTo) {
      where.entryDate = {};
      if (filters.dateFrom) where.entryDate.gte = filters.dateFrom;
      if (filters.dateTo) where.entryDate.lte = filters.dateTo;
    }
    if (filters.accountId) {
      where.lines = {
        some: { accountId: filters.accountId },
      };
    }

    const [entries, total] = await Promise.all([
      prisma.journalEntry.findMany({
        where,
        include: {
          lines: {
            include: {
              account: true,
              costCenter: true,
              partner: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { entryDate: 'desc' },
        skip,
        take: limit,
      }),
      prisma.journalEntry.count({ where }),
    ]);

    return {
      entries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get journal entry by ID
   */
  async getJournalEntryById(entryId: string, companyId: string) {
    const entry = await prisma.journalEntry.findFirst({
      where: { id: entryId, companyId },
      include: {
        lines: {
          include: {
            account: true,
            costCenter: true,
            partner: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        reversedBy: true,
        reversalOf: true,
      },
    });

    if (!entry) {
      throw new NotFoundError('Journal entry not found');
    }

    return entry;
  }

  /**
   * Delete draft journal entry
   */
  async deleteJournalEntry(entryId: string, companyId: string) {
    const entry = await this.getJournalEntryById(entryId, companyId);

    if (entry.status !== JournalEntryStatus.DRAFT) {
      throw new BadRequestError('Can only delete draft entries');
    }

    await prisma.journalEntry.delete({ where: { id: entryId } });
  }

  /**
   * Generate entry number (JE-2025-0001)
   */
  private async generateEntryNumber(companyId: string, fiscalYear: number): Promise<string> {
    const count = await prisma.journalEntry.count({
      where: { companyId, fiscalYear },
    });

    const nextNumber = (count + 1).toString().padStart(4, '0');
    return `JE-${fiscalYear}-${nextNumber}`;
  }

  /**
   * Check if fiscal period is locked
   */
  private async checkPeriodLocked(
    companyId: string,
    fiscalYear: number,
    fiscalPeriod: FiscalPeriod
  ) {
    const lock = await prisma.fiscalPeriodLock.findFirst({
      where: {
        companyId,
        fiscalYear,
        fiscalPeriod,
        isLocked: true,
      },
    });

    if (lock) {
      throw new ForbiddenError(`Fiscal period ${fiscalPeriod} ${fiscalYear} is locked`);
    }
  }

  /**
   * Update account balances after posting
   */
  private async updateAccountBalances(entry: any) {
    for (const line of entry.lines) {
      const balance = await prisma.accountBalance.findFirst({
        where: {
          accountId: line.accountId,
          fiscalYear: entry.fiscalYear,
          fiscalPeriod: entry.fiscalPeriod,
        },
      });

      if (balance) {
        // Update existing balance
        await prisma.accountBalance.update({
          where: { id: balance.id },
          data: {
            debitTurnover: { increment: line.debit },
            creditTurnover: { increment: line.credit },
            closingDebit: {
              set: new Decimal(balance.openingDebit.toString())
                .plus(balance.debitTurnover.toString())
                .plus(line.debit.toString())
                .minus(balance.creditTurnover.toString())
                .minus(line.credit.toString())
                .toNumber(),
            },
            closingCredit: {
              set: new Decimal(balance.openingCredit.toString())
                .plus(balance.creditTurnover.toString())
                .plus(line.credit.toString())
                .minus(balance.debitTurnover.toString())
                .minus(line.debit.toString())
                .toNumber(),
            },
          },
        });
      } else {
        // Create new balance
        await prisma.accountBalance.create({
          data: {
            accountId: line.accountId,
            fiscalYear: entry.fiscalYear,
            fiscalPeriod: entry.fiscalPeriod,
            openingDebit: 0,
            openingCredit: 0,
            debitTurnover: line.debit,
            creditTurnover: line.credit,
            closingDebit: new Decimal(line.debit.toString()).minus(line.credit.toString()).toNumber(),
            closingCredit: new Decimal(line.credit.toString()).minus(line.debit.toString()).toNumber(),
          },
        });
      }
    }
  }

  /**
   * Get fiscal period from date
   */
  private getFiscalPeriodFromDate(date: Date): FiscalPeriod {
    const month = date.getMonth();
    const periods = [
      'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
      'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
    ];
    return periods[month] as FiscalPeriod;
  }

  /**
   * Lock fiscal period
   */
  async lockFiscalPeriod(
    companyId: string,
    fiscalYear: number,
    fiscalPeriod: FiscalPeriod,
    userId: string
  ) {
    const existing = await prisma.fiscalPeriodLock.findFirst({
      where: { companyId, fiscalYear, fiscalPeriod },
    });

    if (existing) {
      await prisma.fiscalPeriodLock.update({
        where: { id: existing.id },
        data: {
          isLocked: true,
          lockedAt: new Date(),
          lockedBy: userId,
        },
      });
    } else {
      await prisma.fiscalPeriodLock.create({
        data: {
          companyId,
          fiscalYear,
          fiscalPeriod,
          isLocked: true,
          lockedAt: new Date(),
          lockedBy: userId,
        },
      });
    }
  }

  /**
   * Unlock fiscal period
   */
  async unlockFiscalPeriod(
    companyId: string,
    fiscalYear: number,
    fiscalPeriod: FiscalPeriod
  ) {
    const lock = await prisma.fiscalPeriodLock.findFirst({
      where: { companyId, fiscalYear, fiscalPeriod },
    });

    if (lock) {
      await prisma.fiscalPeriodLock.update({
        where: { id: lock.id },
        data: { isLocked: false },
      });
    }
  }
}
