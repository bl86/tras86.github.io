/**
 * Employee Controller
 */

import { Request, Response, NextFunction } from 'express';
import { prisma } from '@/shared/infrastructure/database/prisma';
import { NotFoundError } from '@/shared/domain/errors/app-error';

export class EmployeeController {
  async getEmployees(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { companyId } = req.params;

      const employees = await prisma.employee.findMany({
        where: { companyId },
        orderBy: { lastName: 'asc' },
      });

      res.json(employees);
    } catch (error) {
      next(error);
    }
  }

  async getEmployee(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { companyId, employeeId } = req.params;

      const employee = await prisma.employee.findFirst({
        where: { id: employeeId, companyId },
      });

      if (!employee) {
        throw new NotFoundError('Employee not found');
      }

      res.json(employee);
    } catch (error) {
      next(error);
    }
  }

  async createEmployee(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { companyId } = req.params;
      const data = req.body;

      const employee = await prisma.employee.create({
        data: {
          ...data,
          companyId,
          isActive: true,
        },
      });

      res.status(201).json(employee);
    } catch (error) {
      next(error);
    }
  }

  async updateEmployee(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { companyId, employeeId } = req.params;
      const data = req.body;

      const employee = await prisma.employee.updateMany({
        where: { id: employeeId, companyId },
        data,
      });

      if (employee.count === 0) {
        throw new NotFoundError('Employee not found');
      }

      const updated = await prisma.employee.findFirst({
        where: { id: employeeId, companyId },
      });

      res.json(updated);
    } catch (error) {
      next(error);
    }
  }

  async deleteEmployee(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { companyId, employeeId } = req.params;

      const result = await prisma.employee.deleteMany({
        where: { id: employeeId, companyId },
      });

      if (result.count === 0) {
        throw new NotFoundError('Employee not found');
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const employeeController = new EmployeeController();
