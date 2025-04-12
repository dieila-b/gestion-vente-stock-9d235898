
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { isSelectQueryError } from '@/utils/supabase-helpers';
import { safeClient, safeArray } from '@/utils/select-query-helper';

export function useEditOrder(orderId) {
  const [client, setClient] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);

  // Load order data
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            client:clients(*),
            items:order_items(
              *,
              product:catalog(*)
            )
          `)
          .eq('id', orderId)
          .single();
          
        if (error) throw error;
        
        // Process the order
        // Safely check if items is an array and not a SelectQueryError
        const items = safeArray(data.items, []);
        
        // Calculate totals from the actual items
        const orderTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const orderDiscount = data.discount || 0;
        const orderFinalTotal = orderTotal - orderDiscount;
        
        // Create safe client object
        const clientData = safeClient(data.client);
        
        setClient(clientData);
        setOrderItems(items);
        setTotal(orderTotal);
        setDiscount(orderDiscount);
        setFinalTotal(orderFinalTotal);
      } catch (err) {
        console.error("Error fetching order:", err);
        setError(err);
        toast.error("Erreur lors du chargement de la commande");
      } finally {
        setLoading(false);
      }
    };
    
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  // Update item quantity
  const updateItemQuantity = async (itemId, newQuantity) => {
    try {
      const item = orderItems.find(i => i.id === itemId);
      if (!item) return;
      
      const newTotal = item.price * newQuantity;
      
      // Update in database
      const { error } = await supabase
        .from('order_items')
        .update({ 
          quantity: newQuantity,
          total: newTotal
        })
        .eq('id', itemId);
        
      if (error) throw error;
      
      // Update in local state
      const updatedItems = orderItems.map(i => 
        i.id === itemId 
          ? {...i, quantity: newQuantity, total: newTotal} 
          : i
      );
      
      setOrderItems(updatedItems);
      
      // Recalculate totals
      const newOrderTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      setTotal(newOrderTotal);
      setFinalTotal(newOrderTotal - discount);
      
      toast.success("Quantité mise à jour");
    } catch (err) {
      console.error("Error updating quantity:", err);
      toast.error("Erreur lors de la mise à jour de la quantité");
    }
  };

  // Update order discount
  const updateDiscount = async (newDiscount) => {
    try {
      // Update in database
      const { error } = await supabase
        .from('orders')
        .update({ 
          discount: newDiscount,
          final_total: total - newDiscount
        })
        .eq('id', orderId);
        
      if (error) throw error;
      
      setDiscount(newDiscount);
      setFinalTotal(total - newDiscount);
      
      toast.success("Remise mise à jour");
    } catch (err) {
      console.error("Error updating discount:", err);
      toast.error("Erreur lors de la mise à jour de la remise");
    }
  };

  return {
    client,
    orderItems,
    loading,
    error,
    total,
    discount,
    finalTotal,
    updateItemQuantity,
    updateDiscount
  };
}
