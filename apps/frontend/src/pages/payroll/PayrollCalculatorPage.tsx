/**
 * Payroll Calculator Test Page
 * Comprehensive testing interface for BiH payroll calculations
 */

import { useState } from 'react';
import axios from 'axios';

interface PayrollCalculation {
  entity: string;
  inputType: string;
  inputAmount: number;
  grossSalary: number;
  netSalary: number;
  piEmployee: number;
  healthEmployee: number;
  unemploymentEmployee: number;
  totalEmployeeContributions: number;
  piEmployer: number;
  healthEmployer: number;
  unemploymentEmployer: number;
  totalEmployerContributions: number;
  taxableBase: number;
  personalDeduction: number;
  taxableIncome: number;
  incomeTax: number;
  totalCost: number;
}

interface TaxRates {
  piEmployee: number;
  healthEmployee: number;
  unemploymentEmployee: number;
  piEmployer: number;
  healthEmployer: number;
  unemploymentEmployer: number;
  incomeTaxRate: number;
  personalDeduction: number;
}

const PayrollCalculatorPage = () => {
  const [entity, setEntity] = useState<'RS' | 'FBIH' | 'BD'>('RS');
  const [inputType, setInputType] = useState<'gross' | 'net'>('gross');
  const [amount, setAmount] = useState<string>('2500');
  const [calculation, setCalculation] = useState<PayrollCalculation | null>(null);
  const [taxRates, setTaxRates] = useState<TaxRates | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = 'http://localhost:3000/api/v1';

  // Test scenarios
  const testScenarios = [
    { entity: 'RS', salary: 1500, label: 'RS - Prodavac (1500 KM)' },
    { entity: 'RS', salary: 2200, label: 'RS - Računovođa (2200 KM)' },
    { entity: 'RS', salary: 3500, label: 'RS - Direktor (3500 KM)' },
    { entity: 'FBIH', salary: 1800, label: 'FBIH - Junior Dev (1800 KM)' },
    { entity: 'FBIH', salary: 2800, label: 'FBIH - Senior Dev (2800 KM)' },
    { entity: 'FBIH', salary: 4000, label: 'FBIH - IT Menadžer (4000 KM)' },
    { entity: 'BD', salary: 1900, label: 'BD - Tehnički asistent (1900 KM)' },
    { entity: 'BD', salary: 3200, label: 'BD - Tehnički direktor (3200 KM)' },
  ];

  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  const calculate = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      const amountValue = parseFloat(amount);

      if (isNaN(amountValue) || amountValue <= 0) {
        setError('Unesite validnu platu');
        setLoading(false);
        return;
      }

      const endpoint = inputType === 'gross'
        ? `${API_URL}/payroll/calculate/from-gross`
        : `${API_URL}/payroll/calculate/from-net`;

      const response = await axios.post(
        endpoint,
        {
          entity,
          [inputType === 'gross' ? 'grossAmount' : 'netAmount']: amountValue,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCalculation(response.data.data.calculation);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Greška pri kalkulaciji');
      console.error('Calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTaxRates = async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get(
        `${API_URL}/payroll/tax-rates/${entity}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTaxRates(response.data.data.rates);
    } catch (err) {
      console.error('Error loading tax rates:', err);
    }
  };

  const loadTestScenario = (scenario: any) => {
    setEntity(scenario.entity as any);
    setAmount(scenario.salary.toString());
    setInputType('gross');
    setTimeout(() => calculate(), 100);
  };

  const formatCurrency = (value: number) => {
    return `${value.toFixed(2)} KM`;
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  return (
    <div className="payroll-calculator-page">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">BiH Payroll Calculator 2025</h1>
        <p className="text-gray-600 mb-8">
          Test automatic payroll calculations with real BiH tax rates
        </p>

        {/* Test Scenarios */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Quick Test Scenarios</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {testScenarios.map((scenario, idx) => (
              <button
                key={idx}
                onClick={() => loadTestScenario(scenario)}
                className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded text-sm transition"
              >
                {scenario.label}
              </button>
            ))}
          </div>
        </div>

        {/* Calculator Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Calculate Salary</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Entity Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Entity / Entitet</label>
              <select
                value={entity}
                onChange={(e) => {
                  setEntity(e.target.value as any);
                  setCalculation(null);
                }}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="RS">Republika Srpska (RS)</option>
                <option value="FBIH">Federacija BiH (FBIH)</option>
                <option value="BD">Brčko Distrikt (BD)</option>
              </select>
            </div>

            {/* Input Type */}
            <div>
              <label className="block text-sm font-medium mb-2">Input Type / Tip unosa</label>
              <select
                value={inputType}
                onChange={(e) => {
                  setInputType(e.target.value as any);
                  setCalculation(null);
                }}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="gross">Bruto plata (Gross)</option>
                <option value="net">Neto plata (Net)</option>
              </select>
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Amount / Iznos (KM)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setCalculation(null);
                }}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="2500"
                step="0.01"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={calculate}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md transition"
            >
              {loading ? 'Calculating...' : 'Calculate / Obračunaj'}
            </button>
            <button
              onClick={loadTaxRates}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition"
            >
              Show Tax Rates / Prikaži stope
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
        </div>

        {/* Tax Rates Display */}
        {taxRates && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Tax Rates for {entity} (2025)</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">PIO Employee</p>
                <p className="text-lg font-semibold">{formatPercentage(taxRates.piEmployee)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Health Employee</p>
                <p className="text-lg font-semibold">{formatPercentage(taxRates.healthEmployee)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Unemployment Employee</p>
                <p className="text-lg font-semibold">{formatPercentage(taxRates.unemploymentEmployee)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Income Tax</p>
                <p className="text-lg font-semibold">{formatPercentage(taxRates.incomeTaxRate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">PIO Employer</p>
                <p className="text-lg font-semibold">{formatPercentage(taxRates.piEmployer)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Health Employer</p>
                <p className="text-lg font-semibold">{formatPercentage(taxRates.healthEmployer)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Unemployment Employer</p>
                <p className="text-lg font-semibold">{formatPercentage(taxRates.unemploymentEmployer)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Personal Deduction</p>
                <p className="text-lg font-semibold">{formatCurrency(taxRates.personalDeduction)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Calculation Results */}
        {calculation && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6">
              Calculation Results / Rezultati obračuna ({calculation.entity})
            </h2>

            {/* Main Amounts */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8 p-6 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 mb-1">GROSS SALARY / BRUTO PLATA</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(calculation.grossSalary)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">NET SALARY / NETO PLATA</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(calculation.netSalary)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">TOTAL COST / UKUPNI TROŠAK</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(calculation.totalCost)}</p>
              </div>
            </div>

            {/* Employee Contributions */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">
                Employee Contributions / Doprinosi zaposlenog
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="border-l-4 border-red-500 pl-4">
                  <p className="text-sm text-gray-600">PIO (Pension)</p>
                  <p className="text-lg font-semibold">{formatCurrency(calculation.piEmployee)}</p>
                </div>
                <div className="border-l-4 border-red-500 pl-4">
                  <p className="text-sm text-gray-600">Zdravstvo (Health)</p>
                  <p className="text-lg font-semibold">{formatCurrency(calculation.healthEmployee)}</p>
                </div>
                <div className="border-l-4 border-red-500 pl-4">
                  <p className="text-sm text-gray-600">Nezaposlenost (Unemployment)</p>
                  <p className="text-lg font-semibold">{formatCurrency(calculation.unemploymentEmployee)}</p>
                </div>
                <div className="border-l-4 border-red-600 pl-4">
                  <p className="text-sm text-gray-600">TOTAL Employee</p>
                  <p className="text-lg font-bold">{formatCurrency(calculation.totalEmployeeContributions)}</p>
                </div>
              </div>
            </div>

            {/* Tax Calculation */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">
                Tax Calculation / Obračun poreza
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="border-l-4 border-yellow-500 pl-4">
                  <p className="text-sm text-gray-600">Taxable Base</p>
                  <p className="text-lg font-semibold">{formatCurrency(calculation.taxableBase)}</p>
                </div>
                <div className="border-l-4 border-yellow-500 pl-4">
                  <p className="text-sm text-gray-600">Personal Deduction</p>
                  <p className="text-lg font-semibold">-{formatCurrency(calculation.personalDeduction)}</p>
                </div>
                <div className="border-l-4 border-yellow-500 pl-4">
                  <p className="text-sm text-gray-600">Taxable Income</p>
                  <p className="text-lg font-semibold">{formatCurrency(calculation.taxableIncome)}</p>
                </div>
                <div className="border-l-4 border-yellow-600 pl-4">
                  <p className="text-sm text-gray-600">Income Tax</p>
                  <p className="text-lg font-bold">{formatCurrency(calculation.incomeTax)}</p>
                </div>
              </div>
            </div>

            {/* Employer Contributions */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-700">
                Employer Contributions / Doprinosi poslodavca
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <p className="text-sm text-gray-600">PIO Employer</p>
                  <p className="text-lg font-semibold">{formatCurrency(calculation.piEmployer)}</p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4">
                  <p className="text-sm text-gray-600">Zdravstvo Employer</p>
                  <p className="text-lg font-semibold">{formatCurrency(calculation.healthEmployer)}</p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4">
                  <p className="text-sm text-gray-600">Nezaposlenost Employer</p>
                  <p className="text-lg font-semibold">{formatCurrency(calculation.unemploymentEmployer)}</p>
                </div>
                <div className="border-l-4 border-blue-600 pl-4">
                  <p className="text-sm text-gray-600">TOTAL Employer</p>
                  <p className="text-lg font-bold">{formatCurrency(calculation.totalEmployerContributions)}</p>
                </div>
              </div>
              {calculation.totalEmployerContributions === 0 && calculation.entity === 'RS' && (
                <p className="mt-4 text-sm text-gray-600 italic">
                  * Republika Srpska has NO employer contributions (distinctive feature of RS tax system)
                </p>
              )}
            </div>

            {/* Summary Box */}
            <div className="mt-8 p-6 bg-gray-50 rounded-lg border-2 border-gray-200">
              <h3 className="text-lg font-semibold mb-3">Summary / Rezime</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Gross Salary (Bruto):</span>
                  <span className="font-semibold">{formatCurrency(calculation.grossSalary)}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>- Employee Contributions:</span>
                  <span className="font-semibold">-{formatCurrency(calculation.totalEmployeeContributions)}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>- Income Tax:</span>
                  <span className="font-semibold">-{formatCurrency(calculation.incomeTax)}</span>
                </div>
                <div className="flex justify-between border-t-2 pt-2 text-lg">
                  <span className="font-semibold">Net Salary (Neto):</span>
                  <span className="font-bold text-green-600">{formatCurrency(calculation.netSalary)}</span>
                </div>
                {calculation.totalEmployerContributions > 0 && (
                  <>
                    <div className="flex justify-between text-blue-600 mt-4">
                      <span>+ Employer Contributions:</span>
                      <span className="font-semibold">+{formatCurrency(calculation.totalEmployerContributions)}</span>
                    </div>
                    <div className="flex justify-between border-t-2 pt-2 text-lg">
                      <span className="font-semibold">Total Cost to Employer:</span>
                      <span className="font-bold text-purple-600">{formatCurrency(calculation.totalCost)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PayrollCalculatorPage;
