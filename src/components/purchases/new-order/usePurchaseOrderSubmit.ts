
import { FormEvent } from "react";
import { NavigateFunction } from "react-router-dom";
import { PurchaseOrderItem } from "@/types/purchase-order";
import { supabase } from "@/integrations/supabase/client";
import { toast as sonnerToast } from "sonner";

interface UsePurchaseOrderSubmitProps {
  supplier: string;
  orderNumber: string;
  deliveryDate: string;
  notes: string;
  orderStatus: "pending" | "delivered";
  paymentStatus: "pending" | "partial" | "paid";
  paidAmount: number;
  logisticsCost: number;
  transitCost: number;
  taxRate: number;
  shippingCost: number;
  discount: number;
  orderItems: PurchaseOrderItem[];
  setIsSubmitting: (value: boolean) => void;
  toast: any;
  navigate: NavigateFunction;
}

export const usePurchaseOrderSubmit = ({
  supplier,
  orderNumber,
  deliveryDate,
  notes,
  orderStatus,
  paymentStatus,
  paidAmount,
  logisticsCost,
  transitCost,
  taxRate,
  shippingCost,
  discount,
  orderItems,
  setIsSubmitting,
  toast,
  navigate
}: UsePurchaseOrderSubmitProps) => {

  // Calculate amounts
  const calculateSubtotal = () => {
    return orderItems.reduce((total, item) => total + (item.unit_price * item.quantity), 0);
  };

  const calculateTax = () => {
    return (calculateSubtotal() * taxRate) / 100;
  };

  const calculateTotalTTC = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax();
    return subtotal + tax + shippingCost + logisticsCost + transitCost - discount;
  };

  const calculateRemainingAmount = () => {
    return calculateTotalTTC() - paidAmount;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!supplier) {
      sonnerToast.error("Veuillez sélectionner un fournisseur");
      return;
    }

    setIsSubmitting(true);
    try {
      // Create the purchase order
      const { data: orderData, error: orderError } = await supabase
        .from('purchase_orders')
        .insert({
          supplier_id: supplier,
          order_number: orderNumber,
          expected_delivery_date: deliveryDate,
          notes,
          status: orderStatus,
          payment_status: paymentStatus,
          paid_amount: paidAmount,
          logistics_cost: logisticsCost,
          transit_cost: transitCost,
          tax_rate: taxRate,
          subtotal: calculateSubtotal(),
          tax_amount: calculateTax(),
          total_ttc: calculateTotalTTC(),
          shipping_cost: shippingCost,
          discount: discount,
          total_amount: calculateTotalTTC(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (orderError) throw orderError;
      
      // Add order items if there are any
      if (orderItems.length > 0 && orderData) {
        const orderItemsWithOrderId = orderItems.map(item => ({
          ...item,
          purchase_order_id: orderData.id
        }));
        
        const { error: itemsError } = await supabase
          .from('purchase_order_items')
          .insert(orderItemsWithOrderId);
        
        if (itemsError) throw itemsError;
      }
      
      sonnerToast.success("Bon de commande créé avec succès");
      navigate("/purchase-orders");
    } catch (error) {
      console.error("Erreur lors de la création du bon de commande:", error);
      sonnerToast.error("Une erreur est survenue lors de la création du bon de commande");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleSubmit,
    calculateSubtotal,
    calculateTax,
    calculateTotalTTC,
    calculateRemainingAmount,
    formatPrice
  };
};
