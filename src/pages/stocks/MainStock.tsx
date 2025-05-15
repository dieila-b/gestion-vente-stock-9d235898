
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Plus, RefreshCw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWarehouseStock } from "@/hooks/use-warehouse-stock";
import { toast } from "@/components/ui/use-toast";
import { formatGNF } from "@/lib/currency";
import { Skeleton } from "@/components/ui/skeleton";
import { StockTable } from "@/components/stocks/StockTable";
import { StockItem } from "@/hooks/useStockStatistics";

export default function MainStock() {
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("_all");
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();
  
  // This will get stock data from warehouse_stock table
  const { 
    data: stockItems = [], 
    isLoading,
    refetch 
  } = useWarehouseStock(selectedWarehouse, false);

  const { data: warehouses = [] } = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warehouses')
        .select('id, name, location, surface, capacity, manager, status, occupied')
        .order('name');
      
      if (error) throw error;
      
      // Si aucun entrepôt n'est trouvé, créer un entrepôt par défaut
      if (!data || data.length === 0) {
        const { data: newWarehouse, error: createError } = await supabase
          .from('warehouses')
          .insert({
            name: 'Entrepôt Principal',
            location: 'Conakry',
            status: 'Actif'
          })
          .select();
          
        if (createError) {
          console.error("Failed to create default warehouse:", createError);
          return [];
        }
        return newWarehouse;
      }
      
      return data;
    },
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  const handleRefresh = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: ['warehouse-stock'] });
    toast({
      title: "Actualisation en cours",
      description: "Les données de stock sont en cours d'actualisation.",
    });
  };

  // Transform warehouse stock data to match StockItem interface
  const transformedItems: StockItem[] = stockItems.map((item) => {
    return {
      id: item.id,
      warehouse_id: item.warehouse_id,
      // Use the warehouse name for the "name" property required by StockItem
      name: item.warehouse?.name || "Entrepôt inconnu",
      quantity: item.quantity,
      product: item.product,
      unit_price: item.unit_price,
      total_value: item.total_value
    };
  });

  const filteredItems = transformedItems.filter((item) => {
    const matchesWarehouse = selectedWarehouse === "_all" 
      ? true 
      : item.warehouse_id === selectedWarehouse;
    
    const matchesSearch = searchQuery.toLowerCase().trim() === "" 
      ? true 
      : (item.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         item.product?.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         item.product?.category?.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesWarehouse && matchesSearch;
  });

  console.log("Filtered stock items:", filteredItems);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gradient">Stock Principal</h1>
          <p className="text-muted-foreground mt-2">
            Gestion du stock principal
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            className="glass-effect hover:neon-glow flex gap-2 items-center"
            onClick={handleRefresh}
          >
            <RefreshCw className="h-4 w-4" /> Actualiser
          </Button>
          <Button className="glass-effect hover:neon-glow">
            Exporter les données
          </Button>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gradient mb-6">
          {selectedWarehouse === "_all" 
            ? "Liste des Articles" 
            : `Liste des Articles - ${warehouses.find(w => w.id === selectedWarehouse)?.name || ""}`}
        </h2>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Select
            value={selectedWarehouse}
            onValueChange={setSelectedWarehouse}
          >
            <SelectTrigger className="w-[200px] glass-effect">
              <SelectValue placeholder="Sélectionner un entrepôt" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">Tous les entrepôts</SelectItem>
              {warehouses.map((warehouse) => (
                <SelectItem key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <StockTable items={filteredItems} />
        )}
      </div>
    </div>
  );
}
