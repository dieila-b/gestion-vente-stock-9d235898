
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { db } from "@/utils/db-adapter";
import { useToast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from 'uuid';

export type TransferFormData = {
  from_warehouse_id: string;
  to_warehouse_id: string;
  product_id: string;
  quantity: number;
  transfer_date?: string;
};

export function useTransferForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultFormState: TransferFormData = {
    from_warehouse_id: "",
    to_warehouse_id: "",
    product_id: "",
    quantity: 1,
    transfer_date: new Date().toISOString().split("T")[0],
  };

  const [formState, setFormState] = useState<TransferFormData>(defaultFormState);

  const createTransferMutation = useMutation({
    mutationFn: async (data: TransferFormData) => {
      console.log("Creating transfer with data:", data);
      
      // Generate a reference
      const transferRef = `TR-${new Date().toISOString().slice(0,10).replace(/-/g, '')}-${Math.floor(Math.random() * 1000)}`;
      
      // Create the transfer
      const transfer = await db.insert(
        'stock_transfers',
        {
          from_warehouse_id: data.from_warehouse_id,
          to_warehouse_id: data.to_warehouse_id,
          product_id: data.product_id,
          quantity: data.quantity,
          created_at: new Date().toISOString(),
        }
      );

      if (!transfer) throw new Error("Failed to create transfer");
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
      // Update transfer
      const updated = await db.update(
        'stock_transfers',
        {
          from_warehouse_id: data.from_warehouse_id,
          to_warehouse_id: data.to_warehouse_id,
          product_id: data.product_id,
          quantity: data.quantity,
        },
        'id',
        id
      );

      if (!updated) throw new Error("Failed to update transfer");
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
      from_warehouse_id: warehouseId,
    }));
  };

  const handleDestinationWarehouseChange = (warehouseId: string) => {
    setFormState((prev) => ({
      ...prev,
      to_warehouse_id: warehouseId,
    }));
  };

  const handleProductChange = (productId: string) => {
    setFormState((prev) => ({
      ...prev,
      product_id: productId,
    }));
  };

  const handleQuantityChange = (quantity: number) => {
    setFormState((prev) => ({
      ...prev,
      quantity: quantity,
    }));
  };

  const handleSubmit = async (event?: React.FormEvent) => {
    if (event) event.preventDefault();
    
    // Validate form
    if (!formState.from_warehouse_id) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez sélectionner un entrepôt source",
      });
      return;
    }

    if (!formState.to_warehouse_id) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez sélectionner un entrepôt destination",
      });
      return;
    }
    
    if (formState.from_warehouse_id === formState.to_warehouse_id) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Les entrepôts source et destination doivent être différents",
      });
      return;
    }

    if (!formState.product_id) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez sélectionner un produit",
      });
      return;
    }

    if (formState.quantity <= 0) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "La quantité doit être supérieure à 0",
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
      from_warehouse_id: data.from_warehouse_id || "",
      to_warehouse_id: data.to_warehouse_id || "",
      product_id: data.product_id || "",
      quantity: data.quantity || 1,
      transfer_date: data.transfer_date ? 
        new Date(data.transfer_date).toISOString().split("T")[0] : 
        new Date().toISOString().split("T")[0],
    });
  };

  return {
    formState,
    isSubmitting,
    handleSourceWarehouseChange,
    handleDestinationWarehouseChange,
    handleProductChange,
    handleQuantityChange,
    handleSubmit,
    handleUpdate,
    resetForm,
    setExistingFormData,
  };
}
