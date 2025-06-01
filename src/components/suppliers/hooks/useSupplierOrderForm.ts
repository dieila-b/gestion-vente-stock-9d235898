
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Supplier } from "@/types/supplier";
import type { SupplierOrderProduct } from "@/types/supplierOrder";
import type { Toast } from "@/components/ui/use-toast";

interface UseSupplierOrderFormProps {
  supplier: Supplier;
  onClose: () => void;
  toast: {
    toast: (props: Toast) => void;
  };
}

export const useSupplierOrderForm = ({ supplier, onClose, toast }: UseSupplierOrderFormProps) => {
  const [selectedProducts, setSelectedProducts] = useState<SupplierOrderProduct[]>([]);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [discount, setDiscount] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [logisticsCost, setLogisticsCost] = useState(0);
  const [transitCost, setTransitCost] = useState(0);
  const [taxRate, setTaxRate] = useState(20);
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "partial" | "paid">("pending");
  const [orderStatus, setOrderStatus] = useState<"pending" | "delivered">("pending");
  const [paidAmount, setPaidAmount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculateSubTotal = () => {
    return selectedProducts.reduce((acc, p) => acc + p.totalPrice, 0);
  };

  const calculateTax = () => {
    const subtotal = calculateSubTotal();
    return (subtotal * taxRate) / 100;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubTotal();
    const tax = calculateTax();
    return subtotal + tax + shippingCost + logisticsCost + transitCost - discount;
  };

  const remainingAmount = calculateTotal() - paidAmount;

  const handlePaidAmountChange = (value: number) => {
    const total = calculateTotal();
    const newPaidAmount = Math.min(value, total);
    setPaidAmount(newPaidAmount);

    if (newPaidAmount <= 0) {
      setPaymentStatus("pending");
    } else if (newPaidAmount >= total) {
      setPaymentStatus("paid");
    } else {
      setPaymentStatus("partial");
    }
  };

  const handleAddProduct = (product: Partial<SupplierOrderProduct>) => {
    const newProduct: SupplierOrderProduct = {
      id: Math.random().toString(36).substr(2, 9),
      name: product.name || "",
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      category: product.category || "",
      reference: product.reference || "",
      status: "pending",
      qualityCheck: false,
    };
    setSelectedProducts([...selectedProducts, newProduct]);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const subtotal = calculateSubTotal();
      const tax = calculateTax();
      const total = calculateTotal();

      // Using Supabase directly to insert the order
      const { data: orderData, error: orderError } = await supabase
        .from('supplier_orders')
        .insert({
          supplier_id: supplier.id,
          order_number: `PO-${Date.now()}`,
          status: "draft",
          payment_status: paymentStatus,
          order_status: orderStatus,
          expected_delivery_date: deliveryDate,
          total_amount: total,
          paid_amount: paidAmount,
          remaining_amount: remainingAmount,
          notes,
          delivery_address: supplier.address,
          discount,
          shipping_cost: shippingCost,
          logistics_cost: logisticsCost,
          transit_cost: transitCost,
          tax_rate: taxRate,
          subtotal: subtotal,
          tax_amount: tax,
          total_ttc: total,
          quality_check_required: true,
        })
        .select()
        .single();

      if (orderError || !orderData) {
        throw new Error("Failed to create supplier order");
      }

      // Using Supabase directly to insert order products
      const { error: productsError } = await supabase
        .from('supplier_order_products')
        .insert(
          selectedProducts.map(product => ({
            order_id: orderData.id,
            name: product.name,
            quantity: product.quantity,
            unit_price: product.unitPrice,
            total_price: product.totalPrice,
            category: product.category,
            reference: product.reference,
            status: product.status,
            quality_check: product.qualityCheck,
          }))
        );

      if (productsError) {
        throw new Error("Failed to add products to order");
      }

      toast.toast({
        title: "Commande créée",
        description: "La commande a été enregistrée avec succès.",
      });
      onClose();
    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error);
      toast.toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de la commande.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    selectedProducts,
    deliveryDate,
    notes,
    discount,
    shippingCost,
    logisticsCost,
    transitCost,
    taxRate,
    paymentStatus,
    orderStatus,
    paidAmount,
    isSubmitting,
    calculateSubTotal,
    calculateTax,
    calculateTotal,
    remainingAmount,
    handlePaidAmountChange,
    handleAddProduct,
    setSelectedProducts,
    setDeliveryDate,
    setNotes,
    setDiscount,
    setShippingCost,
    setLogisticsCost,
    setTransitCost,
    setTaxRate,
    setPaymentStatus,
    setOrderStatus,
    handleSubmit,
    formatPrice,
  };
};
