/**
 * Account Controller
 */

import { Request, Response } from 'express';
import { ChartOfAccountsService } from '../../application/chart-of-accounts.service';
import {
  createAccountSchema,
  updateAccountSchema,
  accountMappingSchema,
} from '../dtos/account.dto';

const chartOfAccountsService = new ChartOfAccountsService();

/**
 * Get all accounts for a company
 * GET /api/v1/companies/:companyId/accounts
 */
export const getAccounts = async (req: Request, res: Response): Promise<void> => {
  const { companyId } = req.params;
  const accounts = await chartOfAccountsService.getAccounts(companyId);

  res.status(200).json({
    status: 'success',
    data: { accounts },
  });
};

/**
 * Get account hierarchy
 * GET /api/v1/companies/:companyId/accounts/hierarchy
 */
export const getAccountHierarchy = async (req: Request, res: Response): Promise<void> => {
  const { companyId } = req.params;
  const hierarchy = await chartOfAccountsService.getAccountHierarchy(companyId);

  res.status(200).json({
    status: 'success',
    data: { hierarchy },
  });
};

/**
 * Get account by ID
 * GET /api/v1/companies/:companyId/accounts/:id
 */
export const getAccountById = async (req: Request, res: Response): Promise<void> => {
  const { companyId, id } = req.params;
  const account = await chartOfAccountsService.getAccountById(id, companyId);

  res.status(200).json({
    status: 'success',
    data: { account },
  });
};

/**
 * Search accounts
 * GET /api/v1/companies/:companyId/accounts/search?q=query
 */
export const searchAccounts = async (req: Request, res: Response): Promise<void> => {
  const { companyId } = req.params;
  const { q } = req.query;

  if (!q || typeof q !== 'string') {
    res.status(400).json({
      status: 'error',
      message: 'Query parameter "q" is required',
    });
    return;
  }

  const accounts = await chartOfAccountsService.searchAccounts(companyId, q);

  res.status(200).json({
    status: 'success',
    data: { accounts },
  });
};

/**
 * Create new account
 * POST /api/v1/companies/:companyId/accounts
 */
export const createAccount = async (req: Request, res: Response): Promise<void> => {
  const { companyId } = req.params;
  const data = createAccountSchema.parse(req.body);

  const account = await chartOfAccountsService.createAccount(companyId, data);

  res.status(201).json({
    status: 'success',
    data: { account },
  });
};

/**
 * Update account
 * PATCH /api/v1/companies/:companyId/accounts/:id
 */
export const updateAccount = async (req: Request, res: Response): Promise<void> => {
  const { companyId, id } = req.params;
  const data = updateAccountSchema.parse(req.body);

  const account = await chartOfAccountsService.updateAccount(id, companyId, data);

  res.status(200).json({
    status: 'success',
    data: { account },
  });
};

/**
 * Deactivate account
 * DELETE /api/v1/companies/:companyId/accounts/:id
 */
export const deactivateAccount = async (req: Request, res: Response): Promise<void> => {
  const { companyId, id } = req.params;

  await chartOfAccountsService.deactivateAccount(id, companyId);

  res.status(200).json({
    status: 'success',
    message: 'Account deactivated successfully',
  });
};

/**
 * Get accounts by type
 * GET /api/v1/companies/:companyId/accounts/type/:type
 */
export const getAccountsByType = async (req: Request, res: Response): Promise<void> => {
  const { companyId, type } = req.params;

  const accounts = await chartOfAccountsService.getAccountsByType(companyId, type as any);

  res.status(200).json({
    status: 'success',
    data: { accounts },
  });
};

/**
 * Add account mapping
 * POST /api/v1/companies/:companyId/accounts/:id/mappings
 */
export const addAccountMapping = async (req: Request, res: Response): Promise<void> => {
  const { companyId, id } = req.params;
  const data = accountMappingSchema.parse(req.body);

  await chartOfAccountsService.addAccountMapping(id, companyId, data);

  res.status(201).json({
    status: 'success',
    message: 'Mapping added successfully',
  });
};

/**
 * Get account mappings
 * GET /api/v1/companies/:companyId/accounts/:id/mappings
 */
export const getAccountMappings = async (req: Request, res: Response): Promise<void> => {
  const { companyId, id } = req.params;

  const mappings = await chartOfAccountsService.getAccountMappings(id, companyId);

  res.status(200).json({
    status: 'success',
    data: { mappings },
  });
};

/**
 * Get account balance
 * GET /api/v1/companies/:companyId/accounts/:id/balance?year=2025&period=JANUARY
 */
export const getAccountBalance = async (req: Request, res: Response): Promise<void> => {
  const { companyId, id } = req.params;
  const { year, period } = req.query;

  if (!year || !period) {
    res.status(400).json({
      status: 'error',
      message: 'Year and period are required',
    });
    return;
  }

  const balance = await chartOfAccountsService.getAccountBalance(
    id,
    companyId,
    parseInt(year as string),
    period as string
  );

  res.status(200).json({
    status: 'success',
    data: { balance },
  });
};

/**
 * Bulk create accounts
 * POST /api/v1/companies/:companyId/accounts/bulk
 */
export const bulkCreateAccounts = async (req: Request, res: Response): Promise<void> => {
  const { companyId } = req.params;
  const { accounts } = req.body;

  if (!Array.isArray(accounts)) {
    res.status(400).json({
      status: 'error',
      message: 'Accounts must be an array',
    });
    return;
  }

  const result = await chartOfAccountsService.bulkCreateAccounts(companyId, accounts);

  res.status(201).json({
    status: 'success',
    data: result,
  });
};
