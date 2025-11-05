/**
 * Main API Router
 * Combines all module routes
 */

import { Router } from 'express';
import { authRouter } from '@/modules/auth/presentation/routes';

export const router = Router();

/**
 * API Version 1 Routes
 */
const v1Router = Router();

// Auth routes
v1Router.use('/auth', authRouter);

// TODO: Add other module routes
// v1Router.use('/companies', companyRouter);
// v1Router.use('/accounts', accountRouter);
// v1Router.use('/journal-entries', journalEntryRouter);
// v1Router.use('/invoices', invoiceRouter);
// v1Router.use('/payroll', payrollRouter);
// v1Router.use('/reports', reportRouter);

// Mount v1 routes
router.use('/v1', v1Router);

/**
 * API Documentation route
 */
router.get('/', (req, res) => {
  res.json({
    message: 'Accounting System BiH - API',
    version: '1.0.0',
    endpoints: {
      v1: '/api/v1',
      health: '/health',
      docs: '/api/docs',
    },
  });
});
