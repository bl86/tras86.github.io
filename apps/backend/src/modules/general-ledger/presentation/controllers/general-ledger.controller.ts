/**
 * General Ledger Controller
 */

import { Request, Response, NextFunction } from 'express';
import { GeneralLedgerService } from '../../application/general-ledger.service';
import { JournalEntryStatus, FiscalPeriod, DocumentType } from '@prisma/client';

const generalLedgerService = new GeneralLedgerService();

export class GeneralLedgerController {
  async getJournalEntries(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { companyId } = req.params;
      const filters = {
        fiscalYear: req.query.fiscalYear ? parseInt(req.query.fiscalYear as string) : undefined,
        fiscalPeriod: req.query.fiscalPeriod as FiscalPeriod | undefined,
        status: req.query.status as JournalEntryStatus | undefined,
        accountId: req.query.accountId as string | undefined,
        dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
        dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      };

      const result = await generalLedgerService.getJournalEntries(companyId, filters);

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getJournalEntry(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { companyId, entryId } = req.params;
      const entry = await generalLedgerService.getJournalEntryById(entryId, companyId);

      res.status(200).json({
        status: 'success',
        data: { entry },
      });
    } catch (error) {
      next(error);
    }
  }

  async createJournalEntry(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { companyId } = req.params;
      const userId = req.user!.userId;
      const data = {
        ...req.body,
        entryDate: new Date(req.body.entryDate),
        postingDate: new Date(req.body.postingDate),
        documentType: req.body.documentType as DocumentType,
        fiscalPeriod: req.body.fiscalPeriod as FiscalPeriod,
      };

      const entry = await generalLedgerService.createJournalEntry(companyId, userId, data);

      res.status(201).json({
        status: 'success',
        data: { entry },
      });
    } catch (error) {
      next(error);
    }
  }

  async postJournalEntry(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { companyId, entryId } = req.params;
      const userId = req.user!.userId;

      const entry = await generalLedgerService.postJournalEntry(entryId, companyId, userId);

      res.status(200).json({
        status: 'success',
        data: { entry },
      });
    } catch (error) {
      next(error);
    }
  }

  async approveJournalEntry(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { companyId, entryId } = req.params;
      const userId = req.user!.userId;

      const entry = await generalLedgerService.approveJournalEntry(entryId, companyId, userId);

      res.status(200).json({
        status: 'success',
        data: { entry },
      });
    } catch (error) {
      next(error);
    }
  }

  async reverseJournalEntry(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { companyId, entryId } = req.params;
      const userId = req.user!.userId;
      const { reversalDate } = req.body;

      const entry = await generalLedgerService.reverseJournalEntry(
        entryId,
        companyId,
        userId,
        new Date(reversalDate)
      );

      res.status(200).json({
        status: 'success',
        data: { entry },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteJournalEntry(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { companyId, entryId } = req.params;

      await generalLedgerService.deleteJournalEntry(entryId, companyId);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const generalLedgerController = new GeneralLedgerController();
