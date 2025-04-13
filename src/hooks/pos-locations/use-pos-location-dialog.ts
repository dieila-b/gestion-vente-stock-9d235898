
import { useState } from "react";
import { POSLocation } from "@/types/pos-locations";

export function usePOSLocationDialog() {
  const [selectedLocation, setSelectedLocation] = useState<POSLocation | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  return {
    selectedLocation,
    setSelectedLocation,
    isAddDialogOpen,
    setIsAddDialogOpen,
    closeEditDialog: () => setIsAddDialogOpen(false)
  };
}
