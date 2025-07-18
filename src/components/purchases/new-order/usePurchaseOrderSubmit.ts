
import { FormEvent } from "react";
import { NavigateFunction } from "react-router-dom";
import { PurchaseOrderItem } from "@/types/purchase-order";
import { toast as sonnerToast } from "sonner";
import { useCreatePurchaseOrder } from "@/hooks/purchase-orders/mutations/use-create-purchase-order";
import { supabase } from "@/integrations/supabase/client";
import { isObject } from "@/utils/type-utils";

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

    if (orderItems.length === 0) {
      sonnerToast.error("Veuillez ajouter au moins un produit");
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log("Création du bon de commande avec les données:", {
        supplier_id: supplier,
        order_number: orderNumber,
        items_count: orderItems.length,
      });

      // Calculer tous les montants
      const subtotal = calculateSubtotal();
      const taxAmount = calculateTax();
      const totalTTC = calculateTotalTTC();

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
        subtotal: subtotal,
        tax_amount: taxAmount,
        total_ttc: totalTTC,
        shipping_cost: shippingCost || 0,
        discount: discount || 0,
        total_amount: totalTTC,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Use the mutation hook to create the order
      const result = await createPurchaseOrderMutation.mutateAsync(orderData);
      
      // Extraire l'ID du purchase order du résultat
      let purchaseOrderId: string | null = null;
      
      if (result && typeof result === 'object') {
        if ('id' in result && result.id) {
          purchaseOrderId = String(result.id);
        }
      }
      
      console.log("Purchase order created with ID:", purchaseOrderId);

      if (purchaseOrderId && orderItems.length > 0) {
        // Préparer les éléments pour insertion avec des valeurs sûres pour JSON
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
            designation: item.designation || (item.product?.name || 'Produit sans nom'),
            created_at: new Date().toISOString()
          }));

        if (validOrderItems.length > 0) {
          console.log("Adding items to order:", validOrderItems);

          try {
            // Use the RPC function for items insertion
            const jsonSafeItems = JSON.parse(JSON.stringify(validOrderItems));
            console.log("Données d'éléments envoyées à RPC:", jsonSafeItems);
            
            const { data: itemsResult, error: itemsError } = await supabase.rpc(
              'bypass_insert_purchase_order_items',
              { items_data: jsonSafeItems }
            );

            if (itemsError) {
              console.error("Error inserting items via RPC:", itemsError);
              
              // Fallback to direct insertion
              const { error: directItemsError } = await supabase
                .from('purchase_order_items')
                .insert(validOrderItems);
                
              if (directItemsError) {
                console.error("Direct insertion of items failed:", directItemsError);
                sonnerToast.error(`Erreur lors de l'ajout des produits: ${directItemsError.message}`);
              } else {
                console.log("Items added successfully via direct insertion");
              }
            } else {
              console.log("Items added successfully via RPC:", itemsResult);
            }
          } catch (error) {
            console.error("Error adding order items:", error);
            sonnerToast.error(`Erreur lors de l'ajout des produits: ${(error as Error).message}`);
            // Continue with navigation even if items insertion fails
          }
        }

        sonnerToast.success("Bon de commande créé avec succès");
        navigate("/purchase-orders");
      } else {
        throw new Error("Échec de la création du bon de commande - aucun ID de commande retourné");
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
