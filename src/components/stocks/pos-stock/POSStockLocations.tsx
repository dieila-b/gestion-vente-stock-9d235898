
import React from 'react';
import { POSLocation } from '@/types/pos-locations';
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { isSelectQueryError } from '@/utils/supabase-helpers';

interface POSStockLocationsProps {
  locations: POSLocation[];
  selectedLocation: string;
  onSelectLocation: (locationId: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const POSStockLocations = ({
  locations,
  selectedLocation,
  onSelectLocation,
  searchQuery,
  setSearchQuery
}: POSStockLocationsProps) => {
  // Filter locations by search query
  const filteredLocations = locations.filter(location => {
    // Handle potential SelectQueryError
    if (isSelectQueryError(location)) {
      return false;
    }
    
    const name = location.name?.toLowerCase() || '';
    const address = location.address?.toLowerCase() || '';
    const phone = location.phone?.toLowerCase() || '';
    
    return (
      name.includes(searchQuery.toLowerCase()) ||
      address.includes(searchQuery.toLowerCase()) ||
      phone.includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Rechercher un point de vente..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      <ScrollArea className="whitespace-nowrap rounded-md border">
        <div className="flex w-max space-x-4 p-4">
          <Card
            className={cn(
              "flex flex-col items-center justify-center w-[160px] h-[100px] rounded-lg overflow-hidden cursor-pointer transition-all",
              selectedLocation === "_all"
                ? "ring-2 ring-primary"
                : "ring-1 ring-transparent hover:ring-primary/50"
            )}
            onClick={() => onSelectLocation("_all")}
          >
            <CardContent className="flex flex-col items-center justify-center p-4">
              <div className="font-semibold">Tous les PDV</div>
              <div className="text-sm text-muted-foreground">Voir tous les stocks</div>
            </CardContent>
          </Card>

          {filteredLocations.map((location) => {
            // Skip any SelectQueryError entries
            if (isSelectQueryError(location)) {
              return null;
            }
            
            const isActive = location.is_active ?? true;
            
            return (
              <Card
                key={location.id}
                className={cn(
                  "flex flex-col items-center justify-center w-[160px] h-[100px] rounded-lg overflow-hidden cursor-pointer transition-all",
                  selectedLocation === location.id
                    ? "ring-2 ring-primary"
                    : "ring-1 ring-transparent hover:ring-primary/50",
                  !isActive && "opacity-60"
                )}
                onClick={() => onSelectLocation(location.id)}
              >
                <CardContent className="flex flex-col items-center justify-center p-4">
                  <div className="font-semibold line-clamp-1">{location.name}</div>
                  <div className="text-xs text-muted-foreground text-center line-clamp-1">
                    {location.address || "Adresse non spécifiée"}
                  </div>
                  <div className={cn(
                    "text-xs mt-1 px-2 py-0.5 rounded-full",
                    location.status === "active" ? "bg-green-100 text-green-800" : 
                    location.status === "closed" ? "bg-red-100 text-red-800" : 
                    "bg-yellow-100 text-yellow-800"
                  )}>
                    {location.status || (isActive ? "Actif" : "Inactif")}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};
