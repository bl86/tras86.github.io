/**
 * Cost Center Service
 */

import { prisma } from '@/shared/infrastructure/database/prisma';
import { cache } from '@/shared/infrastructure/cache/redis';
import { NotFoundError, ConflictError } from '@/shared/domain/errors/app-error';

interface CreateCostCenterDto {
  code: string;
  name: string;
  description?: string;
}

export class CostCenterService {
  async getCostCenters(companyId: string) {
    const cacheKey = `cost-centers:${companyId}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const costCenters = await prisma.costCenter.findMany({
      where: { companyId, isActive: true },
      orderBy: { code: 'asc' },
    });

    await cache.set(cacheKey, costCenters, 3600);
    return costCenters;
  }

  async getCostCenterById(costCenterId: string, companyId: string) {
    const costCenter = await prisma.costCenter.findFirst({
      where: { id: costCenterId, companyId },
    });

    if (!costCenter) {
      throw new NotFoundError('Cost center not found');
    }

    return costCenter;
  }

  async createCostCenter(companyId: string, data: CreateCostCenterDto) {
    const existing = await prisma.costCenter.findFirst({
      where: { companyId, code: data.code },
    });

    if (existing) {
      throw new ConflictError(`Cost center with code ${data.code} already exists`);
    }

    const costCenter = await prisma.costCenter.create({
      data: {
        ...data,
        companyId,
        isActive: true,
      },
    });

    await cache.del(`cost-centers:${companyId}`);
    return costCenter;
  }

  async updateCostCenter(costCenterId: string, companyId: string, data: Partial<CreateCostCenterDto>) {
    await this.getCostCenterById(costCenterId, companyId);

    const costCenter = await prisma.costCenter.update({
      where: { id: costCenterId },
      data,
    });

    await cache.del(`cost-centers:${companyId}`);
    return costCenter;
  }

  async deactivateCostCenter(costCenterId: string, companyId: string) {
    await this.getCostCenterById(costCenterId, companyId);

    await prisma.costCenter.update({
      where: { id: costCenterId },
      data: { isActive: false },
    });

    await cache.del(`cost-centers:${companyId}`);
  }
}
