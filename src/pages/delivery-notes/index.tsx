
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DeliveryNoteHeader } from "@/components/purchases/delivery-notes/DeliveryNoteHeader";
import { DeliveryNoteList } from "@/components/purchases/delivery-notes/DeliveryNoteList";
import { DeliveryNoteApprovalDialog } from "@/components/delivery-notes/approval";
import { useDeliveryNotes } from "@/hooks/use-delivery-notes";

export default function DeliveryNotesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { 
    deliveryNotes, 
    isLoading,
    handleView,
    handleEdit,
    handleApprove,
    handlePrint,
    handleDelete,
    selectedNoteForApproval,
    closeApprovalDialog,
    onApprovalComplete
  } = useDeliveryNotes();

  console.log("DeliveryNotesPage - deliveryNotes:", deliveryNotes);
  console.log("DeliveryNotesPage - isLoading:", isLoading);
  console.log("DeliveryNotesPage - deliveryNotes count:", deliveryNotes?.length || 0);
  
  // Filter delivery notes based on search query
  const filteredDeliveryNotes = deliveryNotes.filter(note => {
    const deliveryNumber = note.delivery_number || '';
    const supplierName = note.supplier?.name || '';
    
    const searchLower = searchQuery.toLowerCase();
    return deliveryNumber.toLowerCase().includes(searchLower) ||
           supplierName.toLowerCase().includes(searchLower);
  });

  console.log("DeliveryNotesPage - filteredDeliveryNotes:", filteredDeliveryNotes);
  console.log("DeliveryNotesPage - filteredDeliveryNotes count:", filteredDeliveryNotes.length);

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
              onEdit={handleEdit}
              onApprove={handleApprove}
              onPrint={handlePrint}
              onDelete={handleDelete}
            />
          </CardContent>
        </Card>

        <DeliveryNoteApprovalDialog
          note={selectedNoteForApproval}
          open={!!selectedNoteForApproval}
          onClose={closeApprovalDialog}
          onApprovalComplete={onApprovalComplete}
        />
      </div>
    </DashboardLayout>
  );
}
