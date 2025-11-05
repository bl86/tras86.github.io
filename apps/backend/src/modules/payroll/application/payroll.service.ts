/**
 * Payroll Service
 * Calculates payroll for RS and FBiH
 */

import { prisma } from '@/shared/infrastructure/database/prisma';
import { NotFoundError, BadRequestError } from '@/shared/domain/errors/app-error';
import { LegalEntity, PayrollStatus } from '@prisma/client';
import { Decimal } from 'decimal.js';

// Tax rates for Republika Srpska (2025)
const RS_TAX_RATES = {
  INCOME_TAX: 0.10,           // 10% porez na dohodak
  PIO_EMPLOYEE: 0.185,        // 18.5% PIO zaposleni
  PIO_EMPLOYER: 0.105,        // 10.5% PIO poslodavac
  HEALTH_EMPLOYEE: 0.125,     // 12.5% zdravstveno zaposleni
  HEALTH_EMPLOYER: 0.105,     // 10.5% zdravstveno poslodavac
  UNEMPLOYMENT: 0.01,         // 1% nezaposlenost (samo poslodavac)
};

// Tax rates for Federacija BiH (2025)
const FBIH_TAX_RATES = {
  INCOME_TAX: 0.10,                  // 10% porez na dohodak
  PIO_EMPLOYEE: 0.17,                // 17% PIO zaposleni
  PIO_EMPLOYER: 0.06,                // 6% PIO poslodavac
  HEALTH_EMPLOYEE: 0.125,            // 12.5% zdravstveno zaposleni
  HEALTH_EMPLOYER: 0.105,            // 10.5% zdravstveno poslodavac
  UNEMPLOYMENT_EMPLOYEE: 0.015,      // 1.5% nezaposlenost zaposleni
  UNEMPLOYMENT_EMPLOYER: 0.005,      // 0.5% nezaposlenost poslodavac
};

export class PayrollService {
  /**
   * Calculate payroll for RS employee
   */
  private calculateRSPayroll(grossSalary: number) {
    const gross = new Decimal(grossSalary);

    // Employee contributions
    const pioEmployee = gross.times(RS_TAX_RATES.PIO_EMPLOYEE);
    const healthEmployee = gross.times(RS_TAX_RATES.HEALTH_EMPLOYEE);
    const unemploymentEmployee = new Decimal(0);

    const totalEmployeeContributions = pioEmployee.plus(healthEmployee);

    // Taxable base
    const taxableBase = gross.minus(totalEmployeeContributions);

    // Income tax
    const incomeTax = taxableBase.times(RS_TAX_RATES.INCOME_TAX);

    // Net salary
    const netSalary = taxableBase.minus(incomeTax);

    // Employer contributions
    const pioEmployer = gross.times(RS_TAX_RATES.PIO_EMPLOYER);
    const healthEmployer = gross.times(RS_TAX_RATES.HEALTH_EMPLOYER);
    const unemploymentEmployer = gross.times(RS_TAX_RATES.UNEMPLOYMENT);

    return {
      grossSalary: gross.toNumber(),
      netSalary: netSalary.toNumber(),
      taxableBase: taxableBase.toNumber(),
      incomeTax: incomeTax.toNumber(),
      pioEmployee: pioEmployee.toNumber(),
      healthEmployee: healthEmployee.toNumber(),
      unemploymentEmployee: unemploymentEmployee.toNumber(),
      pioEmployer: pioEmployer.toNumber(),
      healthEmployer: healthEmployer.toNumber(),
      unemploymentEmployer: unemploymentEmployer.toNumber(),
    };
  }

  /**
   * Calculate payroll for FBiH employee
   */
  private calculateFBIHPayroll(grossSalary: number) {
    const gross = new Decimal(grossSalary);

    // Employee contributions
    const pioEmployee = gross.times(FBIH_TAX_RATES.PIO_EMPLOYEE);
    const healthEmployee = gross.times(FBIH_TAX_RATES.HEALTH_EMPLOYEE);
    const unemploymentEmployee = gross.times(FBIH_TAX_RATES.UNEMPLOYMENT_EMPLOYEE);

    const totalEmployeeContributions = pioEmployee.plus(healthEmployee).plus(unemploymentEmployee);

    // Taxable base
    const taxableBase = gross.minus(totalEmployeeContributions);

    // Income tax
    const incomeTax = taxableBase.times(FBIH_TAX_RATES.INCOME_TAX);

    // Net salary
    const netSalary = taxableBase.minus(incomeTax);

    // Employer contributions
    const pioEmployer = gross.times(FBIH_TAX_RATES.PIO_EMPLOYER);
    const healthEmployer = gross.times(FBIH_TAX_RATES.HEALTH_EMPLOYER);
    const unemploymentEmployer = gross.times(FBIH_TAX_RATES.UNEMPLOYMENT_EMPLOYER);

    return {
      grossSalary: gross.toNumber(),
      netSalary: netSalary.toNumber(),
      taxableBase: taxableBase.toNumber(),
      incomeTax: incomeTax.toNumber(),
      pioEmployee: pioEmployee.toNumber(),
      healthEmployee: healthEmployee.toNumber(),
      unemploymentEmployee: unemploymentEmployee.toNumber(),
      pioEmployer: pioEmployer.toNumber(),
      healthEmployer: healthEmployer.toNumber(),
      unemploymentEmployer: unemploymentEmployer.toNumber(),
    };
  }

  /**
   * Create payroll run
   */
  async createPayrollRun(
    companyId: string,
    period: string,
    entity: LegalEntity,
    userId: string
  ) {
    // Check if payroll for this period already exists
    const existing = await prisma.payrollRun.findFirst({
      where: { companyId, period },
    });

    if (existing) {
      throw new BadRequestError(`Payroll for period ${period} already exists`);
    }

    // Get all active employees
    const employees = await prisma.employee.findMany({
      where: { companyId, isActive: true },
    });

    if (employees.length === 0) {
      throw new BadRequestError('No active employees found');
    }

    // Calculate payroll for each employee
    const employeePayrolls = employees.map((employee) => {
      const calculation =
        entity === LegalEntity.RS
          ? this.calculateRSPayroll(parseFloat(employee.baseSalary.toString()))
          : this.calculateFBIHPayroll(parseFloat(employee.baseSalary.toString()));

      return {
        employeeId: employee.id,
        ...calculation,
        deductions: null,
        additions: null,
      };
    });

    // Calculate totals
    const totalGross = employeePayrolls.reduce((sum: number, p) => sum + p.grossSalary, 0);
    const totalNet = employeePayrolls.reduce((sum: number, p) => sum + p.netSalary, 0);
    const totalTax = employeePayrolls.reduce((sum: number, p) => sum + p.incomeTax, 0);
    const totalSocialContributions = employeePayrolls.reduce(
      (sum: number, p) =>
        sum +
        p.pioEmployee +
        p.healthEmployee +
        p.unemploymentEmployee +
        p.pioEmployer +
        p.healthEmployer +
        p.unemploymentEmployer,
      0
    );

    // Create payroll run
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
      },
    });

    return payrollRun;
  }

  /**
   * Get payroll run
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
   * Approve payroll run
   */
  async approvePayrollRun(payrollRunId: string, companyId: string, userId: string) {
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
    });
  }

  /**
   * Get payroll runs for company
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
      },
      orderBy: { period: 'desc' },
    });
  }
}
