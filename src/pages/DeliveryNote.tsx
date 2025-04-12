
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDeliveryNotes } from "@/hooks/use-delivery-notes";
import { DeliveryNoteList } from "@/components/delivery-notes/DeliveryNoteList";
import { DeliveryNoteFilters } from "@/components/delivery-notes/DeliveryNoteFilters";
import { useState } from "react";
import { DeliveryNote } from "@/types/delivery-note";
import { isSelectQueryError } from "@/utils/supabase-safe-query";

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

  // Safely cast to DeliveryNote[] with default values for missing properties
  const safeDeliveryNotes: DeliveryNote[] = deliveryNotes.map(note => {
    // Create safe supplier object
    const supplierObj = isSelectQueryError(note.supplier) 
      ? { name: 'Unknown Supplier', phone: '', email: '' }
      : note.supplier || { name: 'Unknown Supplier', phone: '', email: '' };
    
    // Create safe purchase_order object
    const purchaseOrderObj = isSelectQueryError(note.purchase_order)
      ? { order_number: '', total_amount: 0 }
      : note.purchase_order || { order_number: '', total_amount: 0 };
    
    return {
      id: note.id,
      delivery_number: note.delivery_number || '',
      created_at: note.created_at || '',
      updated_at: note.updated_at || '',
      notes: note.notes || '',
      status: note.status || 'pending',
      supplier: {
        name: supplierObj.name || 'Unknown Supplier',
        phone: supplierObj.phone || '',
        email: supplierObj.email || ''
      },
      purchase_order: {
        order_number: purchaseOrderObj.order_number || '',
        total_amount: purchaseOrderObj.total_amount || 0
      },
      items: (note.items || []).map(item => {
        const safeProduct = isSelectQueryError(item.product) 
          ? { name: 'Unknown Product', reference: '', category: '' }
          : item.product || { name: 'Unknown Product', reference: '', category: '' };
          
        return {
          id: item.id || '',
          product_id: item.product_id || '',
          quantity_ordered: item.quantity_ordered || 0,
          quantity_received: item.quantity_received || 0,
          unit_price: item.unit_price || 0,
          product: {
            name: safeProduct.name || 'Unknown Product',
            reference: safeProduct.reference || '',
            category: safeProduct.category || ''
          }
        };
      })
    };
  });

  // Handle the status filter
  const filteredNotes = safeDeliveryNotes.filter(note => {
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
        />
      </div>
    </div>
  );
}
