
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { WarehouseTable } from "./WarehouseTable";
import { useState } from "react";

interface Warehouse {
  id: string;
  name: string;
  location: string;
  surface: number;
  capacity: number;
  manager: string;
  status: string;
  occupied: number;
}

interface WarehouseListProps {
  warehouses: Warehouse[];
}

export function WarehouseList({ warehouses }: WarehouseListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredWarehouses = warehouses.filter(warehouse =>
    warehouse.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    warehouse.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    warehouse.manager.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="enhanced-glass p-6">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-lg font-semibold text-gradient">Liste des Entrepôts</h2>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Rechercher..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 glass-effect"
              />
            </div>
            <Button variant="outline" className="glass-effect">
              <Filter className="mr-2 h-4 w-4" />
              Filtrer
            </Button>
          </div>
        </div>

        <WarehouseTable warehouses={filteredWarehouses} />
      </div>
    </Card>
  );
}
