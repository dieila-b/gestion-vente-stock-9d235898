
import { FormEvent } from "react";
import { NavigateFunction } from "react-router-dom";
import { PurchaseOrderItem } from "@/types/purchase-order";
import { toast as sonnerToast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
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

  // Utiliser notre hook personnalisé qui gère la création de commandes
  const { createPurchaseOrder } = useCreatePurchaseOrder();

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
      console.log("Creating purchase order with data:", {
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
        total_amount: calculateTotalTTC(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Utiliser notre hook de création qui contourne les problèmes de RLS
      const createdOrder = await createPurchaseOrder(orderData);
      
      if (!createdOrder) {
        throw new Error("Échec de création du bon de commande");
      }
      
      console.log("Purchase order created successfully:", createdOrder);
      
      // Process order items if purchase order was created successfully
      if (orderItems.length > 0 && createdOrder) {
        const validOrderItems = orderItems
          .filter(item => item.quantity > 0)
          .map(item => ({
            purchase_order_id: createdOrder.id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            selling_price: item.selling_price || 0,
            total_price: item.unit_price * item.quantity,
            product_code: item.product_code || '',
            designation: item.designation || (item.product?.name || 'Produit sans nom')
          }));
        
        if (validOrderItems.length > 0) {
          console.log("Adding order items:", validOrderItems);
          
          try {
            // Utiliser directement tableQuery au lieu de .from pour plus de contrôle
            const { error: itemsError } = await db.table('purchase_order_items')
              .insert(validOrderItems);
            
            if (itemsError) {
              console.error("Error adding order items:", itemsError);
              sonnerToast.error("Bon de commande créé mais erreur lors de l'ajout des articles");
            } else {
              console.log("Order items added successfully");
            }
          } catch (itemsInsertError) {
            console.error("Exception during items insertion:", itemsInsertError);
            sonnerToast.error("Bon de commande créé mais erreur lors de l'ajout des articles");
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
