
import React from "react";

export function WarehousesHeader() {
  return (
    <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gradient">Entrepôts & PDV</h1>
        <p className="text-muted-foreground">Gestion des entrepôts et points de vente</p>
      </div>
    </div>
  );
}
