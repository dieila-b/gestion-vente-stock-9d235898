
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DeliveryNoteHeader } from "@/components/purchases/delivery-notes/DeliveryNoteHeader";
import { DeliveryNoteList } from "@/components/purchases/delivery-notes/DeliveryNoteList";
import { DeliveryNoteApprovalDialog } from "@/components/delivery-notes/approval";
import { useDeliveryNotes } from "@/hooks/use-delivery-notes";
import { isSelectQueryError, safeSupplier } from "@/utils/supabase-safe-query";

export default function DeliveryNotesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { 
    deliveryNotes, 
    isLoading,
    error,
    handleView,
    handleEdit,
    handleApprove,
    handlePrint,
    handleDelete,
    selectedNoteForApproval,
    closeApprovalDialog,
    onApprovalComplete
  } = useDeliveryNotes();
  
  console.log("🌐 DeliveryNotesPage render:", {
    deliveryNotesCount: deliveryNotes?.length || 0,
    isLoading,
    error: error?.message || null
  });

  // Show error state if there's an error
  if (error) {
    console.error("❌ Error in DeliveryNotesPage:", error);
    return (
      <DashboardLayout>
        <div className="container mx-auto p-6">
          <Card className="mt-6">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-red-500 mb-4">
                  Erreur lors du chargement des bons de livraison: {error.message}
                </p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Recharger la page
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }
  
  // Filter delivery notes based on search query
  const filteredDeliveryNotes = (deliveryNotes || []).filter(note => {
    // Safely access properties to handle SelectQueryError
    const deliveryNumber = note?.delivery_number || '';
    const supplierName = isSelectQueryError(note?.supplier) 
      ? '' 
      : (note?.supplier?.name || '');
    
    return deliveryNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
           supplierName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  console.log("🔍 Filtered delivery notes:", {
    originalCount: deliveryNotes?.length || 0,
    filteredCount: filteredDeliveryNotes?.length || 0,
    searchQuery
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
