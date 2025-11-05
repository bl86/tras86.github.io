/**
 * Comprehensive Test Page
 * Tests all API endpoints and components
 */

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
  data?: any;
}

export const TestPage = () => {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [running, setRunning] = useState(false);

  const updateTest = (name: string, status: TestResult['status'], message?: string, data?: any) => {
    setTests(prev => {
      const existing = prev.findIndex(t => t.name === name);
      const newTest = { name, status, message, data };
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = newTest;
        return updated;
      }
      return [...prev, newTest];
    });
  };

  const runTests = async () => {
    setRunning(true);
    setTests([]);

    // Test 1: Get Companies
    try {
      updateTest('GET /companies', 'pending');
      const companies = await apiClient.getCompanies();
      updateTest('GET /companies', 'success', `Found ${companies.length} companies`, companies);

      if (companies.length > 0) {
        const companyId = companies[0].id;

        // Test 2: Get specific company
        try {
          updateTest('GET /companies/:id', 'pending');
          const company = await apiClient.getCompany(companyId);
          updateTest('GET /companies/:id', 'success', `Got company: ${company.name}`, company);
        } catch (error: any) {
          updateTest('GET /companies/:id', 'error', error.message);
        }

        // Test 3: Get Accounts
        try {
          updateTest('GET /accounts', 'pending');
          const accounts = await apiClient.getAccounts(companyId);
          updateTest('GET /accounts', 'success', `Found ${accounts.length} accounts`, accounts);
        } catch (error: any) {
          updateTest('GET /accounts', 'error', error.message);
        }

        // Test 4: Get Partners
        try {
          updateTest('GET /partners', 'pending');
          const partners = await apiClient.getPartners(companyId);
          updateTest('GET /partners', 'success', `Found ${partners.length} partners`, partners);
        } catch (error: any) {
          updateTest('GET /partners', 'error', error.message);
        }

        // Test 5: Create Partner
        try {
          updateTest('POST /partners', 'pending');
          const newPartner = await apiClient.createPartner(companyId, {
            name: 'Test Partner ' + Date.now(),
            taxId: '4400000' + Math.random().toString().slice(2, 9),
            type: 'CUSTOMER',
            email: 'test@example.com',
            phone: '+387 51 111 222',
          });
          updateTest('POST /partners', 'success', `Created partner: ${newPartner.name}`, newPartner);

          // Test 6: Update Partner
          try {
            updateTest('PUT /partners/:id', 'pending');
            const updated = await apiClient.updatePartner(companyId, newPartner.id, {
              name: newPartner.name + ' (Updated)',
            });
            updateTest('PUT /partners/:id', 'success', `Updated partner: ${updated.name}`, updated);

            // Test 7: Delete Partner
            try {
              updateTest('DELETE /partners/:id', 'pending');
              await apiClient.deletePartner(companyId, newPartner.id);
              updateTest('DELETE /partners/:id', 'success', `Deleted partner`);
            } catch (error: any) {
              updateTest('DELETE /partners/:id', 'error', error.message);
            }
          } catch (error: any) {
            updateTest('PUT /partners/:id', 'error', error.message);
          }
        } catch (error: any) {
          updateTest('POST /partners', 'error', error.message);
        }

        // Test 8: Create Account
        try {
          updateTest('POST /accounts', 'pending');
          const newAccount = await apiClient.createAccount(companyId, {
            code: '999' + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
            name: 'Test Account ' + Date.now(),
            nameEn: 'Test Account EN',
            type: 'ASSET',
          });
          updateTest('POST /accounts', 'success', `Created account: ${newAccount.name}`, newAccount);

          // Test 9: Delete Account
          try {
            updateTest('DELETE /accounts/:id', 'pending');
            await apiClient.deleteAccount(companyId, newAccount.id);
            updateTest('DELETE /accounts/:id', 'success', `Deleted account`);
          } catch (error: any) {
            updateTest('DELETE /accounts/:id', 'error', error.message);
          }
        } catch (error: any) {
          updateTest('POST /accounts', 'error', error.message);
        }

        // Test 10: Create Company
        try {
          updateTest('POST /companies', 'pending');
          const newCompany = await apiClient.createCompany({
            name: 'Test Company ' + Date.now(),
            taxId: '4400' + Math.random().toString().slice(2, 12),
            registrationNumber: Math.random().toString().slice(2, 12),
            legalEntity: 'RS',
          });
          updateTest('POST /companies', 'success', `Created company: ${newCompany.name}`, newCompany);

          // Test 11: Delete Company
          try {
            updateTest('DELETE /companies/:id', 'pending');
            await apiClient.deleteCompany(newCompany.id);
            updateTest('DELETE /companies/:id', 'success', `Deleted company`);
          } catch (error: any) {
            updateTest('DELETE /companies/:id', 'error', error.message);
          }
        } catch (error: any) {
          updateTest('POST /companies', 'error', error.message);
        }
      }
    } catch (error: any) {
      updateTest('GET /companies', 'error', error.message);
    }

    setRunning(false);
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return '✓';
      case 'error': return '✗';
      case 'pending': return '⏳';
      default: return '?';
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">API Integration Tests</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <button
            onClick={runTests}
            disabled={running}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md disabled:bg-gray-400"
          >
            {running ? 'Running Tests...' : 'Run All Tests'}
          </button>

          <div className="mt-4">
            <p className="text-sm text-gray-600">
              This will test all API endpoints with CRUD operations
            </p>
          </div>
        </div>

        {tests.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b">
              <h2 className="text-xl font-semibold">Test Results</h2>
              <p className="text-sm text-gray-600 mt-1">
                {tests.filter(t => t.status === 'success').length} passed,{' '}
                {tests.filter(t => t.status === 'error').length} failed,{' '}
                {tests.filter(t => t.status === 'pending').length} pending
              </p>
            </div>

            <div className="divide-y">
              {tests.map((test, idx) => (
                <div key={idx} className="p-4">
                  <div className="flex items-start gap-3">
                    <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(test.status)}`}>
                      {getStatusIcon(test.status)}
                    </span>
                    <div className="flex-1">
                      <h3 className="font-medium">{test.name}</h3>
                      {test.message && (
                        <p className="text-sm text-gray-600 mt-1">{test.message}</p>
                      )}
                      {test.data && (
                        <details className="mt-2">
                          <summary className="text-sm text-blue-600 cursor-pointer">View Data</summary>
                          <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-auto">
                            {JSON.stringify(test.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
