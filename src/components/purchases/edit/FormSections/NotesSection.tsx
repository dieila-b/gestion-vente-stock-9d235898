
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface NotesSectionProps {
  notes: string;
  updateFormField: (field: string, value: any) => void;
}

export function NotesSection({ notes, updateFormField }: NotesSectionProps) {
  return (
    <div>
      <Label>Notes</Label>
      <Textarea 
        value={notes || ''}
        onChange={(e) => updateFormField('notes', e.target.value)}
        rows={3}
      />
    </div>
  );
}
