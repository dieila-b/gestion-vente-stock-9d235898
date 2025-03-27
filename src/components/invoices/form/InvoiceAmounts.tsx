
import { Input } from "@/components/ui/input";

interface InvoiceAmountsProps {
  formData: {
    amount: string;
    discount: string;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  calculateVAT: () => string;
  calculateTotal: () => string;
}

export const InvoiceAmounts = ({ 
  formData, 
  onInputChange, 
  calculateVAT, 
  calculateTotal 
}: InvoiceAmountsProps) => {
  return (
    <>
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Montant (GNF)</label>
        <Input
          name="amount"
          type="number"
          value={formData.amount}
          onChange={onInputChange}
          className="enhanced-glass"
          placeholder="0"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Remise (GNF)</label>
        <Input
          name="discount"
          type="number"
          value={formData.discount}
          onChange={onInputChange}
          className="enhanced-glass"
          placeholder="0"
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Montant TVA</label>
        <Input
          value={calculateVAT()}
          readOnly
          className="enhanced-glass bg-white/5 cursor-not-allowed"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Total TTC</label>
        <Input
          value={calculateTotal()}
          readOnly
          className="enhanced-glass bg-white/5 cursor-not-allowed font-bold text-lg"
        />
      </div>
    </>
  );
};
