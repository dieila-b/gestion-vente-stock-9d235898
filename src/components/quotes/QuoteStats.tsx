
import { Card } from "@/components/ui/card";
import { FileText, Calendar, DollarSign } from "lucide-react";

interface QuoteStatsProps {
  quotes: any[];
  formatPrice: (price: number) => string;
}

export function QuoteStats({ quotes, formatPrice }: QuoteStatsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card className="enhanced-glass p-6 hover:scale-105 transition-all duration-300 cursor-pointer">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Total des devis</p>
            <p className="text-2xl font-bold text-gradient">{quotes?.length || 0}</p>
          </div>
          <FileText className="h-8 w-8 text-purple-400" />
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Ce mois</p>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full w-1/3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
          </div>
        </div>
      </Card>

      <Card className="enhanced-glass p-6 hover:scale-105 transition-all duration-300 cursor-pointer">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Devis en attente</p>
            <p className="text-2xl font-bold text-gradient">
              {quotes?.filter(quote => quote.status === 'draft').length || 0}
            </p>
          </div>
          <Calendar className="h-8 w-8 text-purple-400" />
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Cette semaine</p>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full w-1/2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
          </div>
        </div>
      </Card>

      <Card className="enhanced-glass p-6 hover:scale-105 transition-all duration-300 cursor-pointer">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Montant total</p>
            <p className="text-2xl font-bold text-gradient">
              {formatPrice(quotes?.reduce((acc, quote) => acc + (quote.amount || 0), 0) || 0)}
            </p>
          </div>
          <DollarSign className="h-8 w-8 text-purple-400" />
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Cette année</p>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full w-2/3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
          </div>
        </div>
      </Card>
    </div>
  );
}

