
import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface WarehousesHeaderProps {
  activeTab: string;
  onAddNew: () => void;
}

export function WarehousesHeader({ activeTab, onAddNew }: WarehousesHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">Entrepôts & PDV</h1>
        <p className="text-muted-foreground">Gestion des entrepôts et points de vente</p>
      </div>
      <div className="flex gap-2">
        <Button className="glass-effect hover:neon-glow" onClick={onAddNew}>
          <PlusCircle className="h-4 w-4 mr-2" />
          {activeTab === "warehouses" ? "Ajouter un entrepôt" : "Ajouter un point de vente"}
        </Button>
      </div>
    </div>
  );
}
