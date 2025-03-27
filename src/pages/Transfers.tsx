
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { format } from "date-fns";
import { TransferDialog } from "@/components/transfers/TransferDialog";
import { TransfersHeader } from "@/components/transfers/components/TransfersHeader";
import { TransfersContent } from "@/components/transfers/components/TransfersContent";
import { TransfersLoading } from "@/components/transfers/components/TransfersLoading";
import { useTransfersData } from "@/hooks/transfers/use-transfers-data";
import { useTransferForm } from "@/hooks/transfers/use-transfer-form";

export default function Transfers() {
  const { 
    filteredTransfers, 
    warehouses, 
    products, 
    posLocations, 
    isLoading, 
    searchQuery, 
    setSearchQuery 
  } = useTransfersData();
  
  const {
    form,
    isDialogOpen,
    setIsDialogOpen,
    editingTransfer,
    setEditingTransfer,
    onSubmit,
    handleEdit,
    handleDelete
  } = useTransferForm();

  const handleNewTransferClick = () => {
    setEditingTransfer(null);
    form.reset({
      source_warehouse_id: "",
      destination_warehouse_id: "",
      source_pos_id: "",
      destination_pos_id: "",
      transfer_type: "depot_to_pos",
      notes: "",
      status: "pending",
      transfer_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      product_id: "",
      quantity: 1,
    });
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <TransfersLoading />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="h-full">
        <div className="space-y-6 p-4">
          <TransfersHeader 
            transfers={filteredTransfers} 
            onNewTransferClick={handleNewTransferClick} 
          />

          <TransfersContent
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filteredTransfers={filteredTransfers}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>

        <TransferDialog
          form={form}
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSubmit={onSubmit}
          editingTransfer={editingTransfer}
          warehouses={warehouses}
          products={products}
          posLocations={posLocations}
        />
      </div>
    </DashboardLayout>
  );
}
