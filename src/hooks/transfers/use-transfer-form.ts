
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export type TransferFormData = {
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
};

export function useTransferForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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

  const createTransferMutation = useMutation({
    mutationFn: async (data: TransferFormData) => {
      // First, create the transfer header
      const { data: transfer, error } = await supabase
        .from("transfers")
        .insert({
          source_warehouse_id: data.source_warehouse_id,
          destination_warehouse_id: data.destination_warehouse_id,
          source_pos_id: data.source_pos_id,
          destination_pos_id: data.destination_pos_id,
          transfer_type: data.transfer_type,
          notes: data.notes,
          status: data.status,
          transfer_date: data.transfer_date,
          quantity: data.products.reduce((sum, product) => sum + product.quantity, 0), // Add quantity field
        })
        .select("id")
        .single();

      if (error) throw error;

      // Then create transfer items
      if (data.products.length > 0) {
        const { error: itemsError } = await supabase
          .from("transfer_items")
          .insert(
            data.products.map((product) => ({
              transfer_id: transfer.id,
              product_id: product.product_id,
              quantity: product.quantity,
            }))
          );

        if (itemsError) throw itemsError;
      }

      return transfer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
      toast({
        title: "Transfert créé",
        description: "Le transfert a été créé avec succès",
      });
      navigate("/transfers");
    },
    onError: (error) => {
      console.error("Error creating transfer:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer le transfert",
      });
    },
  });

  const updateTransferMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TransferFormData }) => {
      // Update transfer header
      const { error } = await supabase
        .from("transfers")
        .update({
          source_warehouse_id: data.source_warehouse_id,
          destination_warehouse_id: data.destination_warehouse_id,
          source_pos_id: data.source_pos_id,
          destination_pos_id: data.destination_pos_id,
          transfer_type: data.transfer_type as "depot_to_pos" | "pos_to_depot" | "depot_to_depot",
          notes: data.notes,
          status: data.status as "pending" | "completed" | "cancelled",
          transfer_date: data.transfer_date,
          quantity: data.products.reduce((sum, product) => sum + product.quantity, 0), // Add quantity field
        })
        .eq("id", id);

      if (error) throw error;

      // Delete existing items
      const { error: deleteError } = await supabase
        .from("transfer_items")
        .delete()
        .eq("transfer_id", id);

      if (deleteError) throw deleteError;

      // Insert new items
      if (data.products.length > 0) {
        const { error: itemsError } = await supabase
          .from("transfer_items")
          .insert(
            data.products.map((product) => ({
              transfer_id: id,
              product_id: product.product_id,
              quantity: product.quantity,
            }))
          );

        if (itemsError) throw itemsError;
      }

      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
      toast({
        title: "Transfert mis à jour",
        description: "Le transfert a été mis à jour avec succès",
      });
      navigate("/transfers");
    },
    onError: (error) => {
      console.error("Error updating transfer:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour le transfert",
      });
    },
  });

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

  const handleSourcePosChange = (posId: string) => {
    setFormState((prev) => ({
      ...prev,
      source_pos_id: posId,
    }));
  };

  const handleDestinationPosChange = (posId: string) => {
    setFormState((prev) => ({
      ...prev,
      destination_pos_id: posId,
    }));
  };

  const handleTransferTypeChange = (type: "depot_to_pos" | "pos_to_depot" | "depot_to_depot") => {
    setFormState((prev) => ({
      ...prev,
      transfer_type: type,
      // Reset IDs based on new type
      ...(type === "depot_to_pos"
        ? { destination_warehouse_id: "", source_pos_id: "" }
        : type === "pos_to_depot"
        ? { source_warehouse_id: "", destination_pos_id: "" }
        : { source_pos_id: "", destination_pos_id: "" }),
    }));
  };

  const handleNotesChange = (notes: string) => {
    setFormState((prev) => ({ ...prev, notes }));
  };

  const handleStatusChange = (status: "pending" | "completed" | "cancelled") => {
    setFormState((prev) => ({ ...prev, status }));
  };

  const handleTransferDateChange = (date: string) => {
    setFormState((prev) => ({ ...prev, transfer_date: date }));
  };

  const handleAddProduct = (product: {
    product_id: string;
    quantity: number;
    product_name?: string;
  }) => {
    setFormState((prev) => ({
      ...prev,
      products: [...prev.products, product],
    }));
  };

  const handleRemoveProduct = (index: number) => {
    setFormState((prev) => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateProductQuantity = (index: number, quantity: number) => {
    setFormState((prev) => {
      const updatedProducts = [...prev.products];
      updatedProducts[index] = { ...updatedProducts[index], quantity };
      return { ...prev, products: updatedProducts };
    });
  };

  const handleSubmit = async (event?: React.FormEvent) => {
    if (event) event.preventDefault();
    
    // Validate form
    if (!formState.transfer_date) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez sélectionner une date de transfert",
      });
      return;
    }

    if (formState.transfer_type === "depot_to_depot" && 
        (!formState.source_warehouse_id || !formState.destination_warehouse_id)) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez sélectionner les entrepôts source et destination",
      });
      return;
    }

    if (formState.transfer_type === "depot_to_pos" && 
        (!formState.source_warehouse_id || !formState.destination_pos_id)) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez sélectionner l'entrepôt source et le point de vente destination",
      });
      return;
    }

    if (formState.transfer_type === "pos_to_depot" && 
        (!formState.source_pos_id || !formState.destination_warehouse_id)) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez sélectionner le point de vente source et l'entrepôt destination",
      });
      return;
    }

    if (formState.products.length === 0) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez ajouter au moins un produit au transfert",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createTransferMutation.mutateAsync(formState);
    } catch (error) {
      console.error("Error submitting transfer:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (id: string, event?: React.FormEvent) => {
    if (event) event.preventDefault();
    
    setIsSubmitting(true);
    try {
      await updateTransferMutation.mutateAsync({ id, data: formState });
    } catch (error) {
      console.error("Error updating transfer:", error);
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

  return {
    formState,
    isSubmitting,
    handleSourceWarehouseChange,
    handleDestinationWarehouseChange,
    handleSourcePosChange,
    handleDestinationPosChange,
    handleTransferTypeChange,
    handleNotesChange,
    handleStatusChange,
    handleTransferDateChange,
    handleAddProduct,
    handleRemoveProduct,
    handleUpdateProductQuantity,
    handleSubmit,
    handleUpdate,
    resetForm,
    setExistingFormData,
  };
}
