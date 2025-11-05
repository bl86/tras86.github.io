/**
 * API Client - Centralized HTTP client with interceptors
 */
import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - add token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        console.log('🔍 API Request:', config.url);
        console.log('🔑 Token from localStorage:', token ? `${token.substring(0, 20)}...` : 'NULL');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('✅ Authorization header set');
        } else {
          console.error('❌ NO TOKEN FOUND in localStorage!');
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - unwrap backend response format and handle errors
    this.client.interceptors.response.use(
      (response) => {
        // Backend wraps all responses in { status: 'success', data: {...} }
        // Automatically unwrap to get just the data
        if (response.data && response.data.status === 'success' && response.data.data !== undefined) {
          response.data = response.data.data;
        }
        return response;
      },
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth
  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', { email, password });
    return response.data;
  }

  async register(data: { email: string; password: string; firstName: string; lastName: string }) {
    const response = await this.client.post('/auth/register', data);
    return response.data;
  }

  // Companies
  async getCompanies() {
    const response = await this.client.get('/companies');
    return response.data.companies || [];
  }

  async getCompany(id: string) {
    const response = await this.client.get(`/companies/${id}`);
    return response.data.company;
  }

  async createCompany(data: any) {
    const response = await this.client.post('/companies', data);
    return response.data.company;
  }

  async updateCompany(id: string, data: any) {
    const response = await this.client.put(`/companies/${id}`, data);
    return response.data.company;
  }

  async deleteCompany(id: string) {
    const response = await this.client.delete(`/companies/${id}`);
    return response.data;
  }

  // Chart of Accounts
  async getAccounts(companyId: string) {
    const response = await this.client.get(`/companies/${companyId}/accounts`);
    return response.data.accounts || [];
  }

  async getAccount(companyId: string, accountId: string) {
    const response = await this.client.get(`/companies/${companyId}/accounts/${accountId}`);
    return response.data.account;
  }

  async createAccount(companyId: string, data: any) {
    const response = await this.client.post(`/companies/${companyId}/accounts`, data);
    return response.data.account;
  }

  async updateAccount(companyId: string, accountId: string, data: any) {
    const response = await this.client.put(`/companies/${companyId}/accounts/${accountId}`, data);
    return response.data.account;
  }

  async deleteAccount(companyId: string, accountId: string) {
    const response = await this.client.delete(`/companies/${companyId}/accounts/${accountId}`);
    return response.data;
  }

  // Partners
  async getPartners(companyId: string, params?: any) {
    const response = await this.client.get(`/companies/${companyId}/partners`, { params });
    return response.data.partners || [];
  }

  async getPartner(companyId: string, partnerId: string) {
    const response = await this.client.get(`/companies/${companyId}/partners/${partnerId}`);
    return response.data.partner;
  }

  async createPartner(companyId: string, data: any) {
    const response = await this.client.post(`/companies/${companyId}/partners`, data);
    return response.data.partner;
  }

  async updatePartner(companyId: string, partnerId: string, data: any) {
    const response = await this.client.put(`/companies/${companyId}/partners/${partnerId}`, data);
    return response.data.partner;
  }

  async deletePartner(companyId: string, partnerId: string) {
    const response = await this.client.delete(`/companies/${companyId}/partners/${partnerId}`);
    return response.data;
  }

  // Cost Centers
  async getCostCenters(companyId: string) {
    const response = await this.client.get(`/companies/${companyId}/cost-centers`);
    return response.data.costCenters || [];
  }

  async createCostCenter(companyId: string, data: any) {
    const response = await this.client.post(`/companies/${companyId}/cost-centers`, data);
    return response.data.costCenter;
  }

  async updateCostCenter(companyId: string, costCenterId: string, data: any) {
    const response = await this.client.put(`/companies/${companyId}/cost-centers/${costCenterId}`, data);
    return response.data.costCenter;
  }

  async deleteCostCenter(companyId: string, costCenterId: string) {
    const response = await this.client.delete(`/companies/${companyId}/cost-centers/${costCenterId}`);
    return response.data;
  }

  // Employees
  async getEmployees(companyId: string) {
    const response = await this.client.get(`/companies/${companyId}/employees`);
    return response.data.employees || [];
  }

  async createEmployee(companyId: string, data: any) {
    const response = await this.client.post(`/companies/${companyId}/employees`, data);
    return response.data.employee;
  }

  async updateEmployee(companyId: string, employeeId: string, data: any) {
    const response = await this.client.put(`/companies/${companyId}/employees/${employeeId}`, data);
    return response.data.employee;
  }

  async deleteEmployee(companyId: string, employeeId: string) {
    const response = await this.client.delete(`/companies/${companyId}/employees/${employeeId}`);
    return response.data;
  }

  // Journal Entries
  async getJournalEntries(companyId: string, params?: any) {
    const response = await this.client.get(`/companies/${companyId}/journal-entries`, { params });
    return response.data;
  }

  async getJournalEntry(companyId: string, entryId: string) {
    const response = await this.client.get(`/companies/${companyId}/journal-entries/${entryId}`);
    return response.data;
  }

  async createJournalEntry(companyId: string, data: any) {
    const response = await this.client.post(`/companies/${companyId}/journal-entries`, data);
    return response.data;
  }

  async updateJournalEntry(companyId: string, entryId: string, data: any) {
    const response = await this.client.put(`/companies/${companyId}/journal-entries/${entryId}`, data);
    return response.data;
  }

  async postJournalEntry(companyId: string, entryId: string) {
    const response = await this.client.post(`/companies/${companyId}/journal-entries/${entryId}/post`);
    return response.data;
  }

  async reverseJournalEntry(companyId: string, entryId: string) {
    const response = await this.client.post(`/companies/${companyId}/journal-entries/${entryId}/reverse`);
    return response.data;
  }

  async deleteJournalEntry(companyId: string, entryId: string) {
    const response = await this.client.delete(`/companies/${companyId}/journal-entries/${entryId}`);
    return response.data;
  }

  // Payroll
  async getPayrollRuns(companyId: string) {
    const response = await this.client.get(`/companies/${companyId}/payroll`);
    return response.data;
  }

  async createPayrollRun(companyId: string, data: any) {
    const response = await this.client.post(`/companies/${companyId}/payroll`, data);
    return response.data;
  }

  async approvePayrollRun(companyId: string, payrollId: string) {
    const response = await this.client.post(`/companies/${companyId}/payroll/${payrollId}/approve`);
    return response.data;
  }

  async deletePayrollRun(companyId: string, payrollId: string) {
    const response = await this.client.delete(`/companies/${companyId}/payroll/${payrollId}`);
    return response.data;
  }

  // Reports
  async generateBalanceSheet(companyId: string, endDate: string) {
    const response = await this.client.get(`/companies/${companyId}/reports/balance-sheet`, {
      params: { endDate },
    });
    return response.data;
  }

  async generateProfitAndLoss(companyId: string, startDate: string, endDate: string) {
    const response = await this.client.get(`/companies/${companyId}/reports/profit-and-loss`, {
      params: { startDate, endDate },
    });
    return response.data;
  }

  async generateCashFlow(companyId: string, startDate: string, endDate: string) {
    const response = await this.client.get(`/companies/${companyId}/reports/cash-flow`, {
      params: { startDate, endDate },
    });
    return response.data;
  }

  async generateAllReports(companyId: string, startDate: string, endDate: string) {
    const response = await this.client.get(`/companies/${companyId}/reports/all`, {
      params: { startDate, endDate },
    });
    return response.data;
  }
}

export const apiClient = new ApiClient();
