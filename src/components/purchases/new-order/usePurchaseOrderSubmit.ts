
import { FormEvent } from "react";
import { NavigateFunction } from "react-router-dom";
import { PurchaseOrderItem } from "@/types/purchase-order";
import { toast as sonnerToast } from "sonner";
import { db } from "@/utils/db-adapter";

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
    return orderItems.reduce((total, item) => {
      // Only include items with quantity > 0
      return total + (item.unit_price * (item.quantity > 0 ? item.quantity : 1));
    }, 0);
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
      // Create the purchase order using db adapter instead of direct Supabase query
      const orderData = {
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
      };
      
      const createdOrder = await db.insert('purchase_orders', orderData);
      
      if (!createdOrder) {
        throw new Error("Failed to create purchase order");
      }
      
      // Add order items if there are any
      if (orderItems.length > 0 && createdOrder) {
        // Make sure we only proceed with items that have a quantity > 0
        const validOrderItems = orderItems
          .filter(item => item.quantity > 0)
          .map(item => ({
            purchase_order_id: createdOrder.id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            selling_price: item.selling_price || 0,
            total_price: item.total_price
          }));
        
        if (validOrderItems.length > 0) {
          const itemsResult = await db.insert('purchase_order_items', validOrderItems);
          
          if (!itemsResult) {
            console.error("Failed to add order items");
            throw new Error("Failed to add order items");
          }
        }
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
