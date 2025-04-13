
import { Button } from "@/components/ui/button";
import { Map, Plus } from "lucide-react";

interface GeographicZonesHeaderProps {
  onAddClick: () => void;
}

export const GeographicZonesHeader = ({ onAddClick }: GeographicZonesHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="p-2 rounded-full bg-primary/10">
          <Map className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Zones Géographiques</h1>
          <p className="text-muted-foreground">
            Gérez les pays, régions, villes et zones d'entrepôt.
          </p>
        </div>
      </div>
      <Button onClick={onAddClick}>
        <Plus className="mr-2 h-4 w-4" />
        Nouvelle Zone
      </Button>
    </div>
  );
};
