/**
 * Chart of Accounts Routes
 */

import { Router } from 'express';
import * as accountController from '../controllers/account.controller';
import { authenticate } from '@/modules/auth/presentation/middlewares/authenticate';
import { requireCompanyAccess } from '@/modules/auth/presentation/middlewares/authorize';

export const chartOfAccountsRouter = Router();

// All routes require authentication and company access
chartOfAccountsRouter.use(authenticate);
chartOfAccountsRouter.use('/:companyId/*', requireCompanyAccess);

/**
 * Account CRUD
 */
chartOfAccountsRouter.get('/:companyId/accounts', accountController.getAccounts);
chartOfAccountsRouter.get('/:companyId/accounts/hierarchy', accountController.getAccountHierarchy);
chartOfAccountsRouter.get('/:companyId/accounts/search', accountController.searchAccounts);
chartOfAccountsRouter.get('/:companyId/accounts/type/:type', accountController.getAccountsByType);
chartOfAccountsRouter.get('/:companyId/accounts/:id', accountController.getAccountById);
chartOfAccountsRouter.post('/:companyId/accounts', accountController.createAccount);
chartOfAccountsRouter.post('/:companyId/accounts/bulk', accountController.bulkCreateAccounts);
chartOfAccountsRouter.patch('/:companyId/accounts/:id', accountController.updateAccount);
chartOfAccountsRouter.delete('/:companyId/accounts/:id', accountController.deactivateAccount);

/**
 * Account mappings
 */
chartOfAccountsRouter.get('/:companyId/accounts/:id/mappings', accountController.getAccountMappings);
chartOfAccountsRouter.post('/:companyId/accounts/:id/mappings', accountController.addAccountMapping);

/**
 * Account balance
 */
chartOfAccountsRouter.get('/:companyId/accounts/:id/balance', accountController.getAccountBalance);
