
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DeliveryNoteHeader } from "@/components/purchases/delivery-notes/DeliveryNoteHeader";
import { DeliveryNoteList } from "@/components/delivery-notes/DeliveryNoteList";
import { DeliveryNoteApprovalDialog } from "@/components/delivery-notes/DeliveryNoteApprovalDialog";
import { useDeliveryNotes } from "@/hooks/use-delivery-notes";
import { useDeliveryNoteMutations } from "@/hooks/delivery-notes/use-delivery-note-mutations";
import { isSelectQueryError } from "@/utils/supabase-safe-query";

export default function DeliveryNotesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNoteForApproval, setSelectedNoteForApproval] = useState<string | null>(null);
  
  const { 
    deliveryNotes, 
    isLoading,
    handleView,
    handleDelete 
  } = useDeliveryNotes();
  
  const { approveDeliveryNote } = useDeliveryNoteMutations();
  
  // Filter delivery notes based on search query
  const filteredDeliveryNotes = deliveryNotes.filter(note => {
    const deliveryNumber = note.delivery_number || '';
    const supplierName = isSelectQueryError(note.supplier) 
      ? '' 
      : (note.supplier?.name || '');
    
    return deliveryNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
           supplierName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleApprove = async (noteId: string) => {
    setSelectedNoteForApproval(noteId);
  };

  const handleApprovalSubmit = async (
    noteId: string, 
    warehouseId: string, 
    items: Array<{ id: string; quantity_received: number }>
  ) => {
    await approveDeliveryNote.mutateAsync({ noteId, warehouseId, items });
    setSelectedNoteForApproval(null);
  };

  const selectedNote = selectedNoteForApproval 
    ? deliveryNotes.find(note => note.id === selectedNoteForApproval)
    : null;

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <DeliveryNoteHeader 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <Card className="mt-6">
          <CardContent className="pt-6">
            <DeliveryNoteList 
              deliveryNotes={filteredDeliveryNotes}
              isLoading={isLoading}
              onView={handleView}
              onDelete={handleDelete}
              onApprove={handleApprove}
            />
          </CardContent>
        </Card>

        <DeliveryNoteApprovalDialog
          deliveryNote={selectedNote || null}
          open={!!selectedNoteForApproval}
          onClose={() => setSelectedNoteForApproval(null)}
          onApprove={handleApprovalSubmit}
        />
      </div>
    </DashboardLayout>
  );
}
