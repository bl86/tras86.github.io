/**
 * Main API Router
 * Combines all module routes
 */

import { Router } from 'express';
import { authRouter } from '@/modules/auth/presentation/routes';
import { companyRouter } from '@/modules/companies/presentation/routes';
import { chartOfAccountsRouter } from '@/modules/chart-of-accounts/presentation/routes';
import { partnerRouter } from '@/modules/partners/presentation/routes';
import { employeeRouter } from '@/modules/employees/presentation/routes';
import { costCenterRouter } from '@/modules/cost-centers/presentation/routes';
import { reportRouter } from '@/modules/reports/presentation/routes';

export const router = Router();

/**
 * API Version 1 Routes
 */
const v1Router = Router();

// Auth routes
v1Router.use('/auth', authRouter);

// Company routes
v1Router.use('/companies', companyRouter);

// Chart of Accounts routes (nested under companies)
v1Router.use('/companies', chartOfAccountsRouter);

// Partner routes (nested under companies)
v1Router.use('/companies', partnerRouter);

// Employee routes (nested under companies)
v1Router.use('/companies', employeeRouter);

// Cost Center routes (nested under companies)
v1Router.use('/companies', costCenterRouter);

// Report routes (nested under companies)
v1Router.use('/companies', reportRouter);

// Mount v1 routes
router.use('/v1', v1Router);

/**
 * API Documentation route
 */
router.get('/', (_req, res) => {
  res.json({
    message: 'Accounting System BiH - API',
    version: '1.0.0',
    endpoints: {
      v1: '/api/v1',
      health: '/health',
      docs: '/api/docs',
    },
    modules: {
      authentication: '/api/v1/auth',
      companies: '/api/v1/companies',
      chartOfAccounts: '/api/v1/companies/:companyId/accounts',
      generalLedger: '/api/v1/companies/:companyId/journal-entries',
      payroll: '/api/v1/companies/:companyId/payroll',
      reports: '/api/v1/companies/:companyId/reports',
    },
  });
});
