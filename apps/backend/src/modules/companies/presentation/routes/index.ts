/**
 * Company Routes
 */

import { Router } from 'express';
import * as companyController from '../controllers/company.controller';
import { authenticate } from '@/modules/auth/presentation/middlewares/authenticate';
import { requirePermission } from '@/modules/auth/presentation/middlewares/authorize';

export const companyRouter = Router();

// All routes require authentication
companyRouter.use(authenticate);

/**
 * Company CRUD
 */
companyRouter.get('/', companyController.getUserCompanies);
companyRouter.get('/:id', companyController.getCompanyById);
companyRouter.post('/', requirePermission('COMPANY_CREATE'), companyController.createCompany);
companyRouter.patch('/:id', requirePermission('COMPANY_UPDATE'), companyController.updateCompany);
companyRouter.delete('/:id', requirePermission('COMPANY_DELETE'), companyController.deactivateCompany);

/**
 * User access management
 */
companyRouter.get('/:id/users', companyController.getCompanyUsers);
companyRouter.post('/:id/users', requirePermission('USER_MANAGE'), companyController.grantUserAccess);
companyRouter.delete('/:id/users/:userId', requirePermission('USER_MANAGE'), companyController.revokeUserAccess);

/**
 * Statistics
 */
companyRouter.get('/:id/stats', companyController.getCompanyStats);
