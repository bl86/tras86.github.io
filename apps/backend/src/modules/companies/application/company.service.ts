/**
 * Company Service
 * Handles company management and multi-tenancy
 */

import { prisma } from '@/shared/infrastructure/database/prisma';
import { cache } from '@/shared/infrastructure/cache/redis';
import { NotFoundError, ConflictError, ForbiddenError } from '@/shared/domain/errors/app-error';
import { CreateCompanyDto, UpdateCompanyDto } from '../presentation/dtos/company.dto';
import { Company } from '@prisma/client';

export class CompanyService {
  /**
   * Get all companies for a user
   */
  async getUserCompanies(userId: string): Promise<Company[]> {
    const cacheKey = `user:${userId}:companies`;

    // Try cache first
    const cached = await cache.get<Company[]>(cacheKey);
    if (cached) return cached;

    // Get from database
    const userCompanyAccess = await prisma.userCompanyAccess.findMany({
      where: { userId },
      include: { company: true },
    });

    const companies = userCompanyAccess.map((access: { company: Company }) => access.company);

    // Cache for 1 hour
    await cache.set(cacheKey, companies, 3600);

    return companies;
  }

  /**
   * Get company by ID
   */
  async getCompanyById(companyId: string, userId: string): Promise<Company> {
    // Check if user has access
    const hasAccess = await this.checkUserAccess(userId, companyId);
    if (!hasAccess) {
      throw new ForbiddenError('No access to this company');
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundError('Company not found');
    }

    return company;
  }

  /**
   * Create new company
   */
  async createCompany(data: CreateCompanyDto, createdBy: string): Promise<Company> {
    // Check if company with same tax number exists
    const existingCompany = await prisma.company.findUnique({
      where: { taxNumber: data.taxNumber },
    });

    if (existingCompany) {
      throw new ConflictError('Company with this tax number already exists');
    }

    // Create company
    const company = await prisma.company.create({
      data: {
        ...data,
        isActive: true,
      },
    });

    // Grant access to creator
    await prisma.userCompanyAccess.create({
      data: {
        userId: createdBy,
        companyId: company.id,
      },
    });

    // Invalidate cache
    await cache.del(`user:${createdBy}:companies`);

    return company;
  }

  /**
   * Update company
   */
  async updateCompany(
    companyId: string,
    userId: string,
    data: UpdateCompanyDto
  ): Promise<Company> {
    // Check access
    await this.getCompanyById(companyId, userId);

    // If changing tax number, check for conflicts
    if (data.taxNumber) {
      const existing = await prisma.company.findUnique({
        where: { taxNumber: data.taxNumber },
      });

      if (existing && existing.id !== companyId) {
        throw new ConflictError('Company with this tax number already exists');
      }
    }

    // Update company
    const company = await prisma.company.update({
      where: { id: companyId },
      data,
    });

    // Invalidate cache for all users with access
    await this.invalidateCompanyCache(companyId);

    return company;
  }

  /**
   * Deactivate company
   */
  async deactivateCompany(companyId: string, userId: string): Promise<void> {
    // Check access
    await this.getCompanyById(companyId, userId);

    await prisma.company.update({
      where: { id: companyId },
      data: { isActive: false },
    });

    // Invalidate cache
    await this.invalidateCompanyCache(companyId);
  }

  /**
   * Grant user access to company
   */
  async grantUserAccess(companyId: string, targetUserId: string, grantedBy: string): Promise<void> {
    // Check if granter has access
    await this.getCompanyById(companyId, grantedBy);

    // Check if target user exists
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Check if access already exists
    const existingAccess = await prisma.userCompanyAccess.findFirst({
      where: {
        userId: targetUserId,
        companyId,
      },
    });

    if (existingAccess) {
      throw new ConflictError('User already has access to this company');
    }

    // Grant access
    await prisma.userCompanyAccess.create({
      data: {
        userId: targetUserId,
        companyId,
      },
    });

    // Invalidate cache
    await cache.del(`user:${targetUserId}:companies`);
  }

  /**
   * Revoke user access from company
   */
  async revokeUserAccess(companyId: string, targetUserId: string, revokedBy: string): Promise<void> {
    // Check if revoker has access
    await this.getCompanyById(companyId, revokedBy);

    // Find and delete access
    const access = await prisma.userCompanyAccess.findFirst({
      where: {
        userId: targetUserId,
        companyId,
      },
    });

    if (!access) {
      throw new NotFoundError('User does not have access to this company');
    }

    await prisma.userCompanyAccess.delete({
      where: { id: access.id },
    });

    // Invalidate cache
    await cache.del(`user:${targetUserId}:companies`);
  }

  /**
   * Get all users with access to company
   */
  async getCompanyUsers(companyId: string, requesterId: string) {
    // Check access
    await this.getCompanyById(companyId, requesterId);

    const accesses = await prisma.userCompanyAccess.findMany({
      where: { companyId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true,
          },
        },
      },
    });

    return accesses.map((access: {
      user: {
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        role: string;
        isActive: boolean;
      };
    }) => access.user);
  }

  /**
   * Check if user has access to company
   */
  async checkUserAccess(userId: string, companyId: string): Promise<boolean> {
    const access = await prisma.userCompanyAccess.findFirst({
      where: {
        userId,
        companyId,
      },
    });

    return !!access;
  }

  /**
   * Invalidate cache for all users with access to company
   */
  private async invalidateCompanyCache(companyId: string): Promise<void> {
    const accesses = await prisma.userCompanyAccess.findMany({
      where: { companyId },
      select: { userId: true },
    });

    for (const access of accesses) {
      await cache.del(`user:${access.userId}:companies`);
    }
  }

  /**
   * Get company statistics
   */
  async getCompanyStats(companyId: string, userId: string) {
    await this.getCompanyById(companyId, userId);

    const [accountsCount, journalEntriesCount, invoicesCount, employeesCount] = await Promise.all([
      prisma.account.count({ where: { companyId, isActive: true } }),
      prisma.journalEntry.count({ where: { companyId } }),
      prisma.invoice.count({ where: { companyId } }),
      prisma.employee.count({ where: { companyId, isActive: true } }),
    ]);

    return {
      accountsCount,
      journalEntriesCount,
      invoicesCount,
      employeesCount,
    };
  }
}
