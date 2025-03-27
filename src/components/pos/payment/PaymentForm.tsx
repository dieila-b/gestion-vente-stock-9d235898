
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { formatGNF } from "@/lib/currency";
import { useEffect, useRef } from "react";
import { FormattedNumberInput } from "@/components/ui/formatted-number-input";

interface PaymentFormProps {
  totalAmount: number;
  amount: number;
  remainingAmount: number;
  paymentMethod: string;
  notes?: string;
  onAmountChange: (value: number) => void;
  onPaymentMethodChange: (value: string) => void;
  onNotesChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
}

export function PaymentForm({
  totalAmount,
  amount,
  remainingAmount,
  paymentMethod,
  notes,
  onAmountChange,
  onPaymentMethodChange,
  onNotesChange,
  disabled = false
}: PaymentFormProps) {
  // Reference to the amount input
  const amountInputRef = useRef<HTMLInputElement>(null);

  // Focus and select all text when the component mounts
  useEffect(() => {
    if (amountInputRef.current) {
      amountInputRef.current.select();
    }
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <Label htmlFor="total-amount" className="text-gray-300">Montant total:</Label>
        <span className="font-medium text-white">{formatGNF(totalAmount)}</span>
      </div>
      
      <div className="flex items-center justify-between mb-2">
        <Label htmlFor="remaining" className="text-amber-500 font-medium">Reste à payer:</Label>
        <span className={`font-medium ${remainingAmount <= 0 ? 'text-green-500' : 'text-amber-500'}`}>
          {formatGNF(remainingAmount)}
        </span>
      </div>
      
      <div>
        <Label htmlFor="payment-amount" className="text-gray-300">Montant payé:</Label>
        <FormattedNumberInput
          id="payment-amount"
          value={amount}
          onChange={onAmountChange}
          className="mt-1 bg-gray-900 border-gray-700 text-white"
          disabled={disabled}
          ref={amountInputRef}
        />
      </div>
      
      <div>
        <Label className="text-gray-300">Méthode de paiement:</Label>
        <RadioGroup 
          value={paymentMethod} 
          onValueChange={onPaymentMethodChange}
          className="mt-2"
          disabled={disabled}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="cash" id="cash" disabled={disabled} className="text-purple-500 border-gray-600" />
            <Label htmlFor="cash" className="text-gray-300">Espèces</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="card" id="card" disabled={disabled} className="text-purple-500 border-gray-600" />
            <Label htmlFor="card" className="text-gray-300">Carte</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="transfer" id="transfer" disabled={disabled} className="text-purple-500 border-gray-600" />
            <Label htmlFor="transfer" className="text-gray-300">Virement</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="mobile_money" id="mobile_money" disabled={disabled} className="text-purple-500 border-gray-600" />
            <Label htmlFor="mobile_money" className="text-gray-300">Mobile Money</Label>
          </div>
        </RadioGroup>
      </div>
      
      <div>
        <Label htmlFor="notes" className="text-gray-300">Notes:</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={onNotesChange}
          className="mt-1 bg-gray-900 border-gray-700 text-white min-h-20"
          disabled={disabled}
          placeholder="Ajouter des notes supplémentaires..."
        />
      </div>
    </div>
  );
}

