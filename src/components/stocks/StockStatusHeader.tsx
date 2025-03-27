
import { Button } from "@/components/ui/button";

export function StockStatusHeader() {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-4xl font-bold text-gradient">État des Stocks</h1>
        <p className="text-muted-foreground mt-2">
          Visualisation en temps réel de vos stocks
        </p>
      </div>
      <Button className="glass-effect hover:neon-glow">
        Exporter les données
      </Button>
    </div>
  );
}
