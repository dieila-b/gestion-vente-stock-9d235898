
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";
import { DeliveryNote } from "@/types/delivery-note";
import { DeliveryNoteList } from "@/components/delivery-notes/DeliveryNoteList";
import { DeliveryNotePrintDialog } from "@/components/delivery-notes/DeliveryNotePrintDialog";
import { DeliveryNoteHeader } from "@/components/delivery-notes/DeliveryNoteHeader";
import { useDeliveryNotes } from "@/hooks/use-delivery-notes";

const DeliveryNotePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNote, setSelectedNote] = useState<DeliveryNote | null>(null);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>("");
  
  const { 
    deliveryNotes,
    isLoading,
    warehouses,
    handleDelete,
    handleApprove,
    handleEdit
  } = useDeliveryNotes();

  const filteredNotes = deliveryNotes?.filter(note => 
    note.delivery_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (note.purchase_order?.order_number || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <DeliveryNoteHeader 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Livraison</TableHead>
                <TableHead>N° Commande</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Fournisseur</TableHead>
                <TableHead>Articles</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Montant net</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <DeliveryNoteList
                deliveryNotes={filteredNotes || []}
                isLoading={isLoading}
                selectedWarehouseId={selectedWarehouseId}
                onWarehouseSelect={setSelectedWarehouseId}
                onApprove={handleApprove}
                onEdit={handleEdit}
                onPrint={setSelectedNote}
                onDelete={handleDelete}
                warehouses={warehouses}
              />
            </TableBody>
          </Table>
        </div>
      </div>

      <DeliveryNotePrintDialog
        note={selectedNote}
        onClose={() => setSelectedNote(null)}
      />
    </DashboardLayout>
  );
};

export default DeliveryNotePage;
