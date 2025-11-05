import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import toast from 'react-hot-toast';

interface Company {
  id: string;
  name: string;
  taxNumber: string;
  vatNumber?: string;
  registrationNumber: string;
  legalEntity: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  bankName?: string;
  bankAccount?: string;
  swift?: string;
  fiscalYearStart: number;
  fiscalYearEnd: number;
  baseCurrency: string;
  isActive: boolean;
}

export const CompaniesPage = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    taxNumber: '',
    vatNumber: '',
    registrationNumber: '',
    legalEntity: 'RS',
    address: '',
    city: '',
    postalCode: '',
    country: 'BiH',
    bankName: '',
    bankAccount: '',
    swift: '',
    fiscalYearStart: 1,
    fiscalYearEnd: 12,
    baseCurrency: 'BAM',
  });

  // Fetch companies
  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: () => apiClient.getCompanies(),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.createCompany(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Company created successfully!');
      closeModal();
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Failed to create company';
      toast.error(message);
      console.error('Create company error:', error.response?.data);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiClient.updateCompany(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Company updated successfully!');
      closeModal();
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Failed to update company';
      toast.error(message);
      console.error('Update company error:', error.response?.data);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Company deleted successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Failed to delete company';
      toast.error(message);
    },
  });

  const openCreateModal = () => {
    setEditingCompany(null);
    setFormData({
      name: '',
      taxNumber: '',
      vatNumber: '',
      registrationNumber: '',
      legalEntity: 'RS',
      address: '',
      city: '',
      postalCode: '',
      country: 'BiH',
      bankName: '',
      bankAccount: '',
      swift: '',
      fiscalYearStart: 1,
      fiscalYearEnd: 12,
      baseCurrency: 'BAM',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      taxNumber: company.taxNumber,
      vatNumber: company.vatNumber || '',
      registrationNumber: company.registrationNumber,
      legalEntity: company.legalEntity,
      address: company.address,
      city: company.city,
      postalCode: company.postalCode,
      country: company.country,
      bankName: company.bankName || '',
      bankAccount: company.bankAccount || '',
      swift: company.swift || '',
      fiscalYearStart: company.fiscalYearStart,
      fiscalYearEnd: company.fiscalYearEnd,
      baseCurrency: company.baseCurrency,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCompany(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Clean up form data - remove empty optional fields
    const submitData: any = { ...formData };
    if (!submitData.vatNumber) delete submitData.vatNumber;
    if (!submitData.bankName) delete submitData.bankName;
    if (!submitData.bankAccount) delete submitData.bankAccount;
    if (!submitData.swift) delete submitData.swift;

    if (editingCompany) {
      updateMutation.mutate({ id: editingCompany.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleDelete = (company: Company) => {
    if (window.confirm(`Are you sure you want to delete "${company.name}"?`)) {
      deleteMutation.mutate(company.id);
    }
  };

  const columns = [
    { header: 'Name', accessor: 'name' as keyof Company },
    { header: 'Tax Number (JIB)', accessor: 'taxNumber' as keyof Company },
    { header: 'City', accessor: 'city' as keyof Company },
    { header: 'Entity', accessor: 'legalEntity' as keyof Company },
    {
      header: 'Status',
      accessor: (row: Company) => (
        <span className={`px-2 py-1 text-xs rounded ${row.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (row: Company) => (
        <div className="flex gap-2">
          <Button size="sm" onClick={(e) => { e.stopPropagation(); openEditModal(row); }}>
            Edit
          </Button>
          <Button size="sm" variant="danger" onClick={(e) => { e.stopPropagation(); handleDelete(row); }}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
        <Button onClick={openCreateModal}>+ Create Company</Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table
          data={companies}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="No companies found. Create your first company!"
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingCompany ? 'Edit Company' : 'Create Company'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 border-b pb-2">Basic Information</h3>

            <Input
              label="Company Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="e.g., ABC Trade d.o.o."
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Tax Number (JIB) *"
                value={formData.taxNumber}
                onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                required
                placeholder="13 digits"
                maxLength={13}
              />
              <Input
                label="VAT Number (PDV)"
                value={formData.vatNumber}
                onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })}
                placeholder="12 digits (optional)"
                maxLength={12}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Registration Number *"
                value={formData.registrationNumber}
                onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                required
                placeholder="Company registration number"
              />
              <Select
                label="Legal Entity *"
                value={formData.legalEntity}
                onChange={(e) => setFormData({ ...formData, legalEntity: e.target.value })}
                options={[
                  { value: 'RS', label: 'Republika Srpska' },
                  { value: 'FBIH', label: 'Federacija BiH' },
                  { value: 'BD', label: 'Brčko Distrikt' },
                ]}
                required
              />
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4 pt-4">
            <h3 className="font-semibold text-gray-900 border-b pb-2">Address Information</h3>

            <Input
              label="Address *"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
              placeholder="Street and number"
            />

            <div className="grid grid-cols-3 gap-4">
              <Input
                label="City *"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
                placeholder="e.g., Banja Luka"
              />
              <Input
                label="Postal Code *"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                required
                placeholder="e.g., 78000"
              />
              <Input
                label="Country *"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                required
                placeholder="BiH"
              />
            </div>
          </div>

          {/* Banking Information */}
          <div className="space-y-4 pt-4">
            <h3 className="font-semibold text-gray-900 border-b pb-2">Banking Information (Optional)</h3>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Bank Name"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                placeholder="e.g., UniCredit Bank"
              />
              <Input
                label="Bank Account (IBAN)"
                value={formData.bankAccount}
                onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                placeholder="BA39..."
              />
            </div>

            <Input
              label="SWIFT/BIC Code"
              value={formData.swift}
              onChange={(e) => setFormData({ ...formData, swift: e.target.value })}
              placeholder="e.g., UNCRBA22"
            />
          </div>

          {/* Fiscal Settings */}
          <div className="space-y-4 pt-4">
            <h3 className="font-semibold text-gray-900 border-b pb-2">Fiscal Settings</h3>

            <div className="grid grid-cols-3 gap-4">
              <Select
                label="Fiscal Year Start *"
                value={String(formData.fiscalYearStart)}
                onChange={(e) => setFormData({ ...formData, fiscalYearStart: Number(e.target.value) })}
                options={[
                  { value: '1', label: 'January' },
                  { value: '2', label: 'February' },
                  { value: '3', label: 'March' },
                  { value: '4', label: 'April' },
                  { value: '5', label: 'May' },
                  { value: '6', label: 'June' },
                  { value: '7', label: 'July' },
                  { value: '8', label: 'August' },
                  { value: '9', label: 'September' },
                  { value: '10', label: 'October' },
                  { value: '11', label: 'November' },
                  { value: '12', label: 'December' },
                ]}
                required
              />
              <Select
                label="Fiscal Year End *"
                value={String(formData.fiscalYearEnd)}
                onChange={(e) => setFormData({ ...formData, fiscalYearEnd: Number(e.target.value) })}
                options={[
                  { value: '1', label: 'January' },
                  { value: '2', label: 'February' },
                  { value: '3', label: 'March' },
                  { value: '4', label: 'April' },
                  { value: '5', label: 'May' },
                  { value: '6', label: 'June' },
                  { value: '7', label: 'July' },
                  { value: '8', label: 'August' },
                  { value: '9', label: 'September' },
                  { value: '10', label: 'October' },
                  { value: '11', label: 'November' },
                  { value: '12', label: 'December' },
                ]}
                required
              />
              <Select
                label="Base Currency *"
                value={formData.baseCurrency}
                onChange={(e) => setFormData({ ...formData, baseCurrency: e.target.value })}
                options={[
                  { value: 'BAM', label: 'BAM - Konvertibilna Marka' },
                  { value: 'EUR', label: 'EUR - Euro' },
                  { value: 'USD', label: 'USD - US Dollar' },
                  { value: 'CHF', label: 'CHF - Swiss Franc' },
                ]}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-6 border-t sticky bottom-0 bg-white">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
