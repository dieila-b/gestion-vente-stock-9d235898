
import { useState, useEffect } from 'react';
import { TransfersTable } from '@/components/warehouse/TransfersTable';
import { TransferFormDialog } from '@/components/warehouse/TransferFormDialog';
import { useTransfers } from '@/hooks/use-transfers';
import { useTransferForm } from '@/hooks/use-transfer-form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function TransfersPage() {
  const {
    transfers,
    filteredTransfers,
    searchQuery,
    setSearchQuery,
    products,
    isLoading,
    isError,
    refetch,
    deleteTransfer,
    fetchTransferById,
    posLocations,
    warehouses,
  } = useTransfers();

  const {
    formState,
    isSubmitting,
    isDialogOpen,
    setIsDialogOpen,
    editingTransfer,
    setEditingTransfer,
    handleSourceWarehouseChange,
    handleDestinationWarehouseChange,
    handleProductSelect,
    handleQuantityChange,
    handleFormSubmit,
    resetForm,
    setExistingFormData,
    handleEdit: formHandleEdit,
    handleDelete: formHandleDelete,
  } = useTransferForm(refetch);

  // Create wrappers for the handlers
  const handleFormSubmitWrapper = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleFormSubmit(e);
    setIsDialogOpen(false);
    setEditingTransfer(null);
  };

  const handleEdit = async (id: string) => {
    const transfer = await fetchTransferById(id);
    if (transfer) {
      setExistingFormData(transfer);
      setEditingTransfer(transfer);
      setIsDialogOpen(true);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this transfer?')) {
      await deleteTransfer(id);
    }
  };

  // Mocked or simplified versions for the component props
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Transfers</h1>
    
      <div className="mb-6 flex justify-between">
        <Input
          placeholder="Search transfers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs"
        />
        <Button onClick={() => {
          resetForm();
          setEditingTransfer(null);
          setIsDialogOpen(true);
        }}>
          New Transfer
        </Button>
      </div>
      
      <TransfersTable 
        transfers={filteredTransfers.length > 0 ? filteredTransfers : transfers}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      
      {isDialogOpen && (
        <TransferFormDialog
          open={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false);
            resetForm();
          }}
          formState={formState}
          isSubmitting={isSubmitting}
          warehouses={warehouses}
          posLocations={posLocations}
          products={products}
          onSourceWarehouseChange={handleSourceWarehouseChange}
          onDestinationWarehouseChange={handleDestinationWarehouseChange}
          onProductSelect={handleProductSelect}
          onQuantityChange={handleQuantityChange}
          onSubmit={handleFormSubmitWrapper}
          isEditing={!!editingTransfer}
        />
      )}
    </div>
  );
}
