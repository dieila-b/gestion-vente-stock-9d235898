
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { usePurchaseOrders } from "@/hooks/use-purchase-orders";
import { useProductSelection } from "@/hooks/use-product-selection";
import { supabase } from "@/integrations/supabase/client";

export const usePurchaseOrderForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { handleCreate } = usePurchaseOrders();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [supplier, setSupplier] = useState("");
  const [orderNumber, setOrderNumber] = useState(
    `BC-${new Date().toISOString().slice(0, 10)}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
  );
  const [deliveryDate, setDeliveryDate] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [notes, setNotes] = useState("");
  
  // Price related state
  const [taxRate, setTaxRate] = useState(20);
  const [logisticsCost, setLogisticsCost] = useState(0);
  const [transitCost, setTransitCost] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  
  // Products management with custom hook
  const productSelection = useProductSelection();
  
  // Calculations
  const calculateSubtotal = () => {
    return productSelection.calculateTotal();
  };

  const calculateTax = () => {
    return (calculateSubtotal() * taxRate) / 100;
  };

  const calculateTotalTTC = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax();
    return subtotal + tax + shippingCost + logisticsCost + transitCost - discount;
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
        status: 'draft' as 'draft' | 'pending' | 'delivered' | 'approved',
        total_amount: calculateSubtotal(),
        payment_status: 'pending' as 'pending' | 'partial' | 'paid',
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
      if (productSelection.orderItems.length > 0) {
        // Préparer les items pour l'insertion en base de données
        const itemsToInsert = productSelection.orderItems.map(item => ({
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
    // Form state
    supplier,
    setSupplier,
    orderNumber,
    setOrderNumber,
    deliveryDate,
    setDeliveryDate,
    warehouseId,
    setWarehouseId,
    notes,
    setNotes,
    
    // Price state
    taxRate,
    setTaxRate,
    logisticsCost,
    setLogisticsCost,
    transitCost,
    setTransitCost,
    discount,
    setDiscount,
    shippingCost,
    setShippingCost,
    
    // Calculations
    calculateSubtotal,
    calculateTax,
    calculateTotalTTC,
    
    // Form submission
    handleSubmit,
    isSubmitting,
    
    // Product selection
    productSelection
  };
};
