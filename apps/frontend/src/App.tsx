import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/shared/stores/auth.store';
import { apiClient } from '@/lib/api-client';
import { MainLayout } from '@/components/layout/MainLayout';
import { CompaniesPage } from '@/pages/companies/CompaniesPage';
import { AccountsPage } from '@/pages/accounts/AccountsPage';
import { PartnersPage } from '@/pages/partners/PartnersPage';
import { EmployeesPage } from '@/pages/employees/EmployeesPage';
import { CostCentersPage } from '@/pages/cost-centers/CostCentersPage';
import { JournalEntriesPage } from '@/pages/journal-entries/JournalEntriesPage';
import { PayrollPage } from '@/pages/payroll/PayrollPage';
import { ReportsPage } from '@/pages/reports/ReportsPage';
import { TestPage } from '@/pages/TestPage';

// Login Page
const LoginPage = () => {
  const [email, setEmail] = useState('admin@accounting-bih.com');
  const [password, setPassword] = useState('Admin123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const login = useAuthStore((state) => state.login);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      login(data.accessToken, data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center">Accounting System BiH</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md disabled:bg-gray-400"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="mt-4 text-sm text-gray-600">
          <p>Default credentials:</p>
          <p>Email: admin@accounting-bih.com</p>
          <p>Password: Admin123!</p>
        </div>
      </div>
    </div>
  );
};

// Dashboard with Company Selector
const DashboardPage = () => {
  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: () => apiClient.getCompanies(),
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Companies</h3>
          <p className="text-3xl font-bold text-blue-600">{companies.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Backend Status</h3>
          <p className="text-sm text-green-600">✓ Connected</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Active Users</h3>
          <p className="text-3xl font-bold text-purple-600">1</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Available Modules</h2>
        <ul className="space-y-2">
          <li>✅ Authentication & Authorization (JWT + RBAC)</li>
          <li>✅ Multi-company Management</li>
          <li>✅ Chart of Accounts (Kontni Plan)</li>
          <li>✅ General Ledger (Glavna Knjiga)</li>
          <li>✅ Partners Management (Kupci/Dobavljači)</li>
          <li>✅ Payroll for RS & FBiH</li>
          <li>✅ Cost Centers</li>
          <li>✅ Employees</li>
          <li>✅ Financial Reports (Balance Sheet, P&L, Cash Flow)</li>
          <li>🔜 KIF/KUF (Invoices)</li>
        </ul>
      </div>
    </div>
  );
};

// Company Wrapper Component
const CompanyWrapper = ({ children }: { children: (companyId: string) => React.ReactNode }) => {
  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: () => apiClient.getCompanies(),
  });

  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');

  if (isLoading) {
    return <div className="p-6">Loading companies...</div>;
  }

  if (companies.length === 0) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">No companies found. Please create a company first.</p>
        </div>
      </div>
    );
  }

  // Auto-select first company if none selected
  const companyId = selectedCompanyId || companies[0]?.id;

  return (
    <div>
      <div className="bg-white border-b p-4">
        <label className="block text-sm font-medium mb-2">Select Company:</label>
        <select
          value={companyId}
          onChange={(e) => setSelectedCompanyId(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {companies.map((company: any) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>
      </div>
      {companyId && children(companyId)}
    </div>
  );
};


function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <MainLayout>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/companies" element={<CompaniesPage />} />
        <Route path="/accounts" element={<CompanyWrapper>{(companyId) => <AccountsPage companyId={companyId} />}</CompanyWrapper>} />
        <Route path="/partners" element={<CompanyWrapper>{(companyId) => <PartnersPage companyId={companyId} />}</CompanyWrapper>} />
        <Route path="/employees" element={<CompanyWrapper>{(companyId) => <EmployeesPage companyId={companyId} />}</CompanyWrapper>} />
        <Route path="/cost-centers" element={<CompanyWrapper>{(companyId) => <CostCentersPage companyId={companyId} />}</CompanyWrapper>} />
        <Route path="/journal-entries" element={<CompanyWrapper>{(companyId) => <JournalEntriesPage companyId={companyId} />}</CompanyWrapper>} />
        <Route path="/payroll" element={<CompanyWrapper>{(companyId) => <PayrollPage companyId={companyId} />}</CompanyWrapper>} />
        <Route path="/reports" element={<CompanyWrapper>{(companyId) => <ReportsPage companyId={companyId} />}</CompanyWrapper>} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </MainLayout>
  );
}

export default App;
