
import { useState } from "react";
import { PurchaseOrderItem } from "@/types/purchase-order";

export const usePurchaseOrderFormState = () => {
  // Basic form state
  const [supplier, setSupplier] = useState("");
  const [orderNumber, setOrderNumber] = useState(`BC-${new Date().toISOString().slice(0, 10)}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [notes, setNotes] = useState("");
  
  // Additional costs
  const [taxRate, setTaxRate] = useState(20);
  const [logisticsCost, setLogisticsCost] = useState(0);
  const [transitCost, setTransitCost] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  
  // Status and payment
  const [orderStatus, setOrderStatus] = useState<"pending" | "delivered">("pending");
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "partial" | "paid">("pending");
  const [paidAmount, setPaidAmount] = useState(0);
  
  // Order items
  const [orderItems, setOrderItems] = useState<PurchaseOrderItem[]>([]);

  return {
    supplier,
    setSupplier,
    orderNumber,
    setOrderNumber,
    deliveryDate,
    setDeliveryDate,
    notes,
    setNotes,
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
    orderStatus,
    setOrderStatus,
    paymentStatus,
    setPaymentStatus,
    paidAmount,
    setPaidAmount,
    orderItems,
    setOrderItems
  };
};
