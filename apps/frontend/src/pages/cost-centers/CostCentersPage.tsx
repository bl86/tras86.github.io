/**
 * Cost Centers Page - Full CRUD for Cost Center Management
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Table } from '@/components/ui/Table';
import toast from 'react-hot-toast';

interface CostCenter {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

interface CostCentersPageProps {
  companyId: string;
}

export const CostCentersPage = ({ companyId }: CostCentersPageProps) => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCostCenter, setEditingCostCenter] = useState<CostCenter | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
  });

  // Fetch cost centers
  const { data: costCenters = [], isLoading } = useQuery({
    queryKey: ['cost-centers', companyId],
    queryFn: () => apiClient.getCostCenters(companyId),
    enabled: !!companyId,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.createCostCenter(companyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-centers', companyId] });
      toast.success('Cost center created successfully!');
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create cost center');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiClient.updateCostCenter(companyId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-centers', companyId] });
      toast.success('Cost center updated successfully!');
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update cost center');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteCostCenter(companyId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-centers', companyId] });
      toast.success('Cost center deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete cost center');
    },
  });

  const openCreateModal = () => {
    setEditingCostCenter(null);
    setFormData({
      code: '',
      name: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (costCenter: CostCenter) => {
    setEditingCostCenter(costCenter);
    setFormData({
      code: costCenter.code,
      name: costCenter.name,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCostCenter(null);
    setFormData({
      code: '',
      name: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      code: formData.code,
      name: formData.name,
    };

    if (editingCostCenter) {
      updateMutation.mutate({ id: editingCostCenter.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this cost center?')) {
      deleteMutation.mutate(id);
    }
  };

  const columns = [
    { header: 'Code', accessor: 'code' as keyof CostCenter },
    { header: 'Name', accessor: 'name' as keyof CostCenter },
    {
      header: 'Status',
      accessor: ((costCenter: CostCenter) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${costCenter.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {costCenter.isActive ? 'Active' : 'Inactive'}
        </span>
      )) as any,
    },
    {
      header: 'Created',
      accessor: ((costCenter: CostCenter) => new Date(costCenter.createdAt).toLocaleDateString()) as any,
    },
    {
      header: 'Actions',
      accessor: ((costCenter: CostCenter) => (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => openEditModal(costCenter)}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDelete(costCenter.id)}
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
          <h1 className="text-3xl font-bold text-gray-900">Cost Centers</h1>
          <p className="text-gray-600 mt-1">Manage cost centers for better expense tracking</p>
        </div>
        <Button onClick={openCreateModal}>+ Add Cost Center</Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table
          data={costCenters}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="No cost centers found. Create your first cost center to get started."
        />
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingCostCenter ? 'Edit Cost Center' : 'Create New Cost Center'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Code *"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            placeholder="e.g., CC001, CC002"
            required
            disabled={!!editingCostCenter}
          />

          <Input
            label="Name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Administration, Sales, Production"
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
              {editingCostCenter ? 'Update' : 'Create'} Cost Center
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
