/**
 * Partner Service
 * Manages customers and suppliers
 */

import { prisma } from '@/shared/infrastructure/database/prisma';
import { cache } from '@/shared/infrastructure/cache/redis';
import { NotFoundError } from '@/shared/domain/errors/app-error';

interface CreatePartnerDto {
  name: string;
  type: string;
  taxNumber?: string;
  vatNumber?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  email?: string;
  phone?: string;
  bankAccount?: string;
  swift?: string;
}

export class PartnerService {
  async getPartners(companyId: string) {
    const cacheKey = `partners:${companyId}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const partners = await prisma.partner.findMany({
      where: { companyId, isActive: true },
      orderBy: { name: 'asc' },
    });

    await cache.set(cacheKey, partners, 3600);
    return partners;
  }

  async getPartnerById(partnerId: string, companyId: string) {
    const partner = await prisma.partner.findFirst({
      where: { id: partnerId, companyId },
    });

    if (!partner) {
      throw new NotFoundError('Partner not found');
    }

    return partner;
  }

  async createPartner(companyId: string, data: CreatePartnerDto) {
    const partner = await prisma.partner.create({
      data: {
        ...data,
        companyId,
        isActive: true,
      },
    });

    await cache.del(`partners:${companyId}`);
    return partner;
  }

  async updatePartner(partnerId: string, companyId: string, data: Partial<CreatePartnerDto>) {
    await this.getPartnerById(partnerId, companyId);

    const partner = await prisma.partner.update({
      where: { id: partnerId },
      data,
    });

    await cache.del(`partners:${companyId}`);
    return partner;
  }

  async deactivatePartner(partnerId: string, companyId: string) {
    await this.getPartnerById(partnerId, companyId);

    await prisma.partner.update({
      where: { id: partnerId },
      data: { isActive: false },
    });

    await cache.del(`partners:${companyId}`);
  }

  async searchPartners(companyId: string, query: string) {
    return prisma.partner.findMany({
      where: {
        companyId,
        isActive: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { taxNumber: { contains: query } },
        ],
      },
      take: 20,
    });
  }
}
