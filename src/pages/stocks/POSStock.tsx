
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Search } from "lucide-react";
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
import { safeProduct, safePOSLocation } from "@/utils/supabase-safe-query";

export default function POSStock() {
  const [selectedLocation, setSelectedLocation] = useState<string>("_all");
  const [searchQuery, setSearchQuery] = useState("");

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

  // Filtrer les articles en fonction de la recherche avec gestion sécurisée
  const filteredItems = stockItems.filter(item => {
    const product = safeProduct(item.product);
    return product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           product.reference?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 lg:p-8 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gradient">Stock PDV</h1>
            <p className="text-muted-foreground mt-2">
              Gestion du stock point de vente
            </p>
          </div>
        </div>

        <Card className="enhanced-glass p-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gradient">
                Liste des Articles {selectedLocation !== "_all" && `- ${posLocations.find(loc => loc.id === selectedLocation)?.name}`}
              </h2>
              <div className="flex gap-4">
                <Select
                  value={selectedLocation}
                  onValueChange={setSelectedLocation}
                >
                  <SelectTrigger className="w-[200px] glass-effect">
                    <SelectValue placeholder="Sélectionner un PDV" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all">Tous les PDV</SelectItem>
                    {posLocations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
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
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Article</TableHead>
                    <TableHead>Référence</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>PDV</TableHead>
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
                    filteredItems.map((item) => {
                      const product = safeProduct(item.product);
                      const posLocation = safePOSLocation(item.pos_location);
                      
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            {product.name}
                          </TableCell>
                          <TableCell>{product.reference}</TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>{posLocation.name || "Non assigné"}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">
                            {item.unit_price?.toLocaleString('fr-FR')} GNF
                          </TableCell>
                          <TableCell className="text-right">
                            {item.total_value?.toLocaleString('fr-FR')} GNF
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
      </div>
    </DashboardLayout>
  );
}
