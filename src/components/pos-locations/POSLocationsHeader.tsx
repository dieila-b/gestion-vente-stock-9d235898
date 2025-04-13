
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface POSLocationsHeaderProps {
  onAddNew: () => void;
}

export function POSLocationsHeader({ onAddNew }: POSLocationsHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold">Points de Vente</h1>
        <p className="text-muted-foreground">
          Gérez les emplacements de vos points de vente
        </p>
      </div>
      <Button onClick={onAddNew} className="glass-effect">
        <PlusCircle className="h-4 w-4 mr-2" />
        Nouveau point de vente
      </Button>
    </div>
  );
}
