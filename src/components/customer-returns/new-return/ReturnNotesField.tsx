
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ReturnNotesFieldProps {
  notes: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export function ReturnNotesField({ notes, onChange }: ReturnNotesFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="notes">Notes (optionnel)</Label>
      <Textarea
        id="notes"
        name="notes"
        value={notes}
        onChange={onChange}
        placeholder="Notes supplémentaires..."
        rows={2}
      />
    </div>
  );
}
