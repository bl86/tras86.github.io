/**
 * Reports Page - Financial Reports
 * Balance Sheet, P&L, Cash Flow
 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import toast from 'react-hot-toast';

interface ReportsPageProps {
  companyId: string;
}

export const ReportsPage = ({ companyId }: ReportsPageProps) => {
  const [reportType, setReportType] = useState<'balance-sheet' | 'profit-and-loss' | 'cash-flow' | 'all'>('all');
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [shouldFetch, setShouldFetch] = useState(false);

  // Fetch report data
  const { data: reportData, isLoading, refetch } = useQuery({
    queryKey: ['reports', companyId, reportType, startDate, endDate],
    queryFn: async () => {
      try {
        if (reportType === 'balance-sheet') {
          return await apiClient.generateBalanceSheet(companyId, endDate);
        } else if (reportType === 'profit-and-loss') {
          return await apiClient.generateProfitAndLoss(companyId, startDate, endDate);
        } else if (reportType === 'cash-flow') {
          return await apiClient.generateCashFlow(companyId, startDate, endDate);
        } else {
          return await apiClient.generateAllReports(companyId, startDate, endDate);
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to generate report');
        throw error;
      }
    },
    enabled: shouldFetch && !!companyId,
  });

  const handleGenerateReport = () => {
    setShouldFetch(true);
    refetch();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('bs-BA', {
      style: 'currency',
      currency: 'BAM',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const renderBalanceSheet = (data: any) => (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-bold mb-2">Bilans Stanja / Balance Sheet</h3>
        <p className="text-sm text-gray-600">
          Date: {new Date(data.reportDate).toLocaleDateString()}
        </p>
        <p className={`text-sm mt-2 ${data.isBalanced ? 'text-green-600' : 'text-red-600'}`}>
          {data.isBalanced ? '✓ Balance Sheet is balanced' : '✗ Balance Sheet is NOT balanced'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Assets */}
        <div className="bg-white border rounded-lg p-4">
          <h4 className="text-md font-bold mb-3 text-green-700">ASSETS (Aktiva)</h4>
          <div className="space-y-2">
            {data.assets.length === 0 ? (
              <p className="text-gray-500 text-sm">No asset accounts with activity</p>
            ) : (
              data.assets.map((item: any) => (
                <div key={item.accountId} className="flex justify-between text-sm">
                  <span className="text-gray-700">
                    {item.accountCode} - {item.accountName}
                  </span>
                  <span className="font-medium">{formatCurrency(item.balance)}</span>
                </div>
              ))
            )}
            <div className="border-t pt-2 mt-2 flex justify-between font-bold">
              <span>Total Assets:</span>
              <span className="text-green-700">{formatCurrency(data.totalAssets)}</span>
            </div>
          </div>
        </div>

        {/* Liabilities & Equity */}
        <div className="space-y-4">
          {/* Liabilities */}
          <div className="bg-white border rounded-lg p-4">
            <h4 className="text-md font-bold mb-3 text-red-700">LIABILITIES (Obaveze)</h4>
            <div className="space-y-2">
              {data.liabilities.length === 0 ? (
                <p className="text-gray-500 text-sm">No liability accounts with activity</p>
              ) : (
                data.liabilities.map((item: any) => (
                  <div key={item.accountId} className="flex justify-between text-sm">
                    <span className="text-gray-700">
                      {item.accountCode} - {item.accountName}
                    </span>
                    <span className="font-medium">{formatCurrency(item.balance)}</span>
                  </div>
                ))
              )}
              <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                <span>Total Liabilities:</span>
                <span className="text-red-700">{formatCurrency(data.totalLiabilities)}</span>
              </div>
            </div>
          </div>

          {/* Equity */}
          <div className="bg-white border rounded-lg p-4">
            <h4 className="text-md font-bold mb-3 text-blue-700">EQUITY (Kapital)</h4>
            <div className="space-y-2">
              {data.equity.length === 0 ? (
                <p className="text-gray-500 text-sm">No equity accounts with activity</p>
              ) : (
                data.equity.map((item: any) => (
                  <div key={item.accountId} className="flex justify-between text-sm">
                    <span className="text-gray-700">
                      {item.accountCode} - {item.accountName}
                    </span>
                    <span className="font-medium">{formatCurrency(item.balance)}</span>
                  </div>
                ))
              )}
              <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                <span>Total Equity:</span>
                <span className="text-blue-700">{formatCurrency(data.totalEquity)}</span>
              </div>
            </div>
          </div>

          {/* Total L + E */}
          <div className="bg-gray-100 border-2 border-gray-300 rounded-lg p-4">
            <div className="flex justify-between font-bold text-lg">
              <span>Total Liabilities + Equity:</span>
              <span>{formatCurrency(data.totalLiabilitiesAndEquity)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfitAndLoss = (data: any) => (
    <div className="space-y-6">
      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="text-lg font-bold mb-2">Bilans Uspeha / Profit & Loss Statement</h3>
        <p className="text-sm text-gray-600">
          Period: {new Date(data.periodStart).toLocaleDateString()} - {new Date(data.periodEnd).toLocaleDateString()}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Revenue */}
        <div className="bg-white border rounded-lg p-4">
          <h4 className="text-md font-bold mb-3 text-green-700">REVENUE (Prihodi)</h4>
          <div className="space-y-2">
            {data.revenues.length === 0 ? (
              <p className="text-gray-500 text-sm">No revenue accounts with activity</p>
            ) : (
              data.revenues.map((item: any) => (
                <div key={item.accountId} className="flex justify-between text-sm">
                  <span className="text-gray-700">
                    {item.accountCode} - {item.accountName}
                  </span>
                  <span className="font-medium">{formatCurrency(item.balance)}</span>
                </div>
              ))
            )}
            <div className="border-t pt-2 mt-2 flex justify-between font-bold">
              <span>Total Revenue:</span>
              <span className="text-green-700">{formatCurrency(data.totalRevenue)}</span>
            </div>
          </div>
        </div>

        {/* Expenses */}
        <div className="bg-white border rounded-lg p-4">
          <h4 className="text-md font-bold mb-3 text-red-700">EXPENSES (Rashodi)</h4>
          <div className="space-y-2">
            {data.expenses.length === 0 ? (
              <p className="text-gray-500 text-sm">No expense accounts with activity</p>
            ) : (
              data.expenses.map((item: any) => (
                <div key={item.accountId} className="flex justify-between text-sm">
                  <span className="text-gray-700">
                    {item.accountCode} - {item.accountName}
                  </span>
                  <span className="font-medium">{formatCurrency(item.balance)}</span>
                </div>
              ))
            )}
            <div className="border-t pt-2 mt-2 flex justify-between font-bold">
              <span>Total Expenses:</span>
              <span className="text-red-700">{formatCurrency(data.totalExpenses)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Net Income */}
      <div className={`border-2 rounded-lg p-4 ${data.netIncome >= 0 ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
        <div className="flex justify-between items-center">
          <div>
            <span className="font-bold text-lg">Net Income (Neto Dobit):</span>
            <span className="text-sm text-gray-600 ml-2">
              ({data.netIncomePercentage.toFixed(2)}% of revenue)
            </span>
          </div>
          <span className={`font-bold text-xl ${data.netIncome >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {formatCurrency(data.netIncome)}
          </span>
        </div>
      </div>
    </div>
  );

  const renderCashFlow = (data: any) => (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-bold mb-2">Izveštaj o Tokovima Gotovine / Cash Flow Statement</h3>
        <p className="text-sm text-gray-600">
          Period: {new Date(data.periodStart).toLocaleDateString()} - {new Date(data.periodEnd).toLocaleDateString()}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Cash Accounts: {data.cashAccounts.map((a: any) => `${a.code} - ${a.name}`).join(', ')}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <h4 className="text-sm font-bold mb-2 text-blue-700">Operating Activities</h4>
          <p className="text-2xl font-bold">{formatCurrency(data.operatingCashFlow)}</p>
          <p className="text-xs text-gray-500 mt-1">{data.operatingActivities.length} transactions</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <h4 className="text-sm font-bold mb-2 text-purple-700">Investing Activities</h4>
          <p className="text-2xl font-bold">{formatCurrency(data.investingCashFlow)}</p>
          <p className="text-xs text-gray-500 mt-1">{data.investingActivities.length} transactions</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <h4 className="text-sm font-bold mb-2 text-orange-700">Financing Activities</h4>
          <p className="text-2xl font-bold">{formatCurrency(data.financingCashFlow)}</p>
          <p className="text-xs text-gray-500 mt-1">{data.financingActivities.length} transactions</p>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-4">
        <h4 className="text-md font-bold mb-3">Cash Flow Summary</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Opening Balance:</span>
            <span className="font-medium">{formatCurrency(data.openingBalance)}</span>
          </div>
          <div className="flex justify-between text-blue-600">
            <span>Operating Cash Flow:</span>
            <span className="font-medium">{formatCurrency(data.operatingCashFlow)}</span>
          </div>
          <div className="flex justify-between text-purple-600">
            <span>Investing Cash Flow:</span>
            <span className="font-medium">{formatCurrency(data.investingCashFlow)}</span>
          </div>
          <div className="flex justify-between text-orange-600">
            <span>Financing Cash Flow:</span>
            <span className="font-medium">{formatCurrency(data.financingCashFlow)}</span>
          </div>
          <div className="border-t pt-2 flex justify-between">
            <span>Net Cash Flow:</span>
            <span className={`font-bold ${data.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(data.netCashFlow)}
            </span>
          </div>
          <div className="border-t-2 pt-2 flex justify-between font-bold text-lg">
            <span>Closing Balance:</span>
            <span className="text-blue-700">{formatCurrency(data.closingBalance)}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
        <p className="text-gray-600 mt-1">Generate comprehensive financial reports</p>
      </div>

      {/* Report Parameters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Report Parameters</h2>
        <div className="grid grid-cols-4 gap-4">
          <Select
            label="Report Type"
            value={reportType}
            onChange={(e) => setReportType(e.target.value as any)}
          >
            <option value="all">All Reports</option>
            <option value="balance-sheet">Balance Sheet</option>
            <option value="profit-and-loss">Profit & Loss</option>
            <option value="cash-flow">Cash Flow</option>
          </Select>

          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            disabled={reportType === 'balance-sheet'}
          />

          <Input
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />

          <div className="flex items-end">
            <Button onClick={handleGenerateReport} disabled={isLoading} className="w-full">
              {isLoading ? 'Generating...' : 'Generate Report'}
            </Button>
          </div>
        </div>

        {reportType === 'balance-sheet' && (
          <p className="text-sm text-gray-600 mt-2">
            Note: Balance Sheet shows cumulative balances up to the end date
          </p>
        )}
      </div>

      {/* Report Results */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Generating report...</p>
        </div>
      )}

      {!isLoading && reportData && (
        <div className="space-y-6">
          {reportType === 'balance-sheet' && renderBalanceSheet(reportData)}
          {reportType === 'profit-and-loss' && renderProfitAndLoss(reportData)}
          {reportType === 'cash-flow' && renderCashFlow(reportData)}
          {reportType === 'all' && (
            <>
              <div className="border-b-4 border-gray-300 pb-6">
                {renderBalanceSheet(reportData.balanceSheet)}
              </div>
              <div className="border-b-4 border-gray-300 pb-6">
                {renderProfitAndLoss(reportData.profitAndLoss)}
              </div>
              <div>
                {renderCashFlow(reportData.cashFlow)}
              </div>
            </>
          )}
        </div>
      )}

      {!isLoading && !reportData && shouldFetch && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">Click "Generate Report" to view financial reports</p>
        </div>
      )}
    </div>
  );
};
