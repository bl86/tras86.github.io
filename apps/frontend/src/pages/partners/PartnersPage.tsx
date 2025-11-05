import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import toast from 'react-hot-toast';

interface Partner {
  id: string;
  name: string;
  taxId: string | null;
  type: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  isActive: boolean;
}

export const PartnersPage = ({ companyId }: { companyId: string }) => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [filterType, setFilterType] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    taxId: '',
    type: 'CUSTOMER',
    email: '',
    phone: '',
    address: '',
    city: '',
  });

  const { data: partners = [], isLoading } = useQuery({
    queryKey: ['partners', companyId, filterType],
    queryFn: () => apiClient.getPartners(companyId, filterType ? { type: filterType } : {}),
    enabled: !!companyId,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.createPartner(companyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners', companyId] });
      toast.success('Partner created!');
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create partner');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiClient.updatePartner(companyId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners', companyId] });
      toast.success('Partner updated!');
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.deletePartner(companyId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners', companyId] });
      toast.success('Partner deleted!');
    },
  });

  const openCreateModal = () => {
    setEditingPartner(null);
    setFormData({ name: '', taxId: '', type: 'CUSTOMER', email: '', phone: '', address: '', city: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (partner: Partner) => {
    setEditingPartner(partner);
    setFormData({
      name: partner.name,
      taxId: partner.taxId || '',
      type: partner.type,
      email: partner.email || '',
      phone: partner.phone || '',
      address: partner.address || '',
      city: partner.city || '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPartner(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPartner) {
      updateMutation.mutate({ id: editingPartner.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (partner: Partner) => {
    if (window.confirm(`Delete partner "${partner.name}"?`)) {
      deleteMutation.mutate(partner.id);
    }
  };

  const columns = [
    { header: 'Name', accessor: 'name' as keyof Partner },
    { header: 'Tax ID', accessor: 'taxId' as keyof Partner },
    {
      header: 'Type',
      accessor: (row: Partner) => (
        <span className={`px-2 py-1 text-xs rounded ${row.type === 'CUSTOMER' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
          {row.type}
        </span>
      ),
    },
    { header: 'Email', accessor: 'email' as keyof Partner },
    { header: 'Phone', accessor: 'phone' as keyof Partner },
    {
      header: 'Actions',
      accessor: (row: Partner) => (
        <div className="flex gap-2">
          <Button size="sm" onClick={(e) => { e.stopPropagation(); openEditModal(row); }}>Edit</Button>
          <Button size="sm" variant="danger" onClick={(e) => { e.stopPropagation(); handleDelete(row); }}>Delete</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Partners (Customers & Suppliers)</h1>
        <div className="flex gap-2">
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            options={[
              { value: '', label: 'All Types' },
              { value: 'CUSTOMER', label: 'Customers' },
              { value: 'SUPPLIER', label: 'Suppliers' },
              { value: 'BOTH', label: 'Both' },
            ]}
          />
          <Button onClick={openCreateModal}>+ Create Partner</Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table data={partners} columns={columns} isLoading={isLoading} emptyMessage="No partners found" />
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingPartner ? 'Edit Partner' : 'Create Partner'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Partner Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Tax ID"
            value={formData.taxId}
            onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
          />
          <Select
            label="Partner Type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            options={[
              { value: 'CUSTOMER', label: 'Customer (Kupac)' },
              { value: 'SUPPLIER', label: 'Supplier (Dobavljač)' },
              { value: 'BOTH', label: 'Both (Oboje)' },
            ]}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <Input
            label="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
          <Input
            label="City"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
