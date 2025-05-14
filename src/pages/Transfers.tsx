
import { useState, useEffect } from 'react';
import { TransfersHeader } from '@/components/transfers/components/TransfersHeader';
import { TransfersContent } from '@/components/transfers/components/TransfersContent';
import { TransferDialog } from '@/components/transfers/TransferDialog';
import { useTransfers } from '@/hooks/use-transfers';
import { useToast } from '@/components/ui/use-toast';

export default function TransfersPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState<any>(null);
  
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
    warehouses,
  } = useTransfers();

  // Debug logs
  useEffect(() => {
    console.log("TransfersPage data:", {
      warehouses: warehouses?.length,
      warehouses_data: warehouses,
      products: products?.length,
    });
  }, [warehouses, products]);

  const handleEdit = async (transfer: any) => {
    setEditingTransfer(transfer);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce transfert ?')) {
      await deleteTransfer(id);
    }
  };

  const handleNewTransferClick = () => {
    setEditingTransfer(null);
    setIsDialogOpen(true);
  };

  const handleFormSubmit = async (values: any) => {
    console.log("Form submitted with values:", values);
    // The form submission is handled by the dialog component
    setIsDialogOpen(false);
    
    // Refresh the transfers list
    await refetch();
    
    toast({
      title: "Succès",
      description: editingTransfer 
        ? "Le transfert a été modifié avec succès" 
        : "Le transfert a été créé avec succès",
    });
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
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSubmit={handleFormSubmit}
          editingTransfer={editingTransfer}
          warehouses={warehouses || []}
          products={products || []}
        />
      )}
    </div>
  );
}
