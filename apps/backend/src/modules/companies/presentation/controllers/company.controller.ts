/**
 * Company Controller
 */

import { Request, Response } from 'express';
import { CompanyService } from '../../application/company.service';
import {
  createCompanySchema,
  updateCompanySchema,
  grantAccessSchema,
} from '../dtos/company.dto';

const companyService = new CompanyService();

/**
 * Get all companies for current user
 * GET /api/v1/companies
 */
export const getUserCompanies = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const companies = await companyService.getUserCompanies(userId);

  res.status(200).json({
    status: 'success',
    data: { companies },
  });
};

/**
 * Get company by ID
 * GET /api/v1/companies/:id
 */
export const getCompanyById = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { id } = req.params;

  const company = await companyService.getCompanyById(id, userId);

  res.status(200).json({
    status: 'success',
    data: { company },
  });
};

/**
 * Create new company
 * POST /api/v1/companies
 */
export const createCompany = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const data = createCompanySchema.parse(req.body);

  const company = await companyService.createCompany(data, userId);

  res.status(201).json({
    status: 'success',
    data: { company },
  });
};

/**
 * Update company
 * PATCH /api/v1/companies/:id
 */
export const updateCompany = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { id } = req.params;
  const data = updateCompanySchema.parse(req.body);

  const company = await companyService.updateCompany(id, userId, data);

  res.status(200).json({
    status: 'success',
    data: { company },
  });
};

/**
 * Deactivate company
 * DELETE /api/v1/companies/:id
 */
export const deactivateCompany = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { id } = req.params;

  await companyService.deactivateCompany(id, userId);

  res.status(200).json({
    status: 'success',
    message: 'Company deactivated successfully',
  });
};

/**
 * Grant user access to company
 * POST /api/v1/companies/:id/users
 */
export const grantUserAccess = async (req: Request, res: Response): Promise<void> => {
  const grantedBy = req.user!.userId;
  const { id } = req.params;
  const { userId } = grantAccessSchema.parse(req.body);

  await companyService.grantUserAccess(id, userId, grantedBy);

  res.status(200).json({
    status: 'success',
    message: 'Access granted successfully',
  });
};

/**
 * Revoke user access from company
 * DELETE /api/v1/companies/:id/users/:userId
 */
export const revokeUserAccess = async (req: Request, res: Response): Promise<void> => {
  const revokedBy = req.user!.userId;
  const { id, userId } = req.params;

  await companyService.revokeUserAccess(id, userId, revokedBy);

  res.status(200).json({
    status: 'success',
    message: 'Access revoked successfully',
  });
};

/**
 * Get company users
 * GET /api/v1/companies/:id/users
 */
export const getCompanyUsers = async (req: Request, res: Response): Promise<void> => {
  const requesterId = req.user!.userId;
  const { id } = req.params;

  const users = await companyService.getCompanyUsers(id, requesterId);

  res.status(200).json({
    status: 'success',
    data: { users },
  });
};

/**
 * Get company statistics
 * GET /api/v1/companies/:id/stats
 */
export const getCompanyStats = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const { id } = req.params;

  const stats = await companyService.getCompanyStats(id, userId);

  res.status(200).json({
    status: 'success',
    data: stats,
  });
};
