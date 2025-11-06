/**
 * General Ledger Routes
 */

import { Router } from 'express';
import { generalLedgerController } from '../controllers/general-ledger.controller';
import { authenticate } from '@/modules/auth/presentation/middlewares/authenticate';

export const generalLedgerRouter = Router();

// All routes require authentication
generalLedgerRouter.use(authenticate);

// Journal Entry routes (nested under /companies/:companyId)
generalLedgerRouter.get('/:companyId/journal-entries', generalLedgerController.getJournalEntries.bind(generalLedgerController));
generalLedgerRouter.get('/:companyId/journal-entries/:entryId', generalLedgerController.getJournalEntry.bind(generalLedgerController));
generalLedgerRouter.post('/:companyId/journal-entries', generalLedgerController.createJournalEntry.bind(generalLedgerController));
generalLedgerRouter.post('/:companyId/journal-entries/:entryId/post', generalLedgerController.postJournalEntry.bind(generalLedgerController));
generalLedgerRouter.post('/:companyId/journal-entries/:entryId/approve', generalLedgerController.approveJournalEntry.bind(generalLedgerController));
generalLedgerRouter.post('/:companyId/journal-entries/:entryId/reverse', generalLedgerController.reverseJournalEntry.bind(generalLedgerController));
generalLedgerRouter.delete('/:companyId/journal-entries/:entryId', generalLedgerController.deleteJournalEntry.bind(generalLedgerController));
