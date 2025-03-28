
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useWarehouseStock } from "@/hooks/use-warehouse-stock";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatGNF } from "@/lib/currency";
import { cn } from "@/lib/utils";

export default function POSStock() {
  const [selectedLocation, setSelectedLocation] = useState<string>("_all");
  const [searchQuery, setSearchQuery] = useState("");
  const [warehouseSearchQuery, setWarehouseSearchQuery] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("_all");

  // Récupérer la liste des points de vente
  const { data: posLocations = [] } = useQuery({
    queryKey: ['pos-locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pos_locations')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const { data: stockItems = [], isLoading } = useWarehouseStock(selectedLocation, true);

  // Filtrer les articles en fonction de la recherche
  const filteredItems = stockItems.filter(item => 
    (item.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.product?.reference?.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (selectedWarehouse === "_all" || item.warehouse?.id === selectedWarehouse)
  );

  // Récupérer la liste des entrepôts
  const { data: warehouses = [] } = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warehouses')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  // Filtrer les entrepôts en fonction de la recherche
  const filteredWarehouses = warehouses.filter(warehouse =>
    warehouse.name.toLowerCase().includes(warehouseSearchQuery.toLowerCase()) ||
    warehouse.location.toLowerCase().includes(warehouseSearchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 lg:p-8 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gradient-to-r from-blue-500 to-purple-600">Stock PDV</h1>
            <p className="text-muted-foreground mt-2">
              Gestion du stock point de vente
            </p>
          </div>
          <Button className="glass-effect hover:neon-glow">
            Exporter les données
          </Button>
        </div>

        <Card className="enhanced-glass p-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gradient">
                Liste des PDV
              </h2>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input 
                    placeholder="Rechercher..." 
                    value={warehouseSearchQuery}
                    onChange={(e) => setWarehouseSearchQuery(e.target.value)}
                    className="pl-10 glass-effect"
                  />
                </div>
                <Button variant="outline" className="glass-effect">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrer
                </Button>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PDV</TableHead>
                    <TableHead>Localisation</TableHead>
                    <TableHead>Surface</TableHead>
                    <TableHead>Capacité</TableHead>
                    <TableHead>Occupation</TableHead>
                    <TableHead>Responsable</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWarehouses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10">
                        Aucun PDV trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredWarehouses.map((warehouse) => {
                      const occupancyRate = (warehouse.occupied / warehouse.capacity) * 100;
                      const isNearCapacity = occupancyRate >= 90;
                      const isOverCapacity = occupancyRate > 100;

                      return (
                        <TableRow key={warehouse.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <span className="inline-block">🏢</span>
                              {warehouse.name}
                            </div>
                          </TableCell>
                          <TableCell>{warehouse.location}</TableCell>
                          <TableCell>{warehouse.surface} m²</TableCell>
                          <TableCell>{warehouse.capacity} unités</TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>
                                  {Math.round(occupancyRate)}% ({warehouse.occupied}/{warehouse.capacity})
                                </span>
                              </div>
                              <div className="w-full bg-gray-700/30 rounded-full h-2.5">
                                <div 
                                  className={cn(
                                    "rounded-full h-2.5 transition-all duration-500",
                                    {
                                      'bg-gradient-to-r from-red-500 to-red-600': isOverCapacity,
                                      'bg-gradient-to-r from-yellow-500 to-orange-500': isNearCapacity && !isOverCapacity,
                                      'bg-gradient-to-r from-blue-500 to-purple-500': !isNearCapacity
                                    }
                                  )}
                                  style={{ 
                                    width: `${Math.min(occupancyRate, 100)}%`
                                  }}
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{warehouse.manager}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={warehouse.status === 'Actif' ? 'default' : 'secondary'}
                              className={warehouse.status === 'Actif' ? 'bg-purple-600' : ''}
                            >
                              {warehouse.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gradient">Liste des Articles</h2>
          <div className="flex justify-between items-center">
            <Select
              value={selectedWarehouse}
              onValueChange={setSelectedWarehouse}
              className="w-[220px]"
            >
              <SelectTrigger className="glass-effect">
                <SelectValue placeholder="Tous les entrepôts" />
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
                placeholder="Rechercher un article..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 glass-effect w-80"
              />
            </div>
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
                      <TableCell>{item.warehouse?.name || "Non assigné"}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        {formatGNF(item.unit_price)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatGNF(item.total_value)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
