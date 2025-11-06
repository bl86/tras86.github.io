/**
 * Payroll Calculation Service
 * Automatic salary calculations for BiH entities (RS, FBIH, BD)
 * Based on 2025 tax and contribution rates
 */

import { LegalEntity } from '@prisma/client';
import Decimal from 'decimal.js';

// ==================== TAX RATES 2025 ====================

interface TaxRates {
  // Employee contributions (from gross)
  piEmployee: number; // Pension and Disability Insurance
  healthEmployee: number; // Health Insurance
  unemploymentEmployee: number; // Unemployment Insurance

  // Employer contributions (on top of gross)
  piEmployer: number;
  healthEmployer: number;
  unemploymentEmployer: number;

  // Income tax
  incomeTaxRate: number;

  // Personal deduction
  personalDeduction: number;
}

const TAX_RATES_2025: Record<LegalEntity, TaxRates> = {
  RS: {
    // Republika Srpska - No employer contributions (distinctive feature)
    piEmployee: 0.185, // 18.5%
    healthEmployee: 0.12, // 12%
    unemploymentEmployee: 0.008, // 0.8%
    piEmployer: 0, // No employer contributions in RS
    healthEmployer: 0,
    unemploymentEmployer: 0,
    incomeTaxRate: 0.08, // 8%
    personalDeduction: 1000, // 1,000 KM
  },
  FBIH: {
    // Federacija BiH
    piEmployee: 0.17, // 17%
    healthEmployee: 0.125, // 12.5%
    unemploymentEmployee: 0.015, // 1.5%
    piEmployer: 0.06, // 6%
    healthEmployer: 0.04, // 4%
    unemploymentEmployer: 0.005, // 0.5%
    incomeTaxRate: 0.1, // 10%
    personalDeduction: 300, // 300 KM
  },
  BD: {
    // Brčko Distrikt - Similar to RS
    piEmployee: 0.185,
    healthEmployee: 0.12,
    unemploymentEmployee: 0.008,
    piEmployer: 0,
    healthEmployer: 0,
    unemploymentEmployer: 0,
    incomeTaxRate: 0.08,
    personalDeduction: 800, // 800 KM
  },
};

// ==================== CALCULATION RESULTS ====================

export interface PayrollCalculationResult {
  // Input
  entity: LegalEntity;
  inputType: 'GROSS' | 'NET';
  inputAmount: Decimal;

  // Calculated amounts
  grossSalary: Decimal;
  netSalary: Decimal;

  // Employee contributions (deducted from gross)
  piEmployee: Decimal;
  healthEmployee: Decimal;
  unemploymentEmployee: Decimal;
  totalEmployeeContributions: Decimal;

  // Employer contributions (added on top of gross)
  piEmployer: Decimal;
  healthEmployer: Decimal;
  unemploymentEmployer: Decimal;
  totalEmployerContributions: Decimal;

  // Tax calculation
  taxableBase: Decimal; // Gross - Employee contributions
  personalDeduction: Decimal;
  taxableIncome: Decimal; // Taxable base - Personal deduction
  incomeTax: Decimal;

  // Total cost
  totalCost: Decimal; // Gross + Employer contributions
}

// ==================== PAYROLL CALCULATION SERVICE ====================

export class PayrollCalculationService {
  /**
   * Calculate salary from GROSS amount
   */
  calculateFromGross(
    entity: LegalEntity,
    grossAmount: number | Decimal
  ): PayrollCalculationResult {
    const rates = TAX_RATES_2025[entity];
    const gross = new Decimal(grossAmount);

    // Employee contributions (from gross)
    const piEmployee = gross.times(rates.piEmployee);
    const healthEmployee = gross.times(rates.healthEmployee);
    const unemploymentEmployee = gross.times(rates.unemploymentEmployee);
    const totalEmployeeContributions = piEmployee
      .plus(healthEmployee)
      .plus(unemploymentEmployee);

    // Employer contributions (on top of gross)
    const piEmployer = gross.times(rates.piEmployer);
    const healthEmployer = gross.times(rates.healthEmployer);
    const unemploymentEmployer = gross.times(rates.unemploymentEmployer);
    const totalEmployerContributions = piEmployer
      .plus(healthEmployer)
      .plus(unemploymentEmployer);

    // Tax calculation
    const taxableBase = gross.minus(totalEmployeeContributions);
    const personalDeduction = new Decimal(rates.personalDeduction);
    const taxableIncome = Decimal.max(0, taxableBase.minus(personalDeduction));
    const incomeTax = taxableIncome.times(rates.incomeTaxRate);

    // Net salary
    const netSalary = taxableBase.minus(incomeTax);

    // Total cost to employer
    const totalCost = gross.plus(totalEmployerContributions);

    return {
      entity,
      inputType: 'GROSS',
      inputAmount: gross,
      grossSalary: gross,
      netSalary: netSalary,
      piEmployee,
      healthEmployee,
      unemploymentEmployee,
      totalEmployeeContributions,
      piEmployer,
      healthEmployer,
      unemploymentEmployer,
      totalEmployerContributions,
      taxableBase,
      personalDeduction,
      taxableIncome,
      incomeTax,
      totalCost,
    };
  }

  /**
   * Calculate salary from NET amount (reverse calculation)
   * This is more complex as we need to solve for gross iteratively
   */
  calculateFromNet(
    entity: LegalEntity,
    netAmount: number | Decimal
  ): PayrollCalculationResult {
    const rates = TAX_RATES_2025[entity];
    const targetNet = new Decimal(netAmount);

    // Calculate total deduction rate
    const employeeContributionRate =
      rates.piEmployee + rates.healthEmployee + rates.unemploymentEmployee;

    // Formula: Net = (Gross × (1 - employeeContribRate) - personalDeduction) × (1 - taxRate)
    // Solving for Gross:
    // Net = (Gross × (1 - employeeRate) - deduction) × (1 - taxRate)
    // Net / (1 - taxRate) = Gross × (1 - employeeRate) - deduction
    // Net / (1 - taxRate) + deduction = Gross × (1 - employeeRate)
    // Gross = (Net / (1 - taxRate) + deduction) / (1 - employeeRate)

    const taxRate = rates.incomeTaxRate;
    const personalDeduction = new Decimal(rates.personalDeduction);

    const gross = targetNet
      .div(new Decimal(1).minus(taxRate))
      .plus(personalDeduction)
      .div(new Decimal(1).minus(employeeContributionRate));

    // Now calculate full breakdown from the calculated gross
    return this.calculateFromGross(entity, gross);
  }

  /**
   * Get tax rates for a specific entity
   */
  getTaxRates(entity: LegalEntity): TaxRates {
    return TAX_RATES_2025[entity];
  }

  /**
   * Calculate annual cost for an employee
   */
  calculateAnnualCost(
    entity: LegalEntity,
    monthlyGross: number | Decimal,
    months: number = 12
  ): {
    monthlyCost: Decimal;
    annualCost: Decimal;
    monthlyNet: Decimal;
    annualNet: Decimal;
  } {
    const monthlyCalc = this.calculateFromGross(entity, monthlyGross);

    return {
      monthlyCost: monthlyCalc.totalCost,
      annualCost: monthlyCalc.totalCost.times(months),
      monthlyNet: monthlyCalc.netSalary,
      annualNet: monthlyCalc.netSalary.times(months),
    };
  }

  /**
   * Format calculation result as a readable summary
   */
  formatCalculationSummary(result: PayrollCalculationResult): string {
    const lines = [
      `=== PAYROLL CALCULATION (${result.entity}) ===`,
      ``,
      `Input: ${result.inputType} ${result.inputAmount.toFixed(2)} KM`,
      ``,
      `GROSS SALARY: ${result.grossSalary.toFixed(2)} KM`,
      ``,
      `Employee Contributions:`,
      `  PIO (Pension):     ${result.piEmployee.toFixed(2)} KM`,
      `  Zdravstvo (Health): ${result.healthEmployee.toFixed(2)} KM`,
      `  Nezaposlenost:     ${result.unemploymentEmployee.toFixed(2)} KM`,
      `  Total:             ${result.totalEmployeeContributions.toFixed(2)} KM`,
      ``,
      `Tax Calculation:`,
      `  Taxable Base:      ${result.taxableBase.toFixed(2)} KM`,
      `  Personal Deduction: -${result.personalDeduction.toFixed(2)} KM`,
      `  Taxable Income:    ${result.taxableIncome.toFixed(2)} KM`,
      `  Income Tax:        ${result.incomeTax.toFixed(2)} KM`,
      ``,
      `NET SALARY: ${result.netSalary.toFixed(2)} KM`,
      ``,
      `Employer Contributions:`,
      `  PIO:               ${result.piEmployer.toFixed(2)} KM`,
      `  Zdravstvo:         ${result.healthEmployer.toFixed(2)} KM`,
      `  Nezaposlenost:     ${result.unemploymentEmployer.toFixed(2)} KM`,
      `  Total:             ${result.totalEmployerContributions.toFixed(2)} KM`,
      ``,
      `TOTAL COST: ${result.totalCost.toFixed(2)} KM`,
    ];

    return lines.join('\n');
  }
}

// Export singleton instance
export const payrollCalculationService = new PayrollCalculationService();
