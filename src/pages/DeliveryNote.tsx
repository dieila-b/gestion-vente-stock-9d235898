
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDeliveryNotes } from "@/hooks/use-delivery-notes";
import { DeliveryNoteList } from "@/components/delivery-notes/DeliveryNoteList";
import { DeliveryNoteFilters } from "@/components/delivery-notes/DeliveryNoteFilters";
import { useState } from "react";
import { DeliveryNote } from "@/types/delivery-note";
import { safeSupplier, safePurchaseOrder } from "@/utils/type-utils";

export default function DeliveryNotePage() {
  const navigate = useNavigate();
  const { 
    isLoading, 
    createDeliveryNote, 
    updateDeliveryNote, 
    deleteDeliveryNote, 
    deliveryNotes = [],
    warehouses = [],
  } = useDeliveryNotes();
  
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>("");

  // Use handleDelete and handleApprove functions
  const handleDelete = (id: string) => {
    return deleteDeliveryNote.mutateAsync(id);
  };

  // Implementation of handleApprove function
  const handleApprove = async (id: string, warehouseId: string, items: Array<{ id: string; quantity_received: number; }>) => {
    try {
      const { error } = await updateDeliveryNote.mutateAsync({
        id,
        data: { status: 'approved' }
      });
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error approving delivery note:", error);
      return false;
    }
  };

  // Implementation of handleEdit function
  const handleEdit = (id: string) => {
    navigate(`/delivery-notes/edit/${id}`);
  };

  // Filter notes based on search and status
  const filteredNotes = deliveryNotes.map(note => {
    // Safely handle potentially undefined properties
    const supplier = safeSupplier(note.supplier);
    const purchaseOrder = safePurchaseOrder(note.purchase_order);
    
    return {
      ...note,
      supplier: {
        name: supplier.name || 'Unknown Supplier',
        phone: supplier.phone || '',
        email: supplier.email || ''
      },
      purchase_order: {
        order_number: purchaseOrder.order_number || '',
        total_amount: purchaseOrder.total_amount || 0
      }
    };
  }).filter(note => {
    const matchesStatus = filterStatus === "all" || note.status === filterStatus;
    
    // Safe access to nested properties
    const matchesSearch = searchTerm === "" || 
      note.delivery_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.purchase_order.order_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  }) as DeliveryNote[];

  const onWarehouseSelect = (id: string) => {
    setSelectedWarehouseId(id);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Bons de Livraison</h1>
        <Button onClick={() => navigate("/delivery-notes/new")}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Nouveau Bon de Livraison
        </Button>
      </div>

      <DeliveryNoteFilters
        statusFilter={filterStatus}
        setStatusFilter={setFilterStatus}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <div className="mt-6">
        <DeliveryNoteList
          deliveryNotes={filteredNotes}
          isLoading={isLoading}
          onDelete={handleDelete}
          onApprove={handleApprove}
          onEdit={handleEdit}
          selectedWarehouseId={selectedWarehouseId}
          onWarehouseSelect={onWarehouseSelect}
          warehouses={warehouses}
        />
      </div>
    </div>
  );
}
