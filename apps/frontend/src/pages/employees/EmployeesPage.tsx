/**
 * Employees Page - Full CRUD for Employee Management
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Table } from '@/components/ui/Table';
import toast from 'react-hot-toast';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  personalId: string;
  baseSalary: number;
  position: string;
  employmentDate: string;
  isActive: boolean;
}

interface EmployeesPageProps {
  companyId: string;
}

export const EmployeesPage = ({ companyId }: EmployeesPageProps) => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    personalId: '',
    baseSalary: '',
    position: '',
    employmentDate: '',
  });

  // Fetch employees
  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['employees', companyId],
    queryFn: () => apiClient.getEmployees(companyId),
    enabled: !!companyId,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.createEmployee(companyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees', companyId] });
      toast.success('Employee created successfully!');
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create employee');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiClient.updateEmployee(companyId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees', companyId] });
      toast.success('Employee updated successfully!');
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update employee');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteEmployee(companyId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees', companyId] });
      toast.success('Employee deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete employee');
    },
  });

  const openCreateModal = () => {
    setEditingEmployee(null);
    setFormData({
      firstName: '',
      lastName: '',
      personalId: '',
      baseSalary: '',
      position: '',
      employmentDate: new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      firstName: employee.firstName,
      lastName: employee.lastName,
      personalId: employee.personalId,
      baseSalary: employee.baseSalary.toString(),
      position: employee.position,
      employmentDate: employee.employmentDate.split('T')[0],
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
    setFormData({
      firstName: '',
      lastName: '',
      personalId: '',
      baseSalary: '',
      position: '',
      employmentDate: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      personalId: formData.personalId,
      baseSalary: parseFloat(formData.baseSalary),
      position: formData.position,
      employmentDate: new Date(formData.employmentDate),
    };

    if (editingEmployee) {
      updateMutation.mutate({ id: editingEmployee.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      deleteMutation.mutate(id);
    }
  };

  const columns = [
    { header: 'First Name', accessor: 'firstName' as keyof Employee },
    { header: 'Last Name', accessor: 'lastName' as keyof Employee },
    { header: 'Personal ID', accessor: 'personalId' as keyof Employee },
    { header: 'Position', accessor: 'position' as keyof Employee },
    {
      header: 'Base Salary',
      accessor: ((employee: Employee) => `${employee.baseSalary.toFixed(2)} BAM`) as any,
    },
    {
      header: 'Employment Date',
      accessor: ((employee: Employee) => new Date(employee.employmentDate).toLocaleDateString()) as any,
    },
    {
      header: 'Status',
      accessor: ((employee: Employee) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${employee.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {employee.isActive ? 'Active' : 'Inactive'}
        </span>
      )) as any,
    },
    {
      header: 'Actions',
      accessor: ((employee: Employee) => (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => openEditModal(employee)}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDelete(employee.id)}
          >
            Delete
          </Button>
        </div>
      )) as any,
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-600 mt-1">Manage your company employees</p>
        </div>
        <Button onClick={openCreateModal}>+ Add Employee</Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table
          data={employees}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="No employees found. Create your first employee to get started."
        />
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingEmployee ? 'Edit Employee' : 'Create New Employee'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name *"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
            <Input
              label="Last Name *"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
          </div>

          <Input
            label="Personal ID (JMBG) *"
            value={formData.personalId}
            onChange={(e) => setFormData({ ...formData, personalId: e.target.value })}
            placeholder="1234567890123"
            required
          />

          <Input
            label="Position *"
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            placeholder="e.g., Accountant, Manager"
            required
          />

          <Input
            label="Base Salary (BAM) *"
            type="number"
            step="0.01"
            value={formData.baseSalary}
            onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
            required
          />

          <Input
            label="Employment Date *"
            type="date"
            value={formData.employmentDate}
            onChange={(e) => setFormData({ ...formData, employmentDate: e.target.value })}
            required
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editingEmployee ? 'Update' : 'Create'} Employee
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
