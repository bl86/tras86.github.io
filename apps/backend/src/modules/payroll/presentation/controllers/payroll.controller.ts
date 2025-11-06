/**
 * Payroll Controller
 */

import { Request, Response, NextFunction } from 'express';
import { PayrollService } from '../../application/payroll.service';
import { LegalEntity } from '@prisma/client';

const payrollService = new PayrollService();

export class PayrollController {
  async getPayrollRuns(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { companyId } = req.params;
      const payrollRuns = await payrollService.getPayrollRuns(companyId);

      res.status(200).json({
        status: 'success',
        data: { payrollRuns },
      });
    } catch (error) {
      next(error);
    }
  }

  async getPayrollRun(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { companyId, payrollId } = req.params;
      const payrollRun = await payrollService.getPayrollRun(payrollId, companyId);

      res.status(200).json({
        status: 'success',
        data: { payrollRun },
      });
    } catch (error) {
      next(error);
    }
  }

  async createPayrollRun(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { companyId } = req.params;
      const userId = req.user!.userId;
      const { period, entity } = req.body;

      const payrollRun = await payrollService.createPayrollRun(
        companyId,
        period,
        entity as LegalEntity,
        userId
      );

      res.status(201).json({
        status: 'success',
        data: { payrollRun },
      });
    } catch (error) {
      next(error);
    }
  }

  async approvePayrollRun(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { companyId, payrollId } = req.params;
      const userId = req.user!.userId;

      const payrollRun = await payrollService.approvePayrollRun(payrollId, companyId, userId);

      res.status(200).json({
        status: 'success',
        data: { payrollRun },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const payrollController = new PayrollController();
