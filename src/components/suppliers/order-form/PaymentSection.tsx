
import { PaymentCounter } from "./PaymentCounter";

interface PaymentSectionProps {
  paidAmount: number;
  totalAmount: number;
  remainingAmount: number;
  onPaidAmountChange: (value: number) => void;
  formatPrice: (price: number) => string;
}

export const PaymentSection = ({
  paidAmount,
  totalAmount,
  remainingAmount,
  onPaidAmountChange,
  formatPrice,
}: PaymentSectionProps) => {
  return (
    <PaymentCounter
      paidAmount={paidAmount}
      totalAmount={totalAmount}
      remainingAmount={remainingAmount}
      onPaidAmountChange={onPaidAmountChange}
      formatPrice={formatPrice}
    />
  );
};
