
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { safeGet, safeSupplier, safeArray } from "@/utils/select-query-helper";

export const usePurchaseEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [purchaseOrder, setPurchaseOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totals, setTotals] = useState({
    subtotal: 0,
    tax: 0,
    total: 0,
  });

  // Fetch purchase order
  const { data: purchaseOrderData, isLoading } = useQuery({
    queryKey: ["purchase-order", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("purchase_orders")
        .select(`
          *,
          supplier:supplier_id (*),
          warehouse:warehouse_id (*),
          items:purchase_order_items (*)
        `)
        .eq("id", id)
        .single();

      if (error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger la commande",
        });
        throw error;
      }

      return data;
    },
    meta: {
      onSuccess: (data: any) => {
        // Process purchase order
        const supplier = safeSupplier(data.supplier);
        
        const processedOrder = {
          id: data.id,
          supplier_id: data.supplier_id,
          order_number: data.order_number,
          expected_delivery_date: data.expected_delivery_date,
          warehouse_id: data.warehouse_id,
          notes: data.notes,
          status: data.status,
          total_amount: data.total_amount,
          payment_status: data.payment_status,
          paid_amount: data.paid_amount,
          subtotal: data.subtotal,
          tax_rate: data.tax_rate,
          tax_amount: data.tax_amount,
          discount: data.discount,
          transit_cost: data.transit_cost,
          shipping_cost: data.shipping_cost,
          logistics_cost: data.logistics_cost,
          total_ttc: data.total_ttc,
          created_at: data.created_at,
          updated_at: data.updated_at,
          supplier: {
            id: supplier.id,
            name: supplier.name,
            phone: supplier.phone,
            email: supplier.email
          },
          items: safeArray(data.items),
          deleted: false
        };

        setPurchaseOrder(processedOrder);
        setItems(safeArray(data.items));
        
        // Calculate totals
        const subtotal = processedOrder.subtotal || 0;
        const taxAmount = processedOrder.tax_amount || 0;
        const total = processedOrder.total_amount || 0;
        
        setTotals({
          subtotal,
          tax: taxAmount,
          total,
        });
      }
    }
  });

  const updatePurchaseOrderMutation = useMutation({
    mutationFn: async (purchaseOrderData: any) => {
      const { data, error } = await supabase
        .from("purchase_orders")
        .update({
          supplier_id: purchaseOrderData.supplier_id,
          order_number: purchaseOrderData.order_number,
          expected_delivery_date: purchaseOrderData.expected_delivery_date,
          warehouse_id: purchaseOrderData.warehouse_id,
          notes: purchaseOrderData.notes,
          status: purchaseOrderData.status,
          total_amount: purchaseOrderData.total_amount,
          payment_status: purchaseOrderData.payment_status,
          paid_amount: purchaseOrderData.paid_amount,
          subtotal: purchaseOrderData.subtotal,
          tax_rate: purchaseOrderData.tax_rate,
          tax_amount: purchaseOrderData.tax_amount,
          discount: purchaseOrderData.discount,
          transit_cost: purchaseOrderData.transit_cost,
          shipping_cost: purchaseOrderData.shipping_cost,
          logistics_cost: purchaseOrderData.logistics_cost,
          total_ttc: purchaseOrderData.total_ttc,
        })
        .eq("id", purchaseOrderData.id);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-order", id] });
      toast({
        title: "Commande mise à jour",
        description: "La commande a été mise à jour avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour la commande"
      });
    }
  });

  const updatePurchaseOrderItems = async (items: any[]) => {
    try {
      // Delete all items
      await supabase
        .from("purchase_order_items")
        .delete()
        .eq("purchase_order_id", id);

      // Insert new items
      const { error } = await supabase
        .from("purchase_order_items")
        .insert(
          items.map((item) => ({
            purchase_order_id: id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            selling_price: item.selling_price,
            total_price: item.total_price
          }))
        );

      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error("Error updating purchase order items", error);
      return false;
    }
  };

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);

    try {
      // Update purchase order
      await updatePurchaseOrderMutation.mutateAsync({
        ...purchaseOrder,
        ...values,
      });

      // Update items
      await updatePurchaseOrderItems(items);

      navigate("/purchase-orders");
    } catch (error) {
      console.error("Error updating purchase order", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddItem = (item: any) => {
    setItems([...items, item]);
  };

  const handleUpdateItem = (index: number, item: any) => {
    const updatedItems = [...items];
    updatedItems[index] = item;
    setItems(updatedItems);
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((acc, item) => acc + (item.total_price || 0), 0);
    const taxRate = purchaseOrder?.tax_rate || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;

    setTotals({
      subtotal,
      tax: taxAmount,
      total,
    });
  };

  useEffect(() => {
    if (items.length > 0) {
      calculateTotals();
    }
  }, [items]);

  return {
    purchaseOrder,
    items,
    isLoading,
    isSubmitting,
    totals,
    handleSubmit,
    handleAddItem,
    handleUpdateItem,
    handleRemoveItem,
  };
};
