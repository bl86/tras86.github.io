/**
 * Cost Center Controller
 */

import { Request, Response, NextFunction } from 'express';
import { prisma } from '@/shared/infrastructure/database/prisma';
import { NotFoundError } from '@/shared/domain/errors/app-error';

export class CostCenterController {
  async getCostCenters(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { companyId } = req.params;
      const costCenters = await prisma.costCenter.findMany({
        where: { companyId },
        orderBy: { code: 'asc' },
      });
      res.json(costCenters);
    } catch (error) {
      next(error);
    }
  }

  async createCostCenter(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { companyId } = req.params;
      const costCenter = await prisma.costCenter.create({
        data: { ...req.body, companyId, isActive: true },
      });
      res.status(201).json(costCenter);
    } catch (error) {
      next(error);
    }
  }

  async updateCostCenter(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { companyId, costCenterId } = req.params;
      const costCenter = await prisma.costCenter.updateMany({
        where: { id: costCenterId, companyId },
        data: req.body,
      });
      if (costCenter.count === 0) throw new NotFoundError('Cost center not found');
      const updated = await prisma.costCenter.findFirst({ where: { id: costCenterId } });
      res.json(updated);
    } catch (error) {
      next(error);
    }
  }

  async deleteCostCenter(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { companyId, costCenterId } = req.params;
      const result = await prisma.costCenter.deleteMany({
        where: { id: costCenterId, companyId },
      });
      if (result.count === 0) throw new NotFoundError('Cost center not found');
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const costCenterController = new CostCenterController();
