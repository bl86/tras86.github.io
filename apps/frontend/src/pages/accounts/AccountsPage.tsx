import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import toast from 'react-hot-toast';

interface Account {
  id: string;
  code: string;
  name: string;
  nameEn: string | null;
  type: string;
  parentId: string | null;
  isActive: boolean;
}

export const AccountsPage = ({ companyId }: { companyId: string }) => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    nameEn: '',
    type: 'ASSET',
    parentId: '',
  });

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['accounts', companyId],
    queryFn: () => apiClient.getAccounts(companyId),
    enabled: !!companyId,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.createAccount(companyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts', companyId] });
      toast.success('Account created!');
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create account');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiClient.updateAccount(companyId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts', companyId] });
      toast.success('Account updated!');
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteAccount(companyId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts', companyId] });
      toast.success('Account deleted!');
    },
  });

  const openCreateModal = () => {
    setEditingAccount(null);
    setFormData({ code: '', name: '', nameEn: '', type: 'ASSET', parentId: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (account: Account) => {
    setEditingAccount(account);
    setFormData({
      code: account.code,
      name: account.name,
      nameEn: account.nameEn || '',
      type: account.type,
      parentId: account.parentId || '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAccount(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAccount) {
      updateMutation.mutate({ id: editingAccount.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (account: Account) => {
    if (window.confirm(`Delete account "${account.code} - ${account.name}"?`)) {
      deleteMutation.mutate(account.id);
    }
  };

  const columns = [
    { header: 'Code', accessor: 'code' as keyof Account },
    { header: 'Name', accessor: 'name' as keyof Account },
    { header: 'Type', accessor: 'type' as keyof Account },
    {
      header: 'Status',
      accessor: (row: Account) => (
        <span className={`px-2 py-1 text-xs rounded ${row.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (row: Account) => (
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
        <h1 className="text-2xl font-bold">Chart of Accounts</h1>
        <Button onClick={openCreateModal}>+ Create Account</Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table data={accounts} columns={columns} isLoading={isLoading} emptyMessage="No accounts found" />
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingAccount ? 'Edit Account' : 'Create Account'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Account Code (6 digits)"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            pattern="[0-9]{6}"
            maxLength={6}
            required
          />
          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Name (English)"
            value={formData.nameEn}
            onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
          />
          <Select
            label="Account Type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            options={[
              { value: 'ASSET', label: 'Asset (Aktiva)' },
              { value: 'LIABILITY', label: 'Liability (Pasiva)' },
              { value: 'EQUITY', label: 'Equity (Kapital)' },
              { value: 'REVENUE', label: 'Revenue (Prihodi)' },
              { value: 'EXPENSE', label: 'Expense (Rashodi)' },
            ]}
            required
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
