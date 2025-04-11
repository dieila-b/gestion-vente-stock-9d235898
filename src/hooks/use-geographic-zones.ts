
import { useQuery } from "@tanstack/react-query";
import { createTableQuery } from "./use-supabase-table-extension";
import { useState } from "react";
import { castOrDefault, safelyMapData } from "./use-error-handling";

export interface ParentZone {
  id: string;
  name: string;
  type: string;
}

export function useGeographicZones() {
  const [isCreatingZone, setIsCreatingZone] = useState(false);
  const [isEditingZone, setIsEditingZone] = useState(false);
  const [editingZone, setEditingZone] = useState<any>(null);

  // Using the createTableQuery helper to access the geographic_zones table
  const getGeographicZones = () => createTableQuery('geographic_zones');

  // Fetch all zones
  const { data: zones = [], isLoading: zonesLoading, refetch: refetchZones } = useQuery({
    queryKey: ['geographic-zones'],
    queryFn: async () => {
      const { data, error } = await getGeographicZones()
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch parent zones for dropdown
  const { data: parentZones = [], isLoading: parentZonesLoading } = useQuery({
    queryKey: ['parent-zones'],
    queryFn: async () => {
      const { data, error } = await getGeographicZones()
        .select('id, name, type')
        .eq('type', 'region')
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      // Cast the result to ParentZone[] or use an empty array if there's an error
      return castOrDefault<ParentZone[]>(data, []);
    }
  });

  // Create a new zone
  const createZone = async (zoneData: any) => {
    try {
      setIsCreatingZone(true);
      const { data, error } = await getGeographicZones().insert(zoneData).select().single();
      
      if (error) throw error;
      
      refetchZones();
      return data;
    } finally {
      setIsCreatingZone(false);
    }
  };

  // Update a zone
  const updateZone = async (id: string, zoneData: any) => {
    try {
      setIsEditingZone(true);
      const { data, error } = await getGeographicZones()
        .update(zoneData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      refetchZones();
      return data;
    } finally {
      setIsEditingZone(false);
    }
  };

  // Delete a zone
  const deleteZone = async (id: string) => {
    const { error } = await getGeographicZones().delete().eq('id', id);
    
    if (error) throw error;
    
    refetchZones();
  };

  return {
    zones,
    parentZones,
    zonesLoading,
    parentZonesLoading,
    isCreatingZone,
    isEditingZone,
    editingZone,
    setEditingZone,
    createZone,
    updateZone,
    deleteZone,
    refetchZones
  };
}
