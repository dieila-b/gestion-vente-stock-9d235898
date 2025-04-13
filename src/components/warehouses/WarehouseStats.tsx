
import { Card } from "@/components/ui/card";
import { Warehouse, Archive, Building } from "lucide-react";

interface WarehouseStatsProps {
  totalWarehouses: number;
  totalCapacity: number;
  totalOccupied: number;
  occupationRate: number;
}

export function WarehouseStats({ 
  totalWarehouses, 
  totalCapacity, 
  totalOccupied, 
  occupationRate 
}: WarehouseStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="glass-panel p-4">
        <div className="flex justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total des Entrepôts</p>
            <h3 className="text-3xl font-bold mt-1">{totalWarehouses}</h3>
            <p className="text-xs text-green-500 mt-1">↑ 1.0%</p>
          </div>
          <div className="rounded-full p-3 bg-primary/10">
            <Warehouse className="h-6 w-6 text-primary" />
          </div>
        </div>
      </Card>
      
      <Card className="glass-panel p-4">
        <div className="flex justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Capacité Totale</p>
            <h3 className="text-3xl font-bold mt-1">{totalCapacity} m³</h3>
            <p className="text-xs text-green-500 mt-1">↑ 5.0%</p>
          </div>
          <div className="rounded-full p-3 bg-primary/10">
            <Archive className="h-6 w-6 text-primary" />
          </div>
        </div>
      </Card>
      
      <Card className="glass-panel p-4">
        <div className="flex justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Taux d'Occupation</p>
            <h3 className="text-3xl font-bold mt-1">{occupationRate}%</h3>
            <p className="text-xs text-amber-500 mt-1">↑ 3.0%</p>
          </div>
          <div className="rounded-full p-3 bg-primary/10">
            <Building className="h-6 w-6 text-primary" />
          </div>
        </div>
      </Card>
    </div>
  );
}
