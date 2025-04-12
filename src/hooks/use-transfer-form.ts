
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

export interface TransferFormData {
  source_warehouse_id: string;
  destination_warehouse_id: string;
  source_pos_id: string;
  destination_pos_id: string;
  transfer_type: "depot_to_pos" | "pos_to_depot" | "depot_to_depot";
  notes: string;
  status: "pending" | "completed" | "cancelled";
  transfer_date: string;
  products: {
    product_id: string;
    quantity: number;
    product_name?: string;
  }[];
}

export function useTransferForm(refetch: () => Promise<any>) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultFormState: TransferFormData = {
    source_warehouse_id: "",
    destination_warehouse_id: "",
    source_pos_id: "",
    destination_pos_id: "",
    transfer_type: "depot_to_depot",
    notes: "",
    status: "pending",
    transfer_date: new Date().toISOString().split("T")[0],
    products: [],
  };

  const [formState, setFormState] = useState<TransferFormData>(defaultFormState);

  const handleSourceWarehouseChange = (warehouseId: string) => {
    setFormState((prev) => ({
      ...prev,
      source_warehouse_id: warehouseId,
    }));
  };

  const handleDestinationWarehouseChange = (warehouseId: string) => {
    setFormState((prev) => ({
      ...prev,
      destination_warehouse_id: warehouseId,
    }));
  };

  const handleProductSelect = (product: any) => {
    setFormState((prev) => ({
      ...prev,
      products: [...prev.products, {
        product_id: product.id,
        quantity: 1,
        product_name: product.name
      }],
    }));
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    setFormState((prev) => {
      const updatedProducts = [...prev.products];
      updatedProducts[index] = { ...updatedProducts[index], quantity };
      return { ...prev, products: updatedProducts };
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formState.source_warehouse_id || !formState.destination_warehouse_id) {
      toast({
        title: "Error",
        description: "Please select both source and destination warehouses",
        variant: "destructive",
      });
      return;
    }

    if (formState.products.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one product to transfer",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Mock implementation - in a real app this would call an API
      console.log("Submitting transfer data:", formState);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      // Refresh the transfers list
      await refetch();
      
      toast({
        title: "Success",
        description: editingTransfer 
          ? "Transfer updated successfully" 
          : "Transfer created successfully",
      });
      
      // Reset form and close dialog
      resetForm();
      setIsDialogOpen(false);
      setEditingTransfer(null);
    } catch (error) {
      console.error("Error submitting transfer:", error);
      toast({
        title: "Error",
        description: "Failed to save transfer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormState(defaultFormState);
  };

  const setExistingFormData = (data: any) => {
    setFormState({
      source_warehouse_id: data.source_warehouse_id || "",
      destination_warehouse_id: data.destination_warehouse_id || "",
      source_pos_id: data.source_pos_id || "",
      destination_pos_id: data.destination_pos_id || "",
      transfer_type: data.transfer_type as "depot_to_pos" | "pos_to_depot" | "depot_to_depot",
      notes: data.notes || "",
      status: data.status as "pending" | "completed" | "cancelled",
      transfer_date: data.transfer_date ? 
        new Date(data.transfer_date).toISOString().split("T")[0] : 
        new Date().toISOString().split("T")[0],
      products: data.items?.map((item: any) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        product_name: item.product?.name
      })) || [],
    });
  };

  const handleEdit = async (id: string, fetchTransferById: (id: string) => Promise<any>) => {
    const transfer = await fetchTransferById(id);
    if (transfer) {
      setExistingFormData(transfer);
      setEditingTransfer(transfer);
      setIsDialogOpen(true);
    }
  };

  const handleDelete = async (id: string, deleteTransfer: (id: string) => Promise<any>) => {
    if (window.confirm('Are you sure you want to delete this transfer?')) {
      await deleteTransfer(id);
    }
  };

  return {
    formState,
    isSubmitting,
    isDialogOpen,
    setIsDialogOpen,
    editingTransfer,
    setEditingTransfer,
    handleSourceWarehouseChange,
    handleDestinationWarehouseChange,
    handleProductSelect,
    handleQuantityChange,
    handleFormSubmit,
    resetForm,
    setExistingFormData,
    handleEdit,
    handleDelete,
  };
}
