
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface FormNotesProps {
  value: string;
  onChange: (value: string) => void;
}

export const FormNotes = ({ value, onChange }: FormNotesProps) => {
  return (
    <div className="space-y-2">
      <Label>Notes et spécifications</Label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="neo-blur min-h-[100px]"
        placeholder="Ajoutez des détails sur les produits demandés..."
      />
    </div>
  );
};
