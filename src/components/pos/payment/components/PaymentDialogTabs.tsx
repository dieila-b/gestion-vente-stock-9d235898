
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaymentForm } from "../PaymentForm";
import { DeliveryForm } from "../DeliveryForm";

interface PaymentDialogTabsProps {
  defaultTab: string;
  onTabChange: (value: string) => void;
  totalAmount: number;
  amount: number;
  remainingAmount: number;
  paymentMethod: string;
  notes: string;
  onAmountChange: (value: number) => void;
  onPaymentMethodChange: (value: string) => void;
  onNotesChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  items: Array<{ id: string; name: string; quantity: number }>;
  fullyDelivered: boolean;
  partiallyDelivered: boolean;
  deliveryItems: Record<string, { delivered: boolean; quantity: number }>;
  onFullyDeliveredChange: (checked: boolean) => void;
  onPartiallyDeliveredChange: (checked: boolean) => void;
  onDeliveredChange: (checked: boolean, itemId: string) => void;
  onQuantityChange: (value: number, itemId: string) => void;
  isPaymentTabDisabled: boolean;
  isDeliveryTabDisabled: boolean;
}

export function PaymentDialogTabs({
  defaultTab,
  onTabChange,
  totalAmount,
  amount,
  remainingAmount,
  paymentMethod,
  notes,
  onAmountChange,
  onPaymentMethodChange,
  onNotesChange,
  items,
  fullyDelivered,
  partiallyDelivered,
  deliveryItems,
  onFullyDeliveredChange,
  onPartiallyDeliveredChange,
  onDeliveredChange,
  onQuantityChange,
  isPaymentTabDisabled,
  isDeliveryTabDisabled
}: PaymentDialogTabsProps) {
  return (
    <Tabs 
      defaultValue={defaultTab} 
      onValueChange={onTabChange}
      className="w-full"
    >
      <TabsList className="grid grid-cols-2 bg-gray-900 mb-4">
        <TabsTrigger 
          value="payment" 
          disabled={isPaymentTabDisabled}
          className="data-[state=active]:bg-gray-800"
        >
          Paiement
        </TabsTrigger>
        <TabsTrigger 
          value="delivery"
          disabled={isDeliveryTabDisabled}
          className="data-[state=active]:bg-gray-800"
        >
          Livraison
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="payment" className="space-y-4 px-2 bg-gray-950">
        <PaymentForm 
          totalAmount={totalAmount}
          amount={amount}
          remainingAmount={remainingAmount}
          paymentMethod={paymentMethod}
          notes={notes}
          onAmountChange={onAmountChange}
          onPaymentMethodChange={onPaymentMethodChange}
          onNotesChange={onNotesChange}
          disabled={isPaymentTabDisabled}
        />
      </TabsContent>
      
      <TabsContent value="delivery" className="space-y-4 px-2 bg-gray-950">
        <DeliveryForm 
          items={items}
          fullyDelivered={fullyDelivered}
          partiallyDelivered={partiallyDelivered}
          deliveryItems={deliveryItems}
          onFullyDeliveredChange={onFullyDeliveredChange}
          onPartiallyDeliveredChange={onPartiallyDeliveredChange}
          onDeliveredChange={onDeliveredChange}
          onQuantityChange={onQuantityChange}
        />
      </TabsContent>
    </Tabs>
  );
}
