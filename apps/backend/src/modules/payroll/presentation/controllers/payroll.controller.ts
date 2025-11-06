/**
 * Payroll Controller
 * Handles payroll operations and salary calculations
 */

import { Request, Response, NextFunction } from 'express';
import { PayrollService } from '../../application/payroll.service';
import { LegalEntity } from '@prisma/client';
import { payrollCalculationService } from '../../domain/payroll-calculation.service';

const payrollService = new PayrollService();

export class PayrollController {
  /**
   * Get all payroll runs for a company
   */
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

  /**
   * Get single payroll run by ID
   */
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

  /**
   * Create new payroll run
   */
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

  /**
   * Approve payroll run
   */
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

  /**
   * Calculate payroll preview (without saving)
   * For testing and reviewing before creating actual payroll run
   */
  async calculatePayrollPreview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { companyId } = req.params;
      const { entity } = req.query;

      const preview = await payrollService.calculatePayrollPreview(
        companyId,
        entity as LegalEntity
      );

      res.status(200).json({
        status: 'success',
        data: { preview },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Calculate single salary from GROSS amount
   * For testing individual salary calculations
   */
  async calculateFromGross(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { entity, grossAmount } = req.body;

      const calculation = payrollCalculationService.calculateFromGross(
        entity as LegalEntity,
        parseFloat(grossAmount)
      );

      res.status(200).json({
        status: 'success',
        data: {
          calculation: {
            ...calculation,
            grossSalary: calculation.grossSalary.toNumber(),
            netSalary: calculation.netSalary.toNumber(),
            piEmployee: calculation.piEmployee.toNumber(),
            healthEmployee: calculation.healthEmployee.toNumber(),
            unemploymentEmployee: calculation.unemploymentEmployee.toNumber(),
            totalEmployeeContributions: calculation.totalEmployeeContributions.toNumber(),
            piEmployer: calculation.piEmployer.toNumber(),
            healthEmployer: calculation.healthEmployer.toNumber(),
            unemploymentEmployer: calculation.unemploymentEmployer.toNumber(),
            totalEmployerContributions: calculation.totalEmployerContributions.toNumber(),
            taxableBase: calculation.taxableBase.toNumber(),
            personalDeduction: calculation.personalDeduction.toNumber(),
            taxableIncome: calculation.taxableIncome.toNumber(),
            incomeTax: calculation.incomeTax.toNumber(),
            totalCost: calculation.totalCost.toNumber(),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Calculate single salary from NET amount
   * For reverse calculation (net → gross)
   */
  async calculateFromNet(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { entity, netAmount } = req.body;

      const calculation = payrollCalculationService.calculateFromNet(
        entity as LegalEntity,
        parseFloat(netAmount)
      );

      res.status(200).json({
        status: 'success',
        data: {
          calculation: {
            ...calculation,
            grossSalary: calculation.grossSalary.toNumber(),
            netSalary: calculation.netSalary.toNumber(),
            piEmployee: calculation.piEmployee.toNumber(),
            healthEmployee: calculation.healthEmployee.toNumber(),
            unemploymentEmployee: calculation.unemploymentEmployee.toNumber(),
            totalEmployeeContributions: calculation.totalEmployeeContributions.toNumber(),
            piEmployer: calculation.piEmployer.toNumber(),
            healthEmployer: calculation.healthEmployer.toNumber(),
            unemploymentEmployer: calculation.unemploymentEmployer.toNumber(),
            totalEmployerContributions: calculation.totalEmployerContributions.toNumber(),
            taxableBase: calculation.taxableBase.toNumber(),
            personalDeduction: calculation.personalDeduction.toNumber(),
            taxableIncome: calculation.taxableIncome.toNumber(),
            incomeTax: calculation.incomeTax.toNumber(),
            totalCost: calculation.totalCost.toNumber(),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get tax rates for specific entity
   */
  async getTaxRates(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { entity } = req.params;

      const rates = payrollCalculationService.getTaxRates(entity as LegalEntity);

      res.status(200).json({
        status: 'success',
        data: { rates },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const payrollController = new PayrollController();
