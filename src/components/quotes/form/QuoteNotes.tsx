
import { Textarea } from "@/components/ui/textarea";

interface QuoteNotesProps {
  notes: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export function QuoteNotes({ notes, onChange }: QuoteNotesProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm text-muted-foreground">Notes</label>
      <Textarea
        name="notes"
        value={notes}
        onChange={onChange}
        className="enhanced-glass min-h-[100px]"
        placeholder="Notes ou conditions particulières..."
      />
    </div>
  );
}
