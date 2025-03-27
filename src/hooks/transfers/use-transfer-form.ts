
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Transfer } from "@/types/transfer";
import { transferFormSchema, TransferFormValues } from "@/components/transfers/schemas/transfer-form-schema";
import { useQueryClient } from "@tanstack/react-query";

export function useTransferForm() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState<Transfer | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferFormSchema),
    defaultValues: {
      source_warehouse_id: "",
      destination_warehouse_id: "",
      source_pos_id: "",
      destination_pos_id: "",
      transfer_type: "depot_to_pos",
      notes: "",
      status: "pending",
      transfer_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      product_id: "",
      quantity: 1,
    },
  });

  const onSubmit = async (values: TransferFormValues) => {
    try {
      console.log("Form values:", values);

      // Vérifier le stock disponible avant de créer le transfert
      let sourceStock;
      if (values.transfer_type === 'depot_to_pos' || values.transfer_type === 'depot_to_depot') {
        const { data: stockData, error } = await supabase
          .from('warehouse_stock')
          .select('quantity, unit_price')
          .eq('warehouse_id', values.source_warehouse_id)
          .eq('product_id', values.product_id)
          .maybeSingle();

        if (error) throw error;
        sourceStock = stockData;
        console.log("Source warehouse stock:", stockData);
      } else if (values.transfer_type === 'pos_to_depot') {
        const { data: stockData, error } = await supabase
          .from('warehouse_stock')
          .select('quantity, unit_price')
          .eq('pos_location_id', values.source_pos_id)
          .eq('product_id', values.product_id)
          .maybeSingle();

        if (error) throw error;
        sourceStock = stockData;
        console.log("Source POS stock:", stockData);
      }

      if (!sourceStock || sourceStock.quantity < values.quantity) {
        toast({
          title: "Stock insuffisant",
          description: `La quantité demandée n'est pas disponible dans le stock source. Stock disponible : ${sourceStock?.quantity || 0}`,
          variant: "destructive",
        });
        return;
      }

      // Pour un nouveau transfert
      if (!editingTransfer) {
        let transferData = {
          source_warehouse_id: values.transfer_type !== 'pos_to_depot' ? values.source_warehouse_id : null,
          destination_warehouse_id: (values.transfer_type === 'pos_to_depot' || values.transfer_type === 'depot_to_depot') ? values.destination_warehouse_id : null,
          source_pos_id: values.transfer_type === 'pos_to_depot' ? values.source_pos_id : null,
          destination_pos_id: values.transfer_type === 'depot_to_pos' ? values.destination_pos_id : null,
          transfer_type: values.transfer_type,
          notes: values.notes || null,
          status: "pending",
          transfer_date: values.transfer_date
        };

        console.log("Transfer data to insert:", transferData);

        // Créer le transfert
        const { data: newTransfer, error: transferError } = await supabase
          .from('stock_transfers')
          .insert(transferData)
          .select()
          .single();

        if (transferError) {
          console.error("Transfer creation error:", transferError);
          throw transferError;
        }

        console.log("Created transfer:", newTransfer);

        // Créer l'item de transfert
        const { error: itemError } = await supabase
          .from('stock_transfer_items')
          .insert({
            transfer_id: newTransfer.id,
            product_id: values.product_id,
            quantity: values.quantity
          });

        if (itemError) {
          await supabase
            .from('stock_transfers')
            .delete()
            .eq('id', newTransfer.id);
          
          console.error("Item creation error:", itemError);
          throw itemError;
        }

        // Mise à jour du statut en "completed"
        const { error: statusError } = await supabase
          .from('stock_transfers')
          .update({ status: 'completed' })
          .eq('id', newTransfer.id);

        if (statusError) {
          console.error("Status update error:", statusError);
          throw statusError;
        }

        toast({
          title: "Succès",
          description: "Le transfert a été créé avec succès",
        });

        queryClient.invalidateQueries({ queryKey: ['transfers'] });
        setIsDialogOpen(false);
        form.reset();
      } else {
        // Pour la modification d'un transfert existant
        const { error: transferError } = await supabase
          .from('stock_transfers')
          .update({
            source_warehouse_id: values.source_warehouse_id || null,
            destination_warehouse_id: values.destination_warehouse_id || null,
            source_pos_id: values.source_pos_id || null,
            destination_pos_id: values.destination_pos_id || null,
            transfer_type: values.transfer_type,
            notes: values.notes || null,
            status: values.status,
            transfer_date: values.transfer_date,
          })
          .eq('id', editingTransfer.id);

        if (transferError) throw transferError;

        const { error: itemError } = await supabase
          .from('stock_transfer_items')
          .update({
            quantity: values.quantity
          })
          .eq('transfer_id', editingTransfer.id)
          .eq('product_id', values.product_id);

        if (itemError) throw itemError;

        toast({
          title: "Transfert modifié avec succès",
          description: "Les modifications ont été enregistrées.",
        });

        queryClient.invalidateQueries({ queryKey: ['transfers'] });
        setIsDialogOpen(false);
      }
    } catch (error: any) {
      console.error('Error in transfer operation:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'opération.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (transfer: Transfer) => {
    setEditingTransfer(transfer);
    
    const { data: items } = await supabase
      .from('stock_transfer_items')
      .select('*')
      .eq('transfer_id', transfer.id);

    const firstItem = items?.[0];

    form.reset({
      source_warehouse_id: transfer.source_warehouse_id || "",
      destination_warehouse_id: transfer.destination_warehouse_id || "",
      source_pos_id: transfer.source_pos_id || "",
      destination_pos_id: transfer.destination_pos_id || "",
      transfer_type: transfer.transfer_type || "depot_to_pos",
      notes: transfer.notes || "",
      status: transfer.status,
      transfer_date: format(new Date(transfer.transfer_date), "yyyy-MM-dd'T'HH:mm"),
      product_id: firstItem?.product_id || "",
      quantity: firstItem?.quantity || 1,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (transferId: string) => {
    try {
      const { error } = await supabase
        .from('stock_transfers')
        .delete()
        .eq('id', transferId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      toast({
        title: "Transfert supprimé",
        description: "Le transfert a été supprimée avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression.",
        variant: "destructive",
      });
    }
  };

  return {
    form,
    isDialogOpen,
    setIsDialogOpen,
    editingTransfer,
    setEditingTransfer,
    onSubmit,
    handleEdit,
    handleDelete
  };
}
