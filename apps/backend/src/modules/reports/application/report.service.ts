/**
 * Report Service
 * Generates financial reports: Balance Sheet, P&L, Cash Flow
 */

import { prisma } from '@/shared/infrastructure/database/prisma';
import Decimal from 'decimal.js';

interface ReportParams {
  companyId: string;
  startDate: Date;
  endDate: Date;
}

interface AccountBalance {
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType: string;
  balance: number;
}

export class ReportService {
  /**
   * Generate Balance Sheet (Bilans stanja)
   * Assets = Liabilities + Equity
   */
  async generateBalanceSheet(params: ReportParams) {
    const { companyId, endDate } = params;

    // Get all journal entry lines up to the end date that are posted
    const journalLines = await prisma.journalEntryLine.findMany({
      where: {
        journalEntry: {
          companyId,
          entryDate: { lte: endDate },
          status: 'POSTED',
        },
      },
      include: {
        account: true,
      },
    });

    // Calculate balances by account
    const accountBalances = new Map<string, AccountBalance>();

    for (const line of journalLines) {
      const key = line.accountId;
      if (!accountBalances.has(key)) {
        accountBalances.set(key, {
          accountId: line.account.id,
          accountCode: line.account.code,
          accountName: line.account.name,
          accountType: line.account.type,
          balance: 0,
        });
      }

      const acc = accountBalances.get(key)!;
      const debit = new Decimal(line.debit.toString());
      const credit = new Decimal(line.credit.toString());

      // For balance sheet accounts:
      // Assets: Debit increases, Credit decreases (normal debit balance)
      // Liabilities/Equity: Credit increases, Debit decreases (normal credit balance)
      if (line.account.type === 'ASSET') {
        acc.balance = new Decimal(acc.balance).plus(debit).minus(credit).toNumber();
      } else if (line.account.type === 'LIABILITY' || line.account.type === 'EQUITY') {
        acc.balance = new Decimal(acc.balance).plus(credit).minus(debit).toNumber();
      }
    });

    // Group by type
    const assets = Array.from(accountBalances.values()).filter(
      (a) => a.accountType === 'ASSET' && a.balance !== 0
    );
    const liabilities = Array.from(accountBalances.values()).filter(
      (a) => a.accountType === 'LIABILITY' && a.balance !== 0
    );
    const equity = Array.from(accountBalances.values()).filter(
      (a) => a.accountType === 'EQUITY' && a.balance !== 0
    );

    // Calculate totals
    const totalAssets = assets.reduce((sum, a) => sum + a.balance, 0);
    const totalLiabilities = liabilities.reduce((sum, a) => sum + a.balance, 0);
    const totalEquity = equity.reduce((sum, a) => sum + a.balance, 0);

    return {
      companyId,
      reportDate: endDate,
      reportType: 'BALANCE_SHEET',
      assets,
      liabilities,
      equity,
      totalAssets,
      totalLiabilities,
      totalEquity,
      totalLiabilitiesAndEquity: totalLiabilities + totalEquity,
      isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01,
    };
  }

  /**
   * Generate Profit & Loss Statement (Bilans uspeha)
   * Net Income = Revenues - Expenses
   */
  async generateProfitAndLoss(params: ReportParams) {
    const { companyId, startDate, endDate } = params;

    // Get all journal entry lines within the period that are posted
    const journalLines = await prisma.journalEntryLine.findMany({
      where: {
        journalEntry: {
          companyId,
          entryDate: { gte: startDate, lte: endDate },
          status: 'POSTED',
        },
      },
      include: {
        account: true,
      },
    });

    // Calculate balances by account
    const accountBalances = new Map<string, AccountBalance>();

    for (const line of journalLines) {
      const key = line.accountId;
      if (!accountBalances.has(key)) {
        accountBalances.set(key, {
          accountId: line.account.id,
          accountCode: line.account.code,
          accountName: line.account.name,
          accountType: line.account.type,
          balance: 0,
        });
      }

      const acc = accountBalances.get(key)!;
      const debit = new Decimal(line.debit.toString());
      const credit = new Decimal(line.credit.toString());

      // For P&L accounts:
      // Revenue: Credit increases, Debit decreases (normal credit balance)
      // Expense: Debit increases, Credit decreases (normal debit balance)
      if (line.account.type === 'REVENUE') {
        acc.balance = new Decimal(acc.balance).plus(credit).minus(debit).toNumber();
      } else if (line.account.type === 'EXPENSE') {
        acc.balance = new Decimal(acc.balance).plus(debit).minus(credit).toNumber();
      }
    });

    // Group by type
    const revenues = Array.from(accountBalances.values()).filter(
      (a) => a.accountType === 'REVENUE' && a.balance !== 0
    );
    const expenses = Array.from(accountBalances.values()).filter(
      (a) => a.accountType === 'EXPENSE' && a.balance !== 0
    );

    // Calculate totals
    const totalRevenue = revenues.reduce((sum, a) => sum + a.balance, 0);
    const totalExpenses = expenses.reduce((sum, a) => sum + a.balance, 0);
    const netIncome = totalRevenue - totalExpenses;

    return {
      companyId,
      periodStart: startDate,
      periodEnd: endDate,
      reportType: 'PROFIT_AND_LOSS',
      revenues,
      expenses,
      totalRevenue,
      totalExpenses,
      netIncome,
      netIncomePercentage: totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0,
    };
  }

  /**
   * Generate Cash Flow Statement (Izveštaj o tokovima gotovine)
   */
  async generateCashFlow(params: ReportParams) {
    const { companyId, startDate, endDate } = params;

    // Get all cash/bank account movements
    const cashAccounts = await prisma.account.findMany({
      where: {
        companyId,
        OR: [
          { code: { startsWith: '10' } }, // Cash accounts (Gotovina)
          { code: { startsWith: '11' } }, // Bank accounts (Računi u bankama)
        ],
      },
    });

    const cashAccountIds = cashAccounts.map((a) => a.id);

    // Get opening balance (before start date)
    const openingLines = await prisma.journalEntryLine.findMany({
      where: {
        accountId: { in: cashAccountIds },
        journalEntry: {
          companyId,
          entryDate: { lt: startDate },
          status: 'POSTED',
        },
      },
    });

    let openingBalance = 0;
    for (const line of openingLines) {
      const debit = new Decimal(line.debit.toString());
      const credit = new Decimal(line.credit.toString());
      openingBalance = new Decimal(openingBalance).plus(debit).minus(credit).toNumber();
    }

    // Get movements within period
    const periodLines = await prisma.journalEntryLine.findMany({
      where: {
        accountId: { in: cashAccountIds },
        journalEntry: {
          companyId,
          entryDate: { gte: startDate, lte: endDate },
          status: 'POSTED',
        },
      },
      include: {
        account: true,
        journalEntry: true,
      },
      orderBy: {
        journalEntry: {
          entryDate: 'asc',
        },
      },
    });

    // Categorize cash flows
    const operatingActivities: any[] = [];
    const investingActivities: any[] = [];
    const financingActivities: any[] = [];

    let operatingCashFlow = 0;
    let investingCashFlow = 0;
    let financingCashFlow = 0;

    for (const line of periodLines) {
      const debit = new Decimal(line.debit.toString());
      const credit = new Decimal(line.credit.toString());
      const netChange = debit.minus(credit).toNumber();

      const activity = {
        date: line.journalEntry.entryDate,
        description: line.description || line.journalEntry.description,
        accountCode: line.account.code,
        accountName: line.account.name,
        amount: netChange,
      };

      // Simple categorization based on account code
      // In real app, this would be more sophisticated
      if (line.account.code.startsWith('6') || line.account.code.startsWith('7')) {
        // Operating activities (revenues and expenses)
        operatingActivities.push(activity);
        operatingCashFlow += netChange;
      } else if (line.account.code.startsWith('02')) {
        // Investing activities (fixed assets)
        investingActivities.push(activity);
        investingCashFlow += netChange;
      } else {
        // Financing activities (liabilities, equity)
        financingActivities.push(activity);
        financingCashFlow += netChange;
      }
    }

    const netCashFlow = operatingCashFlow + investingCashFlow + financingCashFlow;
    const closingBalance = openingBalance + netCashFlow;

    return {
      companyId,
      periodStart: startDate,
      periodEnd: endDate,
      reportType: 'CASH_FLOW',
      openingBalance,
      operatingActivities,
      investingActivities,
      financingActivities,
      operatingCashFlow,
      investingCashFlow,
      financingCashFlow,
      netCashFlow,
      closingBalance,
      cashAccounts: cashAccounts.map((a) => ({
        code: a.code,
        name: a.name,
      })),
    };
  }

  /**
   * Generate all reports at once
   */
  async generateAllReports(params: ReportParams) {
    const [balanceSheet, profitAndLoss, cashFlow] = await Promise.all([
      this.generateBalanceSheet(params),
      this.generateProfitAndLoss(params),
      this.generateCashFlow(params),
    ]);

    return {
      balanceSheet,
      profitAndLoss,
      cashFlow,
      generatedAt: new Date(),
    };
  }
}
