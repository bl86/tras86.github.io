/**
 * Authorization Middleware (RBAC)
 * Checks if user has required role or permission
 */

import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '@/shared/domain/errors/app-error';
import { UserRole, Permission } from '@prisma/client';
import { prisma } from '@/shared/infrastructure/database/prisma';

/**
 * Check if user has required role
 */
export const requireRole = (...roles: UserRole[]) => {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
      });

      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      if (!roles.includes(user.role as UserRole)) {
        throw new ForbiddenError('Insufficient permissions');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check if user has required permission
 */
export const requirePermission = (...permissions: Permission[]) => {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
      });

      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      // Super admin has all permissions
      if (user.role === 'SUPER_ADMIN') {
        return next();
      }

      // Check if user has required permissions
      const hasPermission = permissions.some((permission) =>
        user.permissions.includes(permission)
      );

      if (!hasPermission) {
        throw new ForbiddenError('Insufficient permissions');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check if user has access to company
 */
export const requireCompanyAccess = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    const companyId = req.params.companyId || req.body.companyId;

    if (!companyId) {
      throw new ForbiddenError('Company ID is required');
    }

    // Check if user has access to company
    const access = await prisma.userCompanyAccess.findFirst({
      where: {
        userId: req.user.userId,
        companyId,
      },
    });

    if (!access) {
      throw new ForbiddenError('No access to this company');
    }

    next();
  } catch (error) {
    next(error);
  }
};
