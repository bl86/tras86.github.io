/**
 * Payroll Routes
 */

import { Router } from 'express';
import { payrollController } from '../controllers/payroll.controller';
import { authenticate } from '@/modules/auth/presentation/middlewares/authenticate';

export const payrollRouter = Router();

// All routes require authentication
payrollRouter.use(authenticate);

// Payroll Management Routes (nested under /companies/:companyId)
payrollRouter.get('/:companyId/payroll', payrollController.getPayrollRuns.bind(payrollController));
payrollRouter.get('/:companyId/payroll/:payrollId', payrollController.getPayrollRun.bind(payrollController));
payrollRouter.post('/:companyId/payroll', payrollController.createPayrollRun.bind(payrollController));
payrollRouter.post('/:companyId/payroll/:payrollId/approve', payrollController.approvePayrollRun.bind(payrollController));

// Payroll Calculation Routes (for testing and preview)
payrollRouter.get('/:companyId/payroll-preview', payrollController.calculatePayrollPreview.bind(payrollController));

// Salary Calculation Router (independent)
export const payrollCalculationRouter = Router();

payrollCalculationRouter.use(authenticate);

// Salary calculation endpoints (for testing)
payrollCalculationRouter.post('/calculate/from-gross', payrollController.calculateFromGross.bind(payrollController));
payrollCalculationRouter.post('/calculate/from-net', payrollController.calculateFromNet.bind(payrollController));
payrollCalculationRouter.get('/tax-rates/:entity', payrollController.getTaxRates.bind(payrollController));
