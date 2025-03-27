
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface NotesSectionProps {
  notes: string;
  setNotes: (notes: string) => void;
}

export const NotesSection = ({ notes, setNotes }: NotesSectionProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="notes">Notes</Label>
      <Textarea
        id="notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Informations complémentaires..."
        rows={4}
      />
    </div>
  );
};
