
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface WarehousesHeaderProps {
  onAddNew?: () => void;
}

export function WarehousesHeader({ onAddNew }: WarehousesHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gradient">Entrepôts</h1>
        <p className="text-muted-foreground">Gestion des entrepôts de stockage</p>
      </div>
      
      {onAddNew && (
        <Button 
          onClick={onAddNew}
          className="glass-effect hover:neon-glow"
        >
          <Plus className="h-4 w-4 mr-2" /> 
          Ajouter un entrepôt
        </Button>
      )}
    </div>
  );
}
