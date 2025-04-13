
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface WarehousesHeaderProps {
  onAddNew: () => void;
}

export function WarehousesHeader({ onAddNew }: WarehousesHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold">Entrepôts</h1>
        <p className="text-muted-foreground">
          Gérez vos entrepôts et espaces de stockage
        </p>
      </div>
      <Button onClick={onAddNew} className="glass-effect">
        <PlusCircle className="h-4 w-4 mr-2" />
        Nouvel entrepôt
      </Button>
    </div>
  );
}
