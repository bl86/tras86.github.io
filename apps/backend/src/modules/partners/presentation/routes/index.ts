/**
 * Partner Routes
 */

import { Router } from 'express';
import { partnerController } from '../controllers/partner.controller';
import { authenticate } from '@/modules/auth/presentation/middlewares/authenticate';

export const partnerRouter = Router();

// All routes require authentication
partnerRouter.use(authenticate);

// Partner routes (nested under /companies/:companyId)
partnerRouter.get('/:companyId/partners', partnerController.getPartners.bind(partnerController));
partnerRouter.get('/:companyId/partners/:partnerId', partnerController.getPartner.bind(partnerController));
partnerRouter.post('/:companyId/partners', partnerController.createPartner.bind(partnerController));
partnerRouter.put('/:companyId/partners/:partnerId', partnerController.updatePartner.bind(partnerController));
partnerRouter.delete('/:companyId/partners/:partnerId', partnerController.deletePartner.bind(partnerController));
