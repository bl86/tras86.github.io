import { Router } from 'express';
import { costCenterController } from '../controllers/cost-center.controller';
import { authenticate } from '@/modules/auth/presentation/middlewares/authenticate';

export const costCenterRouter = Router();
costCenterRouter.use(authenticate);

costCenterRouter.get('/:companyId/cost-centers', costCenterController.getCostCenters.bind(costCenterController));
costCenterRouter.post('/:companyId/cost-centers', costCenterController.createCostCenter.bind(costCenterController));
costCenterRouter.put('/:companyId/cost-centers/:costCenterId', costCenterController.updateCostCenter.bind(costCenterController));
costCenterRouter.delete('/:companyId/cost-centers/:costCenterId', costCenterController.deleteCostCenter.bind(costCenterController));
