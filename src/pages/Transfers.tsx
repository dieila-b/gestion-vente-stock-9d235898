
import { useState, useEffect } from 'react';
import { TransfersHeader } from '@/components/transfers/components/TransfersHeader';
import { TransfersContent } from '@/components/transfers/components/TransfersContent';
import { TransferDialog } from '@/components/transfers/TransferDialog';
import { useTransfers } from '@/hooks/use-transfers';
import { useTransferForm } from '@/hooks/use-transfer-form';
import { Transfer } from '@/types/transfer';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { transferFormSchema, TransferFormValues } from '@/components/transfers/schemas/transfer-form-schema';

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

  // Setup the form with zod validation
  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferFormSchema),
    defaultValues: {
      transfer_type: "depot_to_depot",
      status: "pending",
      transfer_date: new Date().toISOString().split("T")[0],
      quantity: 1,
    },
  });

  // Debug logs
  useEffect(() => {
    console.log("TransfersPage data:", {
      warehouses: warehouses?.length,
      warehouses_data: warehouses,
      posLocations: posLocations?.length,
      products: products?.length,
    });
  }, [warehouses, posLocations, products]);

  // Create wrappers for the handlers
  const handleFormSubmitWrapper = async (values: TransferFormValues) => {
    console.log("Form values submitted:", values);
    // Handle form submission with the values
    await handleFormSubmit({ preventDefault: () => {} } as React.FormEvent);
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
          form={form}
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSubmit={handleFormSubmitWrapper}
          editingTransfer={editingTransfer}
          warehouses={warehouses || []}
          products={products || []}
          posLocations={posLocations || []}
        />
      )}
    </div>
  );
}
