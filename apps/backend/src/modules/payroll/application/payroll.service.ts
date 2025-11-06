/**
 * Payroll Service
 * Manages payroll runs and calculations for BiH entities
 * Uses PayrollCalculationService for accurate 2025 tax calculations
 */

import { prisma } from '@/shared/infrastructure/database/prisma';
import { NotFoundError, BadRequestError } from '@/shared/domain/errors/app-error';
import { LegalEntity, PayrollStatus } from '@prisma/client';
import { payrollCalculationService } from '../domain/payroll-calculation.service';
import Decimal from 'decimal.js';

export class PayrollService {
  /**
   * Calculate individual employee payroll
   */
  calculateEmployeePayroll(
    employeeGrossSalary: number | Decimal,
    entity: LegalEntity
  ) {
    const calculation = payrollCalculationService.calculateFromGross(
      entity,
      employeeGrossSalary
    );

    return {
      grossSalary: calculation.grossSalary.toNumber(),
      netSalary: calculation.netSalary.toNumber(),
      incomeTax: calculation.incomeTax.toNumber(),
      pioEmployee: calculation.piEmployee.toNumber(),
      healthEmployee: calculation.healthEmployee.toNumber(),
      unemploymentEmployee: calculation.unemploymentEmployee.toNumber(),
      pioEmployer: calculation.piEmployer.toNumber(),
      healthEmployer: calculation.healthEmployer.toNumber(),
      unemploymentEmployer: calculation.unemploymentEmployer.toNumber(),
      totalCost: calculation.totalCost.toNumber(),
    };
  }

  /**
   * Create payroll run for a company
   */
  async createPayrollRun(
    companyId: string,
    period: string,
    entity: LegalEntity,
    userId: string
  ) {
    // Check if payroll for this period already exists
    const existing = await prisma.payrollRun.findFirst({
      where: { companyId, period, entity },
    });

    if (existing) {
      throw new BadRequestError(
        `Payroll for period ${period} and entity ${entity} already exists`
      );
    }

    // Get all active employees for this entity
    const employees = await prisma.employee.findMany({
      where: {
        companyId,
        entity,
        isActive: true,
      },
    });

    if (employees.length === 0) {
      throw new BadRequestError(
        `No active employees found for entity ${entity}`
      );
    }

    // Calculate payroll for each employee
    const employeePayrolls = employees.map((employee: any) => {
      const grossSalary = parseFloat(employee.grossSalary.toString());
      const calculation = this.calculateEmployeePayroll(grossSalary, entity);

      return {
        employeeId: employee.id,
        grossSalary: calculation.grossSalary,
        netSalary: calculation.netSalary,
        incomeTax: calculation.incomeTax,
        pioEmployee: calculation.pioEmployee,
        healthEmployee: calculation.healthEmployee,
        unemploymentEmployee: calculation.unemploymentEmployee,
        pioEmployer: calculation.pioEmployer,
        healthEmployer: calculation.healthEmployer,
        unemploymentEmployer: calculation.unemploymentEmployer,
        totalDeductions:
          calculation.pioEmployee +
          calculation.healthEmployee +
          calculation.unemploymentEmployee +
          calculation.incomeTax,
        totalEmployerCost:
          calculation.pioEmployer +
          calculation.healthEmployer +
          calculation.unemploymentEmployer,
        deductions: null,
        additions: null,
      };
    });

    // Calculate totals
    const totalGross = employeePayrolls.reduce(
      (sum: number, p: any) => sum + p.grossSalary,
      0
    );
    const totalNet = employeePayrolls.reduce((sum: number, p: any) => sum + p.netSalary, 0);
    const totalTax = employeePayrolls.reduce((sum: number, p: any) => sum + p.incomeTax, 0);
    const totalSocialContributions = employeePayrolls.reduce(
      (sum: number, p: any) =>
        sum +
        p.pioEmployee +
        p.healthEmployee +
        p.unemploymentEmployee +
        p.pioEmployer +
        p.healthEmployer +
        p.unemploymentEmployer,
      0
    );

    // Create payroll run with employee details
    const payrollRun = await prisma.payrollRun.create({
      data: {
        period,
        entity,
        status: PayrollStatus.CALCULATED,
        totalGross,
        totalNet,
        totalTax,
        totalSocialContributions,
        companyId,
        calculatedById: userId,
        employees: {
          create: employeePayrolls,
        },
      },
      include: {
        employees: {
          include: {
            employee: true,
          },
        },
        calculatedBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return payrollRun;
  }

  /**
   * Get payroll run by ID
   */
  async getPayrollRun(payrollRunId: string, companyId: string) {
    const payrollRun = await prisma.payrollRun.findFirst({
      where: { id: payrollRunId, companyId },
      include: {
        employees: {
          include: {
            employee: true,
          },
        },
        calculatedBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        approvedBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!payrollRun) {
      throw new NotFoundError('Payroll run not found');
    }

    return payrollRun;
  }

  /**
   * Get all payroll runs for a company
   */
  async getPayrollRuns(companyId: string) {
    return prisma.payrollRun.findMany({
      where: { companyId },
      include: {
        calculatedBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        approvedBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { period: 'desc' },
    });
  }

  /**
   * Approve payroll run
   */
  async approvePayrollRun(
    payrollRunId: string,
    companyId: string,
    userId: string
  ) {
    const payrollRun = await this.getPayrollRun(payrollRunId, companyId);

    if (payrollRun.status !== PayrollStatus.CALCULATED) {
      throw new BadRequestError('Can only approve calculated payroll runs');
    }

    return prisma.payrollRun.update({
      where: { id: payrollRunId },
      data: {
        status: PayrollStatus.APPROVED,
        approvedById: userId,
        approvedAt: new Date(),
      },
      include: {
        employees: {
          include: {
            employee: true,
          },
        },
        calculatedBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        approvedBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  /**
   * Calculate payroll preview (without saving)
   */
  async calculatePayrollPreview(companyId: string, entity: LegalEntity) {
    const employees = await prisma.employee.findMany({
      where: {
        companyId,
        entity,
        isActive: true,
      },
    });

    if (employees.length === 0) {
      throw new BadRequestError(
        `No active employees found for entity ${entity}`
      );
    }

    const calculations = employees.map((employee: any) => {
      const grossSalary = parseFloat(employee.grossSalary.toString());
      const calculation = this.calculateEmployeePayroll(grossSalary, entity);

      return {
        employee: {
          id: employee.id,
          firstName: employee.firstName,
          lastName: employee.lastName,
          personalNumber: employee.personalNumber,
          position: employee.position,
        },
        ...calculation,
      };
    });

    const totalGross = calculations.reduce((sum: number, c: any) => sum + c.grossSalary, 0);
    const totalNet = calculations.reduce((sum: number, c: any) => sum + c.netSalary, 0);
    const totalTax = calculations.reduce((sum: number, c: any) => sum + c.incomeTax, 0);
    const totalCost = calculations.reduce((sum: number, c: any) => sum + c.totalCost, 0);

    return {
      entity,
      employeeCount: employees.length,
      employees: calculations,
      totals: {
        totalGross,
        totalNet,
        totalTax,
        totalCost,
      },
    };
  }
}
