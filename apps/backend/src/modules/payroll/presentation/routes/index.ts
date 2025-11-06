/**
 * Payroll Routes
 */

import { Router } from 'express';
import { payrollController } from '../controllers/payroll.controller';
import { authenticate } from '@/modules/auth/presentation/middlewares/authenticate';

export const payrollRouter = Router();

// All routes require authentication
payrollRouter.use(authenticate);

// Payroll routes (nested under /companies/:companyId)
payrollRouter.get('/:companyId/payroll', payrollController.getPayrollRuns.bind(payrollController));
payrollRouter.get('/:companyId/payroll/:payrollId', payrollController.getPayrollRun.bind(payrollController));
payrollRouter.post('/:companyId/payroll', payrollController.createPayrollRun.bind(payrollController));
payrollRouter.post('/:companyId/payroll/:payrollId/approve', payrollController.approvePayrollRun.bind(payrollController));
