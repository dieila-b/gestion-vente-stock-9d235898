
import { Button } from "@/components/ui/button";
import { Save, FileType, Send } from "lucide-react";
import { formatGNF } from "@/lib/currency";

interface QuoteActionsProps {
  total: number;
  onSave: (e: React.FormEvent) => void;
  onGeneratePDF: () => void;
  onSend: () => void;
}

export function QuoteActions({ total, onSave, onGeneratePDF, onSend }: QuoteActionsProps) {
  return (
    <div className="border-t border-white/10 pt-4">
      <div className="flex justify-between items-center text-lg font-semibold mb-6">
        <span>Total</span>
        <span className="text-gradient">{formatGNF(total)}</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button onClick={onSave} className="enhanced-glass hover:scale-105 transition-all duration-300 col-span-2">
          <Save className="mr-2 h-4 w-4" />
          Enregistrer
        </Button>
        <Button
          type="button"
          variant="outline"
          className="enhanced-glass hover:scale-105 transition-all duration-300"
          onClick={onGeneratePDF}
        >
          <FileType className="mr-2 h-4 w-4" />
          PDF
        </Button>
        <Button
          type="button"
          variant="outline"
          className="enhanced-glass hover:scale-105 transition-all duration-300"
          onClick={onSend}
        >
          <Send className="mr-2 h-4 w-4" />
          Envoyer
        </Button>
      </div>
    </div>
  );
}
