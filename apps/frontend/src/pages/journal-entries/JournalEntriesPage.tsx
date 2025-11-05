/**
 * Journal Entries Page - Full CRUD for General Ledger
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Table } from '@/components/ui/Table';
import toast from 'react-hot-toast';

interface JournalEntry {
  id: string;
  entryNumber: string;
  entryDate: string;
  description: string;
  status: 'DRAFT' | 'POSTED';
  lines: JournalEntryLine[];
  createdAt: string;
}

interface JournalEntryLine {
  id?: string;
  accountId: string;
  accountCode?: string;
  accountName?: string;
  debit: number;
  credit: number;
  description: string;
}

interface Account {
  id: string;
  code: string;
  name: string;
}

interface JournalEntriesPageProps {
  companyId: string;
}

export const JournalEntriesPage = ({ companyId }: JournalEntriesPageProps) => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [formData, setFormData] = useState({
    entryDate: new Date().toISOString().split('T')[0],
    description: '',
    lines: [
      { accountId: '', debit: '', credit: '', description: '' },
      { accountId: '', debit: '', credit: '', description: '' },
    ],
  });

  // Fetch journal entries
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['journal-entries', companyId],
    queryFn: () => apiClient.getJournalEntries(companyId),
    enabled: !!companyId,
  });

  // Fetch accounts for dropdown
  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts', companyId],
    queryFn: () => apiClient.getAccounts(companyId),
    enabled: !!companyId,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.createJournalEntry(companyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries', companyId] });
      toast.success('Journal entry created successfully!');
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create journal entry');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiClient.updateJournalEntry(companyId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries', companyId] });
      toast.success('Journal entry updated successfully!');
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update journal entry');
    },
  });

  // Post mutation
  const postMutation = useMutation({
    mutationFn: (id: string) => apiClient.postJournalEntry(companyId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries', companyId] });
      toast.success('Journal entry posted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to post journal entry');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteJournalEntry(companyId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries', companyId] });
      toast.success('Journal entry deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete journal entry');
    },
  });

  const openCreateModal = () => {
    setEditingEntry(null);
    setFormData({
      entryDate: new Date().toISOString().split('T')[0],
      description: '',
      lines: [
        { accountId: '', debit: '', credit: '', description: '' },
        { accountId: '', debit: '', credit: '', description: '' },
      ],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setFormData({
      entryDate: entry.entryDate.split('T')[0],
      description: entry.description,
      lines: entry.lines.map((line) => ({
        accountId: line.accountId,
        debit: line.debit.toString(),
        credit: line.credit.toString(),
        description: line.description,
      })),
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEntry(null);
  };

  const addLine = () => {
    setFormData({
      ...formData,
      lines: [...formData.lines, { accountId: '', debit: '', credit: '', description: '' }],
    });
  };

  const removeLine = (index: number) => {
    if (formData.lines.length <= 2) {
      toast.error('At least 2 lines are required');
      return;
    }
    const newLines = formData.lines.filter((_, i) => i !== index);
    setFormData({ ...formData, lines: newLines });
  };

  const updateLine = (index: number, field: string, value: string) => {
    const newLines = [...formData.lines];
    (newLines[index] as any)[field] = value;
    setFormData({ ...formData, lines: newLines });
  };

  const calculateTotals = () => {
    const totalDebit = formData.lines.reduce((sum, line) => sum + (parseFloat(line.debit) || 0), 0);
    const totalCredit = formData.lines.reduce((sum, line) => sum + (parseFloat(line.credit) || 0), 0);
    return { totalDebit, totalCredit, balanced: totalDebit === totalCredit && totalDebit > 0 };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const { totalDebit, totalCredit, balanced } = calculateTotals();

    if (!balanced) {
      toast.error(`Entry not balanced! Debit: ${totalDebit.toFixed(2)}, Credit: ${totalCredit.toFixed(2)}`);
      return;
    }

    const data = {
      entryDate: new Date(formData.entryDate),
      description: formData.description,
      lines: formData.lines.map((line) => ({
        accountId: line.accountId,
        debit: parseFloat(line.debit) || 0,
        credit: parseFloat(line.credit) || 0,
        description: line.description,
      })),
    };

    if (editingEntry) {
      updateMutation.mutate({ id: editingEntry.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handlePost = (id: string) => {
    if (window.confirm('Are you sure you want to post this journal entry? This action cannot be undone.')) {
      postMutation.mutate(id);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this journal entry?')) {
      deleteMutation.mutate(id);
    }
  };

  const columns = [
    { header: 'Entry #', accessor: 'entryNumber' as keyof JournalEntry },
    {
      header: 'Date',
      accessor: ((entry: JournalEntry) => new Date(entry.entryDate).toLocaleDateString()) as any,
    },
    { header: 'Description', accessor: 'description' as keyof JournalEntry },
    {
      header: 'Amount',
      accessor: ((entry: JournalEntry) => {
        const total = entry.lines.reduce((sum, line) => sum + line.debit, 0);
        return `${total.toFixed(2)} BAM`;
      }) as any,
    },
    {
      header: 'Status',
      accessor: ((entry: JournalEntry) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          entry.status === 'POSTED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {entry.status}
        </span>
      )) as any,
    },
    {
      header: 'Actions',
      accessor: ((entry: JournalEntry) => (
        <div className="flex gap-2">
          {entry.status === 'DRAFT' && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => openEditModal(entry)}
              >
                Edit
              </Button>
              <Button
                variant="success"
                size="sm"
                onClick={() => handlePost(entry.id)}
              >
                Post
              </Button>
            </>
          )}
          {entry.status === 'DRAFT' && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleDelete(entry.id)}
            >
              Delete
            </Button>
          )}
        </div>
      )) as any,
    },
  ];

  const { totalDebit, totalCredit, balanced } = calculateTotals();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Journal Entries</h1>
          <p className="text-gray-600 mt-1">General ledger entries (double-entry bookkeeping)</p>
        </div>
        <Button onClick={openCreateModal}>+ New Journal Entry</Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table
          data={entries}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="No journal entries found. Create your first entry to get started."
        />
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingEntry ? 'Edit Journal Entry' : 'Create New Journal Entry'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Entry Date *"
              type="date"
              value={formData.entryDate}
              onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
              required
            />
            <Input
              label="Description *"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the transaction"
              required
            />
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-900">Journal Entry Lines</h3>
              <Button type="button" size="sm" onClick={addLine}>
                + Add Line
              </Button>
            </div>

            <div className="space-y-3">
              {formData.lines.map((line, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end p-3 bg-gray-50 rounded">
                  <div className="col-span-4">
                    <Select
                      label={index === 0 ? 'Account' : ''}
                      value={line.accountId}
                      onChange={(e) => updateLine(index, 'accountId', e.target.value)}
                      required
                    >
                      <option value="">Select Account</option>
                      {accounts.map((account: Account) => (
                        <option key={account.id} value={account.id}>
                          {account.code} - {account.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Input
                      label={index === 0 ? 'Debit' : ''}
                      type="number"
                      step="0.01"
                      value={line.debit}
                      onChange={(e) => updateLine(index, 'debit', e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      label={index === 0 ? 'Credit' : ''}
                      type="number"
                      step="0.01"
                      value={line.credit}
                      onChange={(e) => updateLine(index, 'credit', e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      label={index === 0 ? 'Description' : ''}
                      value={line.description}
                      onChange={(e) => updateLine(index, 'description', e.target.value)}
                      placeholder="Line description"
                    />
                  </div>
                  <div className="col-span-1">
                    {formData.lines.length > 2 && (
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => removeLine(index)}
                      >
                        ×
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-gray-100 rounded">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Totals:</span>
                <div className="flex gap-6">
                  <span>Debit: <strong>{totalDebit.toFixed(2)}</strong></span>
                  <span>Credit: <strong>{totalCredit.toFixed(2)}</strong></span>
                  <span className={balanced ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                    {balanced ? '✓ Balanced' : '✗ Not Balanced'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!balanced || createMutation.isPending || updateMutation.isPending}
            >
              {editingEntry ? 'Update' : 'Create'} Entry
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
