
import { FormEvent } from "react";
import { NavigateFunction } from "react-router-dom";
import { PurchaseOrderItem } from "@/types/purchaseOrder";
import { supabase } from "@/integrations/supabase/client";

interface UsePurchaseOrderSubmitProps {
  supplier: string;
  orderNumber: string;
  deliveryDate: string;
  warehouseId: string;
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
  calculateTotal: () => number;
  setIsSubmitting: (value: boolean) => void;
  toast: any;
  handleCreate: any;
  navigate: NavigateFunction;
}

export const usePurchaseOrderSubmit = ({
  supplier,
  orderNumber,
  deliveryDate,
  warehouseId,
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
  calculateTotal,
  setIsSubmitting,
  toast,
  handleCreate,
  navigate
}: UsePurchaseOrderSubmitProps) => {

  // Calculs des montants
  const calculateSubtotal = () => {
    return calculateTotal();
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
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fournisseur",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Créer le bon de commande principal
      const purchaseOrderData = {
        supplier_id: supplier,
        order_number: orderNumber,
        expected_delivery_date: deliveryDate,
        warehouse_id: warehouseId || undefined,
        notes,
        status: orderStatus,
        total_amount: calculateTotal(),
        payment_status: paymentStatus,
        paid_amount: paidAmount,
        logistics_cost: logisticsCost,
        transit_cost: transitCost,
        tax_rate: taxRate,
        subtotal: calculateSubtotal(),
        tax_amount: calculateTax(),
        total_ttc: calculateTotalTTC(),
        shipping_cost: shippingCost,
        discount: discount
      };
      
      // Créer le bon de commande sans les items pour éviter l'erreur
      const createdOrder = await handleCreate(purchaseOrderData);
      
      // Si des items existent, les ajouter séparément
      if (orderItems.length > 0) {
        // Préparer les items pour l'insertion en base de données
        const itemsToInsert = orderItems.map(item => ({
          purchase_order_id: createdOrder.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          selling_price: item.selling_price,
          total_price: item.total_price
        }));

        // Insérer les items
        const { error: itemsError } = await supabase
          .from('purchase_order_items')
          .insert(itemsToInsert);

        if (itemsError) {
          throw itemsError;
        }
      }
      
      toast({
        title: "Succès",
        description: "Bon de commande créé avec succès",
      });
      
      navigate("/purchase-orders");
    } catch (error) {
      console.error("Erreur lors de la création du bon de commande:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création du bon de commande",
        variant: "destructive",
      });
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
