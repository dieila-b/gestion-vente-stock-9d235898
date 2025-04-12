
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDeliveryNotes } from "@/hooks/use-delivery-notes";
import { DeliveryNoteList } from "@/components/delivery-notes/DeliveryNoteList";
import { DeliveryNoteFilters } from "@/components/delivery-notes/DeliveryNoteFilters";
import { useState } from "react";
import { DeliveryNote } from "@/types/delivery-note";

export default function DeliveryNotePage() {
  const navigate = useNavigate();
  const { 
    isLoading, 
    createDeliveryNote, 
    updateDeliveryNote, 
    handleDelete, 
    handleApprove, 
    handleEdit,
    deliveryNotes = [],
    warehouses = [],
  } = useDeliveryNotes();
  
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>("");

  // Filter notes based on search and status
  const filteredNotes = deliveryNotes.filter(note => {
    const matchesStatus = filterStatus === "all" || note.status === filterStatus;
    const matchesSearch = searchTerm === "" || 
      note.delivery_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.purchase_order.order_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  // Create wrapper that adapts the edit function to match the expected signature
  const handleEditWrapper = (id: string) => {
    handleEdit(id, {});
  };

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
          onEdit={handleEditWrapper}
          selectedWarehouseId={selectedWarehouseId}
          onWarehouseSelect={onWarehouseSelect}
          warehouses={warehouses}
        />
      </div>
    </div>
  );
}
