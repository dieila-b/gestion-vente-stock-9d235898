
import { useFetchDeliveryNotes } from "./delivery-notes/use-fetch-delivery-notes";
import { useDeliveryNoteActions } from "./delivery-notes/use-delivery-note-actions";
import { useDeliveryNoteApproval } from "./delivery-notes/use-delivery-note-approval";
import { useDeliveryNoteMutations } from "./delivery-notes/use-delivery-note-mutations";
import { useDeliveryNoteCreation } from "./delivery-notes/use-delivery-note-creation";
import { useDeliveryNoteSync } from "./delivery-notes/use-delivery-note-sync";

export function useDeliveryNotes() {
  console.log("🚀 useDeliveryNotes hook initialized");
  
  // Query to fetch delivery notes using the updated hook
  const { data: deliveryNotes = [], isLoading, error, refetch } = useFetchDeliveryNotes();
  
  console.log("📊 useDeliveryNotes state:", {
    deliveryNotesCount: deliveryNotes?.length || 0,
    isLoading,
    error: error?.message || null
  });

  // Actions
  const { handleView, handleEdit, handlePrint } = useDeliveryNoteActions();
  
  // Approval handling
  const { 
    selectedNoteForApproval, 
    handleApprove, 
    closeApprovalDialog, 
    onApprovalComplete 
  } = useDeliveryNoteApproval();
  
  // Mutations
  const { handleDelete } = useDeliveryNoteMutations();
  
  // Creation
  const { createDeliveryNoteFromPO } = useDeliveryNoteCreation();
  
  // Sync
  const { syncFromApprovedOrders } = useDeliveryNoteSync();

  return {
    deliveryNotes,
    isLoading,
    error,
    handleView,
    handleEdit,
    handleApprove: (id: string) => handleApprove(id, deliveryNotes),
    handlePrint: (id: string) => handlePrint(id, deliveryNotes),
    handleDelete,
    selectedNoteForApproval,
    closeApprovalDialog,
    onApprovalComplete: () => onApprovalComplete(refetch),
    createDeliveryNoteFromPO,
    syncFromApprovedOrders: () => syncFromApprovedOrders(refetch),
    refetch
  };
}
