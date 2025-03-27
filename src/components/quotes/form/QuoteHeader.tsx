
import { Input } from "@/components/ui/input";

interface QuoteHeaderProps {
  quoteNumber: string;
  clientName: string;
  clientEmail: string;
  validityDate: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function QuoteHeader({ quoteNumber, clientName, clientEmail, validityDate, onChange }: QuoteHeaderProps) {
  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gradient">Nouveau Devis</h2>
        <div className="text-sm px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30">
          {quoteNumber}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Client</label>
          <Input
            name="clientName"
            value={clientName}
            onChange={onChange}
            className="enhanced-glass"
            placeholder="Nom du client"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Date de validité</label>
          <Input
            name="validityDate"
            type="date"
            value={validityDate}
            onChange={onChange}
            className="enhanced-glass"
            required
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm text-muted-foreground">Email du client</label>
          <Input
            name="clientEmail"
            type="email"
            value={clientEmail}
            onChange={onChange}
            className="enhanced-glass"
            placeholder="client@example.com"
          />
        </div>
      </div>
    </>
  );
}
