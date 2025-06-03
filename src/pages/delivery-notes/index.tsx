
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DeliveryNoteHeader } from "@/components/purchases/delivery-notes/DeliveryNoteHeader";
import { DeliveryNoteList } from "@/components/delivery-notes/DeliveryNoteList";
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
  const filteredDeliveryNotes = (deliveryNotes || []).filter(note => {
    if (!note) return false;
    
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
      <div className="h-full w-full flex flex-col p-0 m-0">
        <div className="flex-shrink-0 p-6 pb-0">
          <DeliveryNoteHeader 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        <div className="flex-1 p-6 pt-6 overflow-hidden">
          <Card className="h-full flex flex-col">
            <CardContent className="flex-1 pt-6 p-6 overflow-hidden">
              <div className="h-full">
                <DeliveryNoteList 
                  deliveryNotes={filteredDeliveryNotes}
                  isLoading={isLoading}
                  onView={handleView}
                  onEdit={handleEdit}
                  onApprove={handleApprove}
                  onPrint={handlePrint}
                  onDelete={handleDelete}
                />
              </div>
            </CardContent>
          </Card>
        </div>

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
