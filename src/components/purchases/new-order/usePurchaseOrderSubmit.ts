
import { FormEvent } from "react";
import { NavigateFunction } from "react-router-dom";
import { PurchaseOrderItem } from "@/types/purchase-order";
import { toast as sonnerToast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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

      // Préparation des données de commande
      const orderData = {
        supplier_id: supplier,
        order_number: orderNumber,
        expected_delivery_date: deliveryDate ? deliveryDate : new Date().toISOString(),
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
      
      // Essayons d'insérer avec des options différentes
      const { data: createdOrder, error } = await supabase
        .from('purchase_orders')
        .insert(orderData)
        .select('*')
        .single();
      
      if (error) {
        console.error("Error creating purchase order:", error);
        throw new Error(`Erreur de création: ${error.message}`);
      }
      
      if (!createdOrder) {
        throw new Error("Aucun bon de commande créé");
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
            designation: item.designation || item.product?.name || 'Produit sans nom'
          }));
        
        if (validOrderItems.length > 0) {
          console.log("Adding order items:", validOrderItems);
          
          try {
            // Insertion des articles en une seule opération
            const { error: itemsError } = await supabase
              .from('purchase_order_items')
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
