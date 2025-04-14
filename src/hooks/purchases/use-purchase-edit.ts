
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function usePurchaseEdit(orderId?: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [deliveryStatus, setDeliveryStatus] = useState<'pending' | 'delivered'>('pending');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'partial' | 'paid'>('pending');
  const [formData, setFormData] = useState<any>({});

  // Fetch the purchase order 
  const { data: purchase, isLoading: isPurchaseLoading } = useQuery({
    queryKey: ['purchase', orderId],
    queryFn: async () => {
      if (!orderId) return null;

      const { data, error } = await supabase
        .from('purchase_orders')
        .select(`
          *,
          supplier:suppliers(*),
          items:purchase_order_items(
            id,
            product_id,
            quantity,
            unit_price,
            selling_price,
            total_price,
            product:product_id(id, name, reference)
          ),
          warehouse:warehouses(id, name)
        `)
        .eq('id', orderId)
        .single();

      if (error) {
        console.error("Error fetching purchase order:", error);
        toast.error(`Erreur: ${error.message}`);
        throw new Error(error.message);
      }

      console.log("Fetched purchase order:", data);
      return data;
    },
    enabled: !!orderId
  });

  // Set states when data is loaded
  useEffect(() => {
    if (purchase) {
      setDeliveryStatus(purchase.status as 'pending' | 'delivered');
      setPaymentStatus(purchase.payment_status as 'pending' | 'partial' | 'paid');
      setFormData({
        order_number: purchase.order_number,
        supplier_id: purchase.supplier_id,
        expected_delivery_date: purchase.expected_delivery_date,
        warehouse_id: purchase.warehouse_id,
        notes: purchase.notes,
        status: purchase.status,
        payment_status: purchase.payment_status,
        discount: purchase.discount,
        shipping_cost: purchase.shipping_cost,
        transit_cost: purchase.transit_cost,
        logistics_cost: purchase.logistics_cost,
        tax_rate: purchase.tax_rate
      });
    }
  }, [purchase]);

  // Handle form data changes
  const updateFormField = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle update of specific items
  const updateOrderItem = async (itemId: string, updates: any) => {
    if (!orderId) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('purchase_order_items')
        .update(updates)
        .eq('id', itemId);

      if (error) throw error;

      toast.success('Produit mis à jour avec succès');
      setIsLoading(false);
      return true;
    } catch (error: any) {
      toast.error(`Erreur: ${error.message}`);
      setIsLoading(false);
      return false;
    }
  };

  // Handle update
  const handleUpdate = async (data: any) => {
    if (!orderId) return;

    setIsLoading(true);
    try {
      // Update purchase order
      const { error } = await supabase
        .from('purchase_orders')
        .update(data)
        .eq('id', orderId);

      if (error) throw error;

      toast.success('Bon de commande mis à jour avec succès');
      setIsLoading(false);
      return true;
    } catch (error: any) {
      toast.error(`Erreur: ${error.message}`);
      setIsLoading(false);
      return false;
    }
  };

  // Save all form data
  const saveChanges = async () => {
    return handleUpdate(formData);
  };

  // Update status
  const updateStatus = async (status: string) => {
    try {
      if (status === 'pending' || status === 'delivered') {
        setDeliveryStatus(status as 'pending' | 'delivered');
        setFormData(prev => ({ ...prev, status }));
        await handleUpdate({ status });
      }
    } catch (error: any) {
      toast.error(`Erreur lors de la mise à jour du statut: ${error.message}`);
    }
  };

  // Update payment status
  const updatePaymentStatus = async (status: string) => {
    try {
      if (status === 'pending' || status === 'partial' || status === 'paid') {
        setPaymentStatus(status as 'pending' | 'partial' | 'paid');
        setFormData(prev => ({ ...prev, payment_status: status }));
        await handleUpdate({ payment_status: status });
      }
    } catch (error: any) {
      toast.error(`Erreur lors de la mise à jour du statut de paiement: ${error.message}`);
    }
  };

  return {
    purchase,
    formData,
    isLoading: isLoading || isPurchaseLoading,
    handleUpdate,
    updateFormField,
    updateOrderItem,
    saveChanges,
    deliveryStatus,
    paymentStatus,
    updateStatus,
    updatePaymentStatus
  };
}
