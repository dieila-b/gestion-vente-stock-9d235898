
import { useState, useEffect } from 'react';
import { TransfersHeader } from '@/components/transfers/components/TransfersHeader';
import { TransfersContent } from '@/components/transfers/components/TransfersContent';
import { TransferDialog } from '@/components/transfers/TransferDialog';
import { useTransfers } from '@/hooks/use-transfers';
import { useTransferForm } from '@/hooks/use-transfer-form';
import { Transfer } from '@/types/transfer';

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
  } = useTransferForm(refetch);

  // Create wrappers for the handlers
  const handleFormSubmitWrapper = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleFormSubmit(e);
    setIsDialogOpen(false);
    setEditingTransfer(null);
  };

  const handleEdit = async (transfer: Transfer) => {
    setExistingFormData(transfer);
    setEditingTransfer(transfer);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce transfert ?')) {
      await deleteTransfer(id);
    }
  };

  const handleNewTransferClick = () => {
    resetForm();
    setEditingTransfer(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="container py-8 space-y-8 max-w-7xl mx-auto">
      <TransfersHeader 
        transfers={transfers}
        onNewTransferClick={handleNewTransferClick}
      />
      
      <TransfersContent
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filteredTransfers={filteredTransfers.length > 0 ? filteredTransfers : transfers}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      
      {isDialogOpen && (
        <TransferDialog
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
