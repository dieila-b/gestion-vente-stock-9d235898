
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ReturnReasonFieldProps {
  reason: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export function ReturnReasonField({ reason, onChange }: ReturnReasonFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="reason">Motif du retour</Label>
      <Textarea
        id="reason"
        name="reason"
        value={reason}
        onChange={onChange}
        placeholder="Produit défectueux, erreur de commande..."
        rows={2}
      />
    </div>
  );
}
