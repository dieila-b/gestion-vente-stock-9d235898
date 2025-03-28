
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Building2, Search, Store, Warehouse } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { POSLocationsTable } from "@/components/pos-locations/POSLocationsTable";
import { POSLocation } from "@/types/pos-locations";

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

export default function Warehouses() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("warehouses");

  // Fetch warehouses data
  const { data: warehouses = [] } = useQuery<Warehouse[]>({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warehouses')
        .select('id, name, location, surface, capacity, manager, status, occupied')
        .order('name');
      
      if (error) throw error;
      return data as Warehouse[];
    }
  });

  // Fetch POS locations data
  const { data: posLocations = [] } = useQuery<POSLocation[]>({
    queryKey: ['pos-locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pos_locations')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as POSLocation[];
    }
  });

  // Filter warehouses based on search query
  const filteredWarehouses = warehouses.filter(warehouse =>
    warehouse.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    warehouse.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    warehouse.manager.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter POS locations based on search query
  const filteredPOSLocations = posLocations.filter(location =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (location.manager && location.manager.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Calculate warehouse stats
  const totalWarehouses = warehouses.length;
  const totalSurface = warehouses.reduce((sum, w) => sum + w.surface, 0);
  const averageOccupancyRate = warehouses.length > 0 
    ? warehouses.reduce((sum, w) => sum + ((w.occupied / w.capacity) * 100), 0) / warehouses.length
    : 0;

  // Calculate POS locations stats
  const totalPOSLocations = posLocations.length;
  const totalPOSSurface = posLocations.reduce((sum, location) => sum + (location.surface || 0), 0);
  const averagePOSOccupancyRate = posLocations.length > 0 
    ? posLocations.reduce((sum, location) => 
        sum + ((location.occupied / location.capacity) * 100), 0) / posLocations.length
    : 0;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">
        <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gradient">Entrepôts & PDV</h1>
            <p className="text-muted-foreground">Gestion des entrepôts et points de vente</p>
          </div>
        </div>

        <Tabs defaultValue="warehouses" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="warehouses" className="flex items-center gap-2">
              <Warehouse className="h-4 w-4" />
              Entrepôts
            </TabsTrigger>
            <TabsTrigger value="pos" className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              Points de Vente
            </TabsTrigger>
          </TabsList>

          {/* Warehouses Tab Content */}
          <TabsContent value="warehouses" className="space-y-6">
            {/* Warehouse Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 enhanced-glass">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total Entrepôts</p>
                    <h2 className="text-3xl font-bold">{totalWarehouses}</h2>
                  </div>
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Building2 className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <div className="mt-4 text-sm text-green-500">↑ 2.0%</div>
              </Card>

              <Card className="p-6 enhanced-glass">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Surface Totale</p>
                    <h2 className="text-3xl font-bold">{totalSurface.toLocaleString()} m²</h2>
                  </div>
                  <div className="p-2 rounded-lg bg-primary/10">
                    <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 22H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3 22V11H11V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M13 22V6H21V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M5 11V7H9V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M15 6V2H19V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                <div className="mt-4 text-sm text-green-500">↑ 15.0%</div>
              </Card>

              <Card className="p-6 enhanced-glass">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Taux Occupation Moyen</p>
                    <h2 className="text-3xl font-bold">{Math.round(averageOccupancyRate)} %</h2>
                  </div>
                  <div className="p-2 rounded-lg bg-primary/10">
                    <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 20V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 20V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M6 20V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                <div className="mt-4 text-sm text-green-500">↑ 5.0%</div>
              </Card>
            </div>

            {/* Warehouse List */}
            <Card className="enhanced-glass p-6">
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <h2 className="text-lg font-semibold text-gradient">Liste des Entrepôts</h2>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input 
                      placeholder="Rechercher un entrepôt..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 glass-effect w-full md:w-60 lg:w-72"
                    />
                  </div>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
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
                            Aucun entrepôt trouvé
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
                                  <Building2 className="h-4 w-4" />
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
          </TabsContent>

          {/* POS Locations Tab Content */}
          <TabsContent value="pos" className="space-y-6">
            {/* POS Locations Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 enhanced-glass">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total PDV</p>
                    <h2 className="text-3xl font-bold">{totalPOSLocations}</h2>
                  </div>
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Store className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <div className="mt-4 text-sm text-green-500">↑ 2.0%</div>
              </Card>

              <Card className="p-6 enhanced-glass">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Surface Totale</p>
                    <h2 className="text-3xl font-bold">{totalPOSSurface.toLocaleString()} m²</h2>
                  </div>
                  <div className="p-2 rounded-lg bg-primary/10">
                    <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 22H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3 22V11H11V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M13 22V6H21V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M5 11V7H9V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M15 6V2H19V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                <div className="mt-4 text-sm text-green-500">↑ 15.0%</div>
              </Card>

              <Card className="p-6 enhanced-glass">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Taux Occupation Moyen</p>
                    <h2 className="text-3xl font-bold">{Math.round(averagePOSOccupancyRate)} %</h2>
                  </div>
                  <div className="p-2 rounded-lg bg-primary/10">
                    <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 20V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 20V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M6 20V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                <div className="mt-4 text-sm text-green-500">↑ 5.0%</div>
              </Card>
            </div>

            {/* POS Locations List */}
            <Card className="enhanced-glass p-6">
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <h2 className="text-lg font-semibold text-gradient">Liste des PDV</h2>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input 
                      placeholder="Rechercher un PDV..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 glass-effect w-full md:w-60 lg:w-72"
                    />
                  </div>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Adresse</TableHead>
                        <TableHead>Surface</TableHead>
                        <TableHead>Capacité</TableHead>
                        <TableHead>Occupation</TableHead>
                        <TableHead>Responsable</TableHead>
                        <TableHead>Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPOSLocations.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-10">
                            Aucun PDV trouvé
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredPOSLocations.map((location) => {
                          const occupancyRate = (location.occupied / location.capacity) * 100;
                          const isNearCapacity = occupancyRate >= 90;
                          const isOverCapacity = occupancyRate > 100;

                          return (
                            <TableRow key={location.id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <Store className="h-4 w-4" />
                                  {location.name}
                                </div>
                              </TableCell>
                              <TableCell>{location.address}</TableCell>
                              <TableCell>{location.surface} m²</TableCell>
                              <TableCell>{location.capacity} unités</TableCell>
                              <TableCell>
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span>
                                      {Math.round(occupancyRate)}% ({location.occupied}/{location.capacity})
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
                              <TableCell>{location.manager}</TableCell>
                              <TableCell>
                                <Badge 
                                  variant={location.status === 'Actif' ? 'default' : 'secondary'}
                                >
                                  {location.status}
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
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
