/**
 * Payroll Page - Create and manage payroll runs
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Table } from '@/components/ui/Table';
import toast from 'react-hot-toast';

interface PayrollRun {
  id: string;
  periodStart: string;
  periodEnd: string;
  status: 'DRAFT' | 'APPROVED';
  totalGross: number;
  totalNet: number;
  totalEmployerTax: number;
  employeePayrolls: EmployeePayroll[];
  createdAt: string;
}

interface EmployeePayroll {
  id: string;
  employeeId: string;
  employee: {
    firstName: string;
    lastName: string;
    position: string;
  };
  grossSalary: number;
  netSalary: number;
  totalDeductions: number;
  totalEmployerTax: number;
  deductions: any[];
}

interface PayrollPageProps {
  companyId: string;
}

export const PayrollPage = ({ companyId }: PayrollPageProps) => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<PayrollRun | null>(null);
  const [formData, setFormData] = useState({
    periodStart: '',
    periodEnd: '',
  });

  // Fetch payroll runs
  const { data: payrollRuns = [], isLoading } = useQuery({
    queryKey: ['payroll-runs', companyId],
    queryFn: () => apiClient.getPayrollRuns(companyId),
    enabled: !!companyId,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.createPayrollRun(companyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-runs', companyId] });
      toast.success('Payroll run created successfully!');
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create payroll run');
    },
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: (id: string) => apiClient.approvePayrollRun(companyId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-runs', companyId] });
      toast.success('Payroll run approved successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to approve payroll run');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.deletePayrollRun(companyId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-runs', companyId] });
      toast.success('Payroll run deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete payroll run');
    },
  });

  const openCreateModal = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    setFormData({
      periodStart: firstDay.toISOString().split('T')[0],
      periodEnd: lastDay.toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openDetailModal = (payroll: PayrollRun) => {
    setSelectedPayroll(payroll);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedPayroll(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      periodStart: new Date(formData.periodStart),
      periodEnd: new Date(formData.periodEnd),
    };

    createMutation.mutate(data);
  };

  const handleApprove = (id: string) => {
    if (window.confirm('Are you sure you want to approve this payroll run? This action cannot be undone.')) {
      approveMutation.mutate(id);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this payroll run?')) {
      deleteMutation.mutate(id);
    }
  };

  const columns = [
    {
      header: 'Period',
      accessor: ((run: PayrollRun) =>
        `${new Date(run.periodStart).toLocaleDateString()} - ${new Date(run.periodEnd).toLocaleDateString()}`
      ) as any,
    },
    {
      header: 'Employees',
      accessor: ((run: PayrollRun) => run.employeePayrolls?.length || 0) as any,
    },
    {
      header: 'Total Gross',
      accessor: ((run: PayrollRun) => `${run.totalGross?.toFixed(2) || '0.00'} BAM`) as any,
    },
    {
      header: 'Total Net',
      accessor: ((run: PayrollRun) => `${run.totalNet?.toFixed(2) || '0.00'} BAM`) as any,
    },
    {
      header: 'Employer Tax',
      accessor: ((run: PayrollRun) => `${run.totalEmployerTax?.toFixed(2) || '0.00'} BAM`) as any,
    },
    {
      header: 'Status',
      accessor: ((run: PayrollRun) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          run.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {run.status}
        </span>
      )) as any,
    },
    {
      header: 'Actions',
      accessor: ((run: PayrollRun) => (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => openDetailModal(run)}
          >
            Details
          </Button>
          {run.status === 'DRAFT' && (
            <>
              <Button
                variant="success"
                size="sm"
                onClick={() => handleApprove(run.id)}
              >
                Approve
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDelete(run.id)}
              >
                Delete
              </Button>
            </>
          )}
        </div>
      )) as any,
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payroll</h1>
          <p className="text-gray-600 mt-1">Create and manage payroll runs</p>
        </div>
        <Button onClick={openCreateModal}>+ New Payroll Run</Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table
          data={payrollRuns}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="No payroll runs found. Create your first payroll run to get started."
        />
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Create New Payroll Run"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-gray-600">
            This will automatically calculate payroll for all active employees based on their base salary
            and applicable tax rates for the selected period.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Period Start *"
              type="date"
              value={formData.periodStart}
              onChange={(e) => setFormData({ ...formData, periodStart: e.target.value })}
              required
            />
            <Input
              label="Period End *"
              type="date"
              value={formData.periodEnd}
              onChange={(e) => setFormData({ ...formData, periodEnd: e.target.value })}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              Create Payroll Run
            </Button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
        title="Payroll Run Details"
        size="lg"
      >
        {selectedPayroll && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
              <div>
                <span className="text-sm text-gray-600">Period:</span>
                <p className="font-semibold">
                  {new Date(selectedPayroll.periodStart).toLocaleDateString()} - {new Date(selectedPayroll.periodEnd).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Status:</span>
                <p className="font-semibold">{selectedPayroll.status}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Total Gross:</span>
                <p className="font-semibold">{selectedPayroll.totalGross?.toFixed(2)} BAM</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Total Net:</span>
                <p className="font-semibold">{selectedPayroll.totalNet?.toFixed(2)} BAM</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Employer Tax:</span>
                <p className="font-semibold">{selectedPayroll.totalEmployerTax?.toFixed(2)} BAM</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Employees:</span>
                <p className="font-semibold">{selectedPayroll.employeePayrolls?.length || 0}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Employee Breakdown</h3>
              <div className="space-y-2">
                {selectedPayroll.employeePayrolls?.map((ep: EmployeePayroll) => (
                  <div key={ep.id} className="p-3 bg-gray-50 rounded grid grid-cols-4 gap-2">
                    <div>
                      <span className="text-xs text-gray-600">Employee:</span>
                      <p className="font-medium">{ep.employee.firstName} {ep.employee.lastName}</p>
                      <p className="text-xs text-gray-500">{ep.employee.position}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-600">Gross:</span>
                      <p className="font-medium">{ep.grossSalary?.toFixed(2)} BAM</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-600">Deductions:</span>
                      <p className="font-medium">{ep.totalDeductions?.toFixed(2)} BAM</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-600">Net:</span>
                      <p className="font-medium text-green-600">{ep.netSalary?.toFixed(2)} BAM</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={closeDetailModal}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
