
import { Button } from "@/components/ui/button";

export function POSStockHeader() {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">Stock PDV</h1>
        <p className="text-muted-foreground mt-2">
          Gestion du stock point de vente
        </p>
      </div>
      <Button className="glass-effect hover:neon-glow">
        Exporter les données
      </Button>
    </div>
  );
}
