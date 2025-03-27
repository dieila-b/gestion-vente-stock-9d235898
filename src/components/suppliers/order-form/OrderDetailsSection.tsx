
import type { Supplier } from "@/types/supplier";
import { SupplierInfo } from "./SupplierInfo";
import { OrderStatusSelect } from "./OrderStatusSelect";
import { PaymentStatusSelect } from "./PaymentStatusSelect";

interface OrderDetailsSectionProps {
  supplier: Supplier;
  deliveryDate: string;
  orderStatus: "pending" | "delivered";
  paymentStatus: "pending" | "partial" | "paid";
  onDeliveryDateChange: (date: string) => void;
  onOrderStatusChange: (status: "pending" | "delivered") => void;
  onPaymentStatusChange: (status: "pending" | "partial" | "paid") => void;
}

export const OrderDetailsSection = ({
  supplier,
  deliveryDate,
  orderStatus,
  paymentStatus,
  onDeliveryDateChange,
  onOrderStatusChange,
  onPaymentStatusChange,
}: OrderDetailsSectionProps) => {
  return (
    <div className="space-y-6">
      <SupplierInfo
        supplier={supplier}
        deliveryDate={deliveryDate}
        onDeliveryDateChange={onDeliveryDateChange}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PaymentStatusSelect
          value={paymentStatus}
          onChange={onPaymentStatusChange}
        />
        <OrderStatusSelect
          value={orderStatus}
          onChange={onOrderStatusChange}
        />
      </div>
    </div>
  );
};
