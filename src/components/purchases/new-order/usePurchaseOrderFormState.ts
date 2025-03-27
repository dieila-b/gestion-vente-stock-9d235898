
import { useState } from "react";

export const usePurchaseOrderFormState = () => {
  // Form state
  const [supplier, setSupplier] = useState("");
  const [orderNumber, setOrderNumber] = useState(`BC-${new Date().toISOString().slice(0, 10)}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [notes, setNotes] = useState("");
  
  // Nouveaux champs pour coûts additionnels
  const [taxRate, setTaxRate] = useState(20);
  const [logisticsCost, setLogisticsCost] = useState(0);
  const [transitCost, setTransitCost] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  
  // Nouveaux champs pour statut et paiement
  const [orderStatus, setOrderStatus] = useState<"pending" | "delivered">("pending");
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "partial" | "paid">("pending");
  const [paidAmount, setPaidAmount] = useState(0);

  return {
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
    setPaidAmount
  };
};
