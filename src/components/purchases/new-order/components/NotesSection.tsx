
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface NotesSectionProps {
  notes: string;
  setNotes: (value: string) => void;
}

export const NotesSection = ({
  notes,
  setNotes,
}: NotesSectionProps) => {
  return (
    <div className="space-y-2">
      <Label className="text-white/80">Notes et spécifications</Label>
      <Textarea
        placeholder="Ajoutez des détails sur les produits demandés..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="min-h-[100px] neo-blur border-white/10"
      />
    </div>
  );
};
