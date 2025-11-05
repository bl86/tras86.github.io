/**
 * Report Routes
 */

import { Router } from 'express';
import { authenticate } from '@/modules/auth/presentation/middlewares/authenticate';
import { reportController } from '../controllers/report.controller';

export const reportRouter = Router();

reportRouter.use(authenticate);

// Generate reports
reportRouter.get('/:companyId/reports/balance-sheet', reportController.generateBalanceSheet.bind(reportController));
reportRouter.get('/:companyId/reports/profit-and-loss', reportController.generateProfitAndLoss.bind(reportController));
reportRouter.get('/:companyId/reports/cash-flow', reportController.generateCashFlow.bind(reportController));
reportRouter.get('/:companyId/reports/all', reportController.generateAllReports.bind(reportController));
