
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function usePurchaseEdit(orderId?: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [deliveryStatus, setDeliveryStatus] = useState<'pending' | 'delivered'>('pending');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'partial' | 'paid'>('pending');
  const [formData, setFormData] = useState<any>({});
  const [orderItems, setOrderItems] = useState<any[]>([]);

  // Fetch the purchase order 
  const { data: purchase, isLoading: isPurchaseLoading, refetch } = useQuery({
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
      
      // Set order items
      if (purchase.items) {
        setOrderItems(purchase.items);
      }
    }
  }, [purchase]);

  // Handle form data changes
  const updateFormField = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Calculate the total items amount
  const calculateItemsTotal = (items: any[]) => {
    return items.reduce((total, item) => total + (Number(item.total_price) || 0), 0);
  };

  // Update the purchase order total based on item changes
  const updateOrderTotal = async (itemsTotal: number) => {
    if (!orderId || !purchase) return;
    
    try {
      // Calculate the new total amount
      const discount = Number(formData.discount) || 0;
      const shippingCost = Number(formData.shipping_cost) || 0;
      const transitCost = Number(formData.transit_cost) || 0;
      const logisticsCost = Number(formData.logistics_cost) || 0;
      
      // Calculate subtotal (items total - discount)
      const subtotal = Math.max(0, itemsTotal - discount);
      
      // Calculate tax amount
      const taxRate = Number(formData.tax_rate) || 0;
      const taxAmount = subtotal * (taxRate / 100);
      
      // Calculate total TTC (subtotal + tax)
      const totalTTC = subtotal + taxAmount;
      
      // Calculate total amount (total TTC + additional costs)
      const totalAmount = totalTTC + shippingCost + transitCost + logisticsCost;
      
      // Update the purchase order totals
      const { error } = await supabase
        .from('purchase_orders')
        .update({
          subtotal: subtotal,
          tax_amount: taxAmount,
          total_ttc: totalTTC,
          total_amount: totalAmount
        })
        .eq('id', orderId);
      
      if (error) throw error;
      
      // Refetch the purchase order to update the UI
      await refetch();
      
      return true;
    } catch (error: any) {
      toast.error(`Erreur lors de la mise à jour du total: ${error.message}`);
      return false;
    }
  };

  // Update order item quantity
  const updateItemQuantity = async (itemId: string, newQuantity: number) => {
    if (!orderId) return;
    
    setIsLoading(true);
    try {
      // First, get the current item to calculate new total price
      const itemToUpdate = orderItems.find(item => item.id === itemId);
      if (!itemToUpdate) {
        throw new Error("Item not found");
      }
      
      const newTotalPrice = newQuantity * itemToUpdate.unit_price;
      
      // Update the item in the database
      const { error } = await supabase
        .from('purchase_order_items')
        .update({ 
          quantity: newQuantity,
          total_price: newTotalPrice 
        })
        .eq('id', itemId);

      if (error) throw error;
      
      // Update local state
      const updatedItems = orderItems.map(item => 
        item.id === itemId 
          ? { ...item, quantity: newQuantity, total_price: newTotalPrice } 
          : item
      );
      
      setOrderItems(updatedItems);
      
      // Calculate new items total and update the order total
      const itemsTotal = calculateItemsTotal(updatedItems);
      await updateOrderTotal(itemsTotal);
      
      toast.success('Quantité mise à jour avec succès');
      setIsLoading(false);
      return true;
    } catch (error: any) {
      toast.error(`Erreur: ${error.message}`);
      setIsLoading(false);
      return false;
    }
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

      // Refetch the purchase order to get updated data
      await refetch();

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
    orderItems,
    isLoading: isLoading || isPurchaseLoading,
    handleUpdate,
    updateFormField,
    updateOrderItem,
    updateItemQuantity,
    saveChanges,
    deliveryStatus,
    paymentStatus,
    updateStatus,
    updatePaymentStatus
  };
}
