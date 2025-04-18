
import { FormEvent } from "react";
import { NavigateFunction } from "react-router-dom";
import { PurchaseOrderItem } from "@/types/purchase-order";
import { toast as sonnerToast } from "sonner";
import { db } from "@/utils/db-core";
import { useCreatePurchaseOrder } from "@/hooks/purchase-orders/mutations/use-create-purchase-order";

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
  // Use our custom mutation hook
  const createPurchaseOrderMutation = useCreatePurchaseOrder();

  const calculateSubtotal = () => {
    return orderItems.reduce((total, item) => {
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
      console.log("Création du bon de commande avec les données:", {
        supplier_id: supplier,
        order_number: orderNumber,
        items_count: orderItems.length,
      });

      // Préparer les données de commande
      const orderData = {
        supplier_id: supplier,
        order_number: orderNumber || `BC-${new Date().toISOString().split('T')[0]}-${Math.floor(Math.random() * 1000)}`,
        expected_delivery_date: deliveryDate ? deliveryDate : new Date().toISOString(),
        notes,
        status: orderStatus,
        payment_status: paymentStatus,
        paid_amount: paidAmount || 0,
        logistics_cost: logisticsCost || 0,
        transit_cost: transitCost || 0,
        tax_rate: taxRate || 0,
        subtotal: calculateSubtotal(),
        tax_amount: calculateTax(),
        total_ttc: calculateTotalTTC(),
        shipping_cost: shippingCost || 0,
        discount: discount || 0,
        total_amount: calculateTotalTTC()
      };
      
      try {
        // Use the mutation to create the purchase order
        const result = await createPurchaseOrderMutation.mutateAsync(orderData);
        
        console.log("Purchase order creation result:", result);
        
        if (result && result.id && orderItems.length > 0) {
          // Extract the created purchase order ID
          const purchaseOrderId = result.id;
          
          // Prepare the order items
          const validOrderItems = orderItems
            .filter(item => item.quantity > 0)
            .map(item => ({
              purchase_order_id: purchaseOrderId,
              product_id: item.product_id,
              quantity: item.quantity,
              unit_price: item.unit_price,
              selling_price: item.selling_price || 0,
              total_price: item.unit_price * item.quantity,
              product_code: item.product_code || '',
              designation: item.designation || (item.product?.name || 'Produit sans nom')
            }));
          
          if (validOrderItems.length > 0) {
            console.log("Adding items to order:", validOrderItems);
            
            // Use the db utility to insert items
            const itemsResult = await db.insert('purchase_order_items', validOrderItems);
                
            if (!itemsResult) {
              console.error("Error adding items");
              sonnerToast.error("Bon de commande créé mais erreur lors de l'ajout des articles");
            }
          }
          
          sonnerToast.success("Bon de commande créé avec succès");
          navigate("/purchase-orders");
        } else {
          throw new Error("Failed to create purchase order - no result returned");
        }
      } catch (error: any) {
        console.error("Mutation error:", error);
        throw error;
      }
    } catch (error: any) {
      console.error("Error creating purchase order:", error);
      sonnerToast.error(`Une erreur est survenue: ${error.message || "Erreur inconnue"}`);
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
