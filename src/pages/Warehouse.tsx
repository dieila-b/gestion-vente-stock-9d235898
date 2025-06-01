
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { WarehouseStockList } from "@/components/warehouse/WarehouseStockList";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Package } from "lucide-react";
import { useState } from "react";

export default function Warehouse() {
  const [showForm, setShowForm] = useState(false);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gradient flex items-center gap-2">
              <Package className="h-8 w-8" />
              Gestion des Stocks
            </h1>
            <p className="text-muted-foreground">
              Gérez vos stocks par entrepôt et point de vente
            </p>
          </div>
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Ajuster Stock
          </Button>
        </div>

        <WarehouseStockList />
      </div>
    </DashboardLayout>
  );
}
