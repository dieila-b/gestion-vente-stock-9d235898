
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Plus } from "lucide-react";
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
import { toast } from "sonner";

export default function MainStock() {
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("_all");
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();
  const { data: stockItems = [], isLoading } = useWarehouseStock(selectedWarehouse, false);

  const { data: warehouses = [] } = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warehouses')
        .select('id, name, location, surface, capacity, manager, status, occupied')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const filteredItems = stockItems.filter((item) => {
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

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Référence</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Article</TableHead>
                <TableHead>Entrepôt</TableHead>
                <TableHead className="text-right">Quantité</TableHead>
                <TableHead className="text-right">Prix unitaire</TableHead>
                <TableHead className="text-right">Valeur totale</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    Chargement des données...
                  </TableCell>
                </TableRow>
              ) : filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    Aucun article trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.product?.reference}</TableCell>
                    <TableCell>{item.product?.category}</TableCell>
                    <TableCell className="font-medium">
                      {item.product?.name}
                    </TableCell>
                    <TableCell>{item.warehouse?.name}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">
                      {item.unit_price.toLocaleString('fr-FR')} GNF
                    </TableCell>
                    <TableCell className="text-right">
                      {item.total_value.toLocaleString('fr-FR')} GNF
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
