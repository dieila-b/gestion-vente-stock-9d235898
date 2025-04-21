import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DeliveryNoteHeader } from "@/components/purchases/delivery-notes/DeliveryNoteHeader";
import { DeliveryNoteList } from "@/components/purchases/delivery-notes/DeliveryNoteList";
import { useDeliveryNotes } from "@/hooks/use-delivery-notes";
import { isSelectQueryError, safeSupplier } from "@/utils/supabase-safe-query";

export default function DeliveryNotesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { 
    deliveryNotes, 
    isLoading,
    handleView,
    handleDelete 
  } = useDeliveryNotes();
  
  // Filter delivery notes based on search query
  const filteredDeliveryNotes = deliveryNotes.filter(note => {
    // Safely access properties to handle SelectQueryError
    const deliveryNumber = note.delivery_number || '';
    const supplierName = isSelectQueryError(note.supplier) 
      ? '' 
      : (note.supplier?.name || '');
    
    return deliveryNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
           supplierName.toLowerCase().includes(searchQuery.toLowerCase());
  });

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
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
