
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { createTableQuery } from "./use-supabase-table-extension";

export interface POSLocation {
  id: string;
  name: string;
  address?: string;
  surface?: number;
  capacity?: number;
  occupied?: number;
  manager?: string;
  is_active?: boolean;
}

export function usePOSLocations() {
  const [activeRegister, setActiveRegister] = useState<string | null>(null);

  // Get all POS locations using the table extension hook
  const { data: posLocations = [], isLoading } = useQuery({
    queryKey: ["pos-locations"],
    queryFn: async () => {
      const { data, error } = await createTableQuery('pos_locations')
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      return data as POSLocation[] || [];
    },
  });

  // Set the active register from local storage
  useEffect(() => {
    const savedRegister = localStorage.getItem("activeRegister");
    if (savedRegister) {
      setActiveRegister(savedRegister);
    } else if (posLocations.length > 0) {
      // Default to first active POS location
      const defaultPOS = posLocations.find((pos) => pos.is_active) || posLocations[0];
      setActiveRegister(defaultPOS.id);
      localStorage.setItem("activeRegister", defaultPOS.id);
    }
  }, [posLocations]);

  // Change the active register
  const changeActiveRegister = (registerId: string) => {
    setActiveRegister(registerId);
    localStorage.setItem("activeRegister", registerId);
  };

  return {
    posLocations,
    activeRegister,
    changeActiveRegister,
    isLoading,
  };
}
